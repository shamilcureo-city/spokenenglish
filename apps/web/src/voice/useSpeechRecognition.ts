/**
 * One-shot speech recognition for the "Say it" drill (redesign Phase 1).
 * Wraps the Web Speech API (webkitSpeechRecognition) — free, on-device-ish, and
 * supported by Chrome/Edge incl. Android (the India-dominant stack). Tuned to
 * en-IN so Indian-accented speech is recognised fairly, not penalised.
 *
 * Gracefully reports `supported=false` where the API is missing (e.g. Firefox,
 * some in-app browsers) so the drill can offer a skip.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/* Minimal typing — the DOM lib doesn't ship SpeechRecognition types. */
interface SRResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}
interface SR {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SRResultEvent) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
}
type SRCtor = new () => SR;

function getCtor(): SRCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface UseSpeechRecognition {
  supported: boolean;
  listening: boolean;
  /** Final transcript of the last attempt. */
  transcript: string;
  /** Live (interim) text while speaking. */
  interim: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  /** Discard the in-flight session immediately (no final result). */
  abort: () => void;
  reset: () => void;
}

export function useSpeechRecognition(lang = 'en-IN'): UseSpeechRecognition {
  const ctorRef = useRef<SRCtor | null>(getCtor());
  const recRef = useRef<SR | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* not started */
    }
  }, []);

  useEffect(() => () => recRef.current?.abort(), []);

  const start = useCallback(() => {
    const Ctor = ctorRef.current;
    if (!Ctor) {
      setError('unsupported');
      return;
    }
    setError(null);
    setTranscript('');
    setInterim('');
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i]!;
        const text = res[0]?.transcript ?? '';
        if (res.isFinal) finalText += text;
        else interimText += text;
      }
      if (finalText) setTranscript((prev) => (prev + ' ' + finalText).trim());
      setInterim(interimText);
    };
    rec.onerror = (e) => {
      setError(e.error || 'error');
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      setInterim('');
    };
    try {
      rec.start();
      setListening(true);
    } catch {
      setError('start-failed');
      setListening(false);
    }
  }, [lang]);

  const abort = useCallback(() => {
    try {
      recRef.current?.abort();
    } catch {
      /* not started */
    }
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterim('');
    setError(null);
  }, []);

  return {
    supported: ctorRef.current !== null,
    listening,
    transcript,
    interim,
    error,
    start,
    stop,
    abort,
    reset,
  };
}
