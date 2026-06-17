/**
 * Web AudioBridge — the platform-specific half of the voice pipeline: mic capture
 * (AudioWorklet → base64 PCM16/16 kHz) and gapless 24 kHz playback, implementing
 * the core `AudioBridge` interface so the shared orchestrator drives it.
 *
 * ⭐ Echo gate (the "magic vs broken" fix from the Interloop guide): while the AI
 * is speaking we STOP streaming the mic, so the AI's own voice from the speakers
 * never feeds back and makes it interrupt itself. The gate is held until the
 * scheduled playback tail finishes + 100 ms, then reopens so the learner can talk.
 */

import { AUDIO, type AudioBridge } from '@fluentmap/core/voice';

/* ── PCM helpers ── */

function base64ToInt16Array(base64: string): Int16Array {
  const bin = window.atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}

function float32ToBase64(f32: Float32Array): string {
  const buf = new ArrayBuffer(f32.length * 2);
  const view = new DataView(buf);
  for (let i = 0; i < f32.length; i++) {
    const s = Math.max(-1, Math.min(1, f32[i]!));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!);
  return window.btoa(binary);
}

/**
 * Linear-resample a frame from `fromRate` to `toRate`. The capture AudioContext
 * runs at 24 kHz (to match playback), but Gemini Live expects 16 kHz mic audio —
 * so we down-sample here rather than sending 24 kHz samples mislabelled as 16 kHz
 * (which makes the learner's speech sound slowed-down to the model).
 */
function resample(frame: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate || frame.length === 0) return frame;
  const ratio = fromRate / toRate;
  const outLen = Math.floor(frame.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const src = i * ratio;
    const i0 = Math.floor(src);
    const i1 = Math.min(i0 + 1, frame.length - 1);
    const t = src - i0;
    out[i] = frame[i0]! * (1 - t) + frame[i1]! * t;
  }
  return out;
}

/** Encode mono Float32 PCM into a 16-bit WAV Blob (for "hear yourself" replay). */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buf);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]!));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: 'audio/wav' });
}

export interface WebAudioBridge extends AudioBridge {
  analyser: AnalyserNode | null;
  /** The learner's side of the session as a WAV blob (for "hear yourself"), or null. */
  getRecording(): Blob | null;
}

/** ~10 min cap on the in-memory recording, as a safety bound. */
const MAX_REC_SECONDS = 600;

export function createWebAudioBridge(onReady?: (analyser: AnalyserNode) => void): WebAudioBridge {
  let ctx: AudioContext | null = null;
  let stream: MediaStream | null = null;
  let worklet: AudioWorkletNode | null = null;
  let playbackTime = 0;
  const playing = new Set<AudioBufferSourceNode>();

  // Echo gate state.
  let aiSpeaking = false;
  let gateTimer: ReturnType<typeof setTimeout> | undefined;

  // "Hear yourself" recording: the learner's mic frames (only while the gate is
  // open, so the AI's voice is never captured), kept at the real capture rate.
  let recChunks: Float32Array[] = [];
  let recLen = 0;
  let recRate: number = AUDIO.inputSampleRate;

  const bridge: WebAudioBridge = {
    analyser: null,

    async startCapture(onChunk: (pcm16Base64: string) => void): Promise<void> {
      const audioCtx = new AudioContext({ sampleRate: AUDIO.audioContextSampleRate });
      ctx = audioCtx;
      playbackTime = audioCtx.currentTime;
      recChunks = [];
      recLen = 0;
      recRate = audioCtx.sampleRate; // the ACTUAL context rate (browser may not honour the request)

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      bridge.analyser = analyser;
      onReady?.(analyser);

      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: AUDIO.inputSampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      await audioCtx.audioWorklet.addModule('/audio-processor.js');

      const micSource = audioCtx.createMediaStreamSource(stream);
      micSource.connect(analyser);

      const node = new AudioWorkletNode(audioCtx, AUDIO.workletProcessorName);
      worklet = node;
      node.port.onmessage = (event: MessageEvent<Float32Array>) => {
        if (aiSpeaking) return; // echo gate: don't stream the mic while the AI speaks
        const frame = event.data;
        // Record the learner's side at the real rate (for replay).
        if (recLen < recRate * MAX_REC_SECONDS) {
          recChunks.push(frame.slice());
          recLen += frame.length;
        }
        // Send true 16 kHz to Gemini (down-sampled from the 24 kHz capture context).
        onChunk(float32ToBase64(resample(frame, audioCtx.sampleRate, AUDIO.inputSampleRate)));
      };
      micSource.connect(node);
    },

    playPcm24Base64(base64: string): void {
      const audioCtx = ctx;
      if (!audioCtx) return;

      // The AI is speaking → close the echo gate (cancel any pending reopen).
      aiSpeaking = true;
      if (gateTimer) {
        clearTimeout(gateTimer);
        gateTimer = undefined;
      }

      const int16 = base64ToInt16Array(base64);
      const f32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) f32[i] = int16[i]! / 32768;

      const audioBuf = audioCtx.createBuffer(1, f32.length, AUDIO.outputSampleRate);
      audioBuf.getChannelData(0).set(f32);

      const src = audioCtx.createBufferSource();
      src.buffer = audioBuf;
      playing.add(src);
      src.onended = () => playing.delete(src);
      // Play straight to the speakers. The mic-fed analyser is a metering TAP only
      // (for the visualizer) and is NEVER connected to destination — otherwise the
      // mic would be audible on the speakers and create an acoustic feedback loop.
      src.connect(audioCtx.destination);

      const t = Math.max(playbackTime, audioCtx.currentTime);
      src.start(t);
      playbackTime = t + audioBuf.duration; // scheduled end, for the gate release
    },

    aiTurnComplete(): void {
      const audioCtx = ctx;
      const remainingMs = audioCtx ? Math.max(0, (playbackTime - audioCtx.currentTime) * 1000) : 0;
      if (gateTimer) clearTimeout(gateTimer);
      // Hold the mic closed until the AI's tail has actually played (+100 ms safety),
      // so the tail never re-enters the stream and self-interrupts.
      gateTimer = setTimeout(() => {
        aiSpeaking = false;
        gateTimer = undefined;
      }, remainingMs + 100);
    },

    clearPlayback(): void {
      for (const src of playing) {
        try {
          src.onended = null;
          src.stop();
        } catch {
          /* already stopped */
        }
        src.disconnect();
      }
      playing.clear();
      if (ctx) playbackTime = ctx.currentTime;
      aiSpeaking = false;
      if (gateTimer) {
        clearTimeout(gateTimer);
        gateTimer = undefined;
      }
    },

    getRecording(): Blob | null {
      if (recLen === 0) return null;
      const merged = new Float32Array(recLen);
      let off = 0;
      for (const c of recChunks) {
        merged.set(c, off);
        off += c.length;
      }
      return encodeWav(merged, recRate);
    },

    stop(): void {
      bridge.clearPlayback?.();
      if (worklet) {
        worklet.disconnect();
        worklet = null;
      }
      if (stream) {
        stream.getTracks().forEach((tr) => tr.stop());
        stream = null;
      }
      if (ctx) {
        void ctx.close();
        ctx = null;
      }
      bridge.analyser = null;
    },
  };

  return bridge;
}
