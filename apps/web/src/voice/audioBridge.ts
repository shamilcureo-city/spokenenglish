/**
 * Web AudioBridge — the platform-specific half of the voice pipeline. The mic
 * capture (AudioWorklet → base64 PCM16/16 kHz) and the 24 kHz playback are
 * lifted VERBATIM from the original `useGeminiLive.js`; only the structure
 * changed (it now implements the core `AudioBridge` interface so the shared
 * orchestrator drives it). React Native will provide the same interface natively.
 */

import { AUDIO, type AudioBridge } from '@fluentmap/core/voice';

/* ── PCM helpers (verbatim) ── */

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

      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await audioCtx.audioWorklet.addModule('/audio-processor.js');

      const micSource = audioCtx.createMediaStreamSource(stream);
      micSource.connect(analyser);

      const node = new AudioWorkletNode(audioCtx, AUDIO.workletProcessorName);
      worklet = node;
      node.port.onmessage = (event: MessageEvent<Float32Array>) => {
        onChunk(float32ToBase64(event.data));
      };
      micSource.connect(node);
    },

    playPcm24Base64(base64: string): void {
      const audioCtx = ctx;
      if (!audioCtx) return;

      const int16 = base64ToInt16Array(base64);
      const f32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) f32[i] = int16[i]! / 32768;

      const audioBuf = audioCtx.createBuffer(1, f32.length, AUDIO.outputSampleRate);
      audioBuf.getChannelData(0).set(f32);

      const src = audioCtx.createBufferSource();
      src.buffer = audioBuf;
      if (bridge.analyser) {
        src.connect(bridge.analyser);
        bridge.analyser.connect(audioCtx.destination);
      } else {
        src.connect(audioCtx.destination);
      }

      const t = Math.max(playbackTime, audioCtx.currentTime);
      src.start(t);
      playbackTime = t + audioBuf.duration;
    },

    stop(): void {
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
