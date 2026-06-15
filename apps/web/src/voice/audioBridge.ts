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

export interface WebAudioBridge extends AudioBridge {
  analyser: AnalyserNode | null;
}

export function createWebAudioBridge(onReady?: (analyser: AnalyserNode) => void): WebAudioBridge {
  let ctx: AudioContext | null = null;
  let stream: MediaStream | null = null;
  let worklet: AudioWorkletNode | null = null;
  let playbackTime = 0;
  const playing = new Set<AudioBufferSourceNode>();

  // Echo gate state.
  let aiSpeaking = false;
  let gateTimer: ReturnType<typeof setTimeout> | undefined;

  const bridge: WebAudioBridge = {
    analyser: null,

    async startCapture(onChunk: (pcm16Base64: string) => void): Promise<void> {
      const audioCtx = new AudioContext({ sampleRate: AUDIO.audioContextSampleRate });
      ctx = audioCtx;
      playbackTime = audioCtx.currentTime;

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
        onChunk(float32ToBase64(event.data));
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
