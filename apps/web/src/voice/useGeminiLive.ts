/**
 * React hook that drives a live Gemini session by wiring the shared core
 * `GeminiLiveOrchestrator` to the web audio bridge, the WebSocket adapter, and
 * the token proxy. UI components consume `{ status, transcript, elapsed,
 * analyser, start, stop }`.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { GeminiLiveOrchestrator, type LiveStatus } from '@fluentmap/core/voice';
import type { Turn } from '@fluentmap/core/conversation';
import { createWebAudioBridge, type WebAudioBridge } from './audioBridge';
import { createWebSocketAdapter } from './socket';
import { resolveWsUrl } from '../lib/api';

function mergeTurn(prev: Turn[], turn: { speaker: 'learner' | 'ai'; text: string }): Turn[] {
  const last = prev[prev.length - 1];
  if (last && last.speaker === turn.speaker) {
    // Append fragments VERBATIM — they carry their own spaces; a separator would
    // split words at chunk boundaries ("pro je c t").
    return [...prev.slice(0, -1), { speaker: last.speaker, text: last.text + turn.text }];
  }
  return [...prev, { speaker: turn.speaker, text: turn.text }];
}

export interface UseGeminiLive {
  status: LiveStatus;
  transcript: Turn[];
  elapsed: number;
  analyser: AnalyserNode | null;
  micBlocked: boolean;
  start: () => Promise<void>;
  stop: () => void;
  sendText: (text: string) => void;
  /** The learner's side of the just-finished session as a WAV blob, or null. */
  getRecording: () => Blob | null;
}

export function useGeminiLive(systemInstruction: string): UseGeminiLive {
  const [status, setStatus] = useState<LiveStatus>('idle');
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [micBlocked, setMicBlocked] = useState(false);

  const orchRef = useRef<GeminiLiveOrchestrator | null>(null);
  const bridgeRef = useRef<WebAudioBridge | null>(null);
  const startedAtRef = useRef<number | null>(null);

  // Session timer.
  useEffect(() => {
    const active = status === 'connecting' || status === 'listening' || status === 'ai-speaking';
    if (!active) return;
    const id = setInterval(() => {
      if (startedAtRef.current != null) {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 500);
    return () => clearInterval(id);
  }, [status]);

  // Tear down on unmount.
  useEffect(() => () => orchRef.current?.stop(), []);

  const start = useCallback(async () => {
    setTranscript([]);
    setElapsed(0);
    setAnalyser(null);
    setMicBlocked(false);
    startedAtRef.current = Date.now();

    const bridge = createWebAudioBridge((a) => setAnalyser(a));
    bridgeRef.current = bridge;
    const orch = new GeminiLiveOrchestrator({
      resolveWsUrl,
      createSocket: createWebSocketAdapter,
      audio: bridge,
      systemInstruction,
      callbacks: {
        onStatus: setStatus,
        onTranscript: (turn) => setTranscript((prev) => mergeTurn(prev, turn)),
        onMicError: () => setMicBlocked(true),
      },
    });
    orchRef.current = orch;
    await orch.start();
  }, [systemInstruction]);

  const stop = useCallback(() => {
    orchRef.current?.stop();
    orchRef.current = null;
    startedAtRef.current = null;
    setAnalyser(null);
  }, []);

  const sendText = useCallback((text: string) => {
    orchRef.current?.sendText(text);
  }, []);

  // Read the bridge's recording directly (not stored in state) so callers can grab
  // it at session end without an extra render. Survives stop() (chunks aren't cleared).
  const getRecording = useCallback(() => bridgeRef.current?.getRecording() ?? null, []);

  return { status, transcript, elapsed, analyser, micBlocked, start, stop, sendText, getRecording };
}
