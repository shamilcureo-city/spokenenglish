/**
 * Platform-agnostic Gemini Live session orchestration.
 *
 * Tuned to the Interloop "Alex" production guide (June 2026) — the hard-won
 * settings that make real-time voice feel human. Raw audio I/O is delegated to an
 * injected `AudioBridge` so the SAME orchestration runs on web and native.
 *
 * Key tuning (see `voice.test.ts` for the frozen config):
 *  - Live model `gemini-3.1-flash-live-preview` over a raw WebSocket (no SDK).
 *  - Mic sent as `realtime_input.audio` (the deprecated `media_chunks` is hard-
 *    rejected by 3.1 with a 1007 close).
 *  - VAD silence 800 ms so thinking pauses don't trigger a premature AI turn.
 *  - An OPENING trigger so the model greets + starts first (it only reacts to input).
 *  - Echo gate: the AudioBridge stops streaming the mic while the AI speaks, so the
 *    AI never hears itself and self-interrupts.
 *  - Session resumption + an 8-min proactive recycle so the ~10-min socket limit is
 *    invisible.
 */

/* ─────────────────────────── Frozen Gemini config ─────────────────────────── */

/** Live model. Rollback pin: 'models/gemini-2.5-flash-native-audio-preview-12-2025'. */
export const GEMINI_MODEL_LIVE = 'models/gemini-3.1-flash-live-preview';
export const VOICE_NAME = 'Puck';
/** Silence before the AI takes its turn. 800 ms is the tuned "feels natural" dial. */
export const VAD_SILENCE_MS = 800;

/** The exact `setup` payload (minus the per-session `system_instruction`). */
export const GEMINI_SETUP = {
  model: GEMINI_MODEL_LIVE,
  generation_config: {
    response_modalities: ['AUDIO'],
    speech_config: {
      voice_config: {
        prebuilt_voice_config: { voice_name: VOICE_NAME },
      },
    },
  },
  realtime_input_config: {
    automatic_activity_detection: {
      disabled: false,
      start_of_speech_sensitivity: 'START_SENSITIVITY_HIGH',
      end_of_speech_sensitivity: 'END_SENSITIVITY_LOW',
      silence_duration_ms: VAD_SILENCE_MS,
    },
  },
  input_audio_transcription: {},
  output_audio_transcription: {},
  session_resumption: {},
} as const;

/** Audio pipeline constants (PCM16; 16 kHz in, 24 kHz out). */
export const AUDIO = {
  inputSampleRate: 16000,
  outputSampleRate: 24000,
  audioContextSampleRate: 24000,
  inputMimeType: 'audio/pcm;rate=16000',
  workletProcessorName: 'pcm-processor',
  chunkSamples: 4096,
} as const;

/** Build the full setup message; optionally resume a prior session by handle. */
export function buildSetupMessage(
  systemInstruction: string,
  resumptionHandle?: string,
): { setup: Record<string, unknown> } {
  return {
    setup: {
      ...GEMINI_SETUP,
      system_instruction: { parts: [{ text: systemInstruction }] },
      ...(resumptionHandle ? { session_resumption: { handle: resumptionHandle } } : {}),
    },
  };
}

/** Build a realtime audio-input message from a base64 PCM16/16 kHz chunk. */
export function buildRealtimeInputMessage(base64: string): {
  realtime_input: { audio: { mime_type: string; data: string } };
} {
  return { realtime_input: { audio: { mime_type: AUDIO.inputMimeType, data: base64 } } };
}

/**
 * Build a text client-content turn. Two uses: (1) an OPENING trigger so the model
 * speaks first — it only responds to input, so without this both sides wait in
 * silence; (2) a typed learner reply when the mic is unavailable (text fallback).
 */
export function buildClientContentTurn(text: string): {
  clientContent: { turns: { role: 'user'; parts: { text: string }[] }[]; turnComplete: boolean };
} {
  return { clientContent: { turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true } };
}

/** Default nudge so the partner greets + starts instead of waiting for the user. */
export const OPENING_TRIGGER =
  "Let's begin now. Greet the learner warmly by name and kick things off — do not wait for them to speak first.";

/* ─────────────────────────── Server message parsing ───────────────────────── */

export type LiveEvent =
  | { type: 'setup_complete' }
  | { type: 'audio'; data: string }
  | { type: 'transcript'; speaker: 'learner' | 'ai'; text: string }
  | { type: 'turn_complete' }
  | { type: 'interrupted' }
  | { type: 'resumption_handle'; handle: string }
  | { type: 'go_away' }
  | { type: 'error'; message: string };

/**
 * Normalize one parsed Gemini server message into zero or more events. Handles
 * the camelCase/snake_case field variants, transcription fragments (appended
 * VERBATIM — a separator splits words at chunk boundaries), resumption handles,
 * and the pre-cutoff goAway warning.
 */
export function parseServerMessage(msg: unknown): LiveEvent[] {
  const events: LiveEvent[] = [];
  if (!msg || typeof msg !== 'object') return events;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = msg as any;

  if (m.setupComplete || m.setup_complete) {
    events.push({ type: 'setup_complete' });
    return events;
  }

  const apiErr = m.error || (Array.isArray(m) && m[0]?.error);
  if (apiErr) {
    events.push({ type: 'error', message: apiErr.message || 'Unknown API error' });
    return events;
  }

  // Gemini drops the socket at ~10 min; it usually warns first so we close NOW
  // and reconnect with the resumption handle.
  if (m.goAway || m.go_away) events.push({ type: 'go_away' });

  const resume = m.sessionResumptionUpdate || m.session_resumption_update;
  const handle = resume?.newHandle ?? resume?.new_handle;
  if (typeof handle === 'string' && handle) events.push({ type: 'resumption_handle', handle });

  const sc = m.serverContent || m.server_content;
  if (sc) {
    // Barge-in (rare with the echo gate): the model's turn was cut off.
    if (sc.interrupted) events.push({ type: 'interrupted' });

    if (sc.modelTurn?.parts) {
      for (const part of sc.modelTurn.parts) {
        const mime = part?.inlineData?.mimeType ?? part?.inline_data?.mime_type;
        const data = part?.inlineData?.data ?? part?.inline_data?.data;
        if (typeof mime === 'string' && mime.startsWith('audio/pcm') && typeof data === 'string') {
          events.push({ type: 'audio', data });
        }
      }
    }

    // Transcription fragments are appended VERBATIM (with their baked-in spaces).
    const inText: unknown = sc.inputTranscription?.text ?? sc.input_transcription?.text;
    if (typeof inText === 'string' && inText.length > 0) {
      events.push({ type: 'transcript', speaker: 'learner', text: inText });
    }
    const outText: unknown = sc.outputTranscription?.text ?? sc.output_transcription?.text;
    if (typeof outText === 'string' && outText.length > 0) {
      events.push({ type: 'transcript', speaker: 'ai', text: outText });
    }

    if (sc.turnComplete || sc.turn_complete) events.push({ type: 'turn_complete' });
  }

  return events;
}

/* ─────────────────────────── Orchestrator ─────────────────────────── */

export type LiveStatus = 'idle' | 'connecting' | 'listening' | 'ai-speaking' | `error: ${string}`;

/** Platform-specific audio capture/playback, injected into the orchestrator. */
export interface AudioBridge {
  /** Begin mic capture; call `onChunk` with base64 PCM16/16 kHz frames. */
  startCapture(onChunk: (pcm16Base64: string) => void): Promise<void> | void;
  /** Play one base64 PCM16/24 kHz chunk from the model (also closes the echo gate). */
  playPcm24Base64(base64: string): void;
  /** The AI's turn ended — reopen the echo gate once the playback tail finishes. */
  aiTurnComplete?(): void;
  /** Stop any queued playback immediately. */
  clearPlayback?(): void;
  /** Tear down capture + playback. */
  stop(): void;
  /** Optional analyser node for a visualizer (web only). */
  analyser?: unknown;
}

/** Minimal WebSocket surface (so a fake can drive the protocol in tests). */
export interface LiveSocket {
  send(data: string): void;
  close(code?: number, reason?: string): void;
  onopen: (() => void) | null;
  onmessage: ((ev: { data: unknown }) => void) | null;
  onerror: (() => void) | null;
  onclose: ((ev: { code: number; reason: string }) => void) | null;
}

export interface OrchestratorCallbacks {
  onStatus?(status: LiveStatus): void;
  onTranscript?(turn: { speaker: 'learner' | 'ai'; text: string }): void;
  /** Mic couldn't start (e.g. permission denied) — the session continues for text + playback. */
  onMicError?(message: string): void;
}

export interface OrchestratorDeps {
  /** Performs the start-session → redeem-session token proxy and returns the WSS URL. */
  resolveWsUrl: () => Promise<string>;
  /** Opens a WebSocket-like connection to the resolved URL. */
  createSocket: (url: string) => LiveSocket;
  audio: AudioBridge;
  systemInstruction: string;
  /** Optional override for the first-turn nudge (defaults to OPENING_TRIGGER). */
  openingTrigger?: string;
  callbacks?: OrchestratorCallbacks;
}

const RECYCLE_MS = 8 * 60 * 1000; // recycle the socket proactively under the ~10-min limit
const RECONNECT_DELAY_MS = 800;
const MAX_RETRIES = 5;

export class GeminiLiveOrchestrator {
  private socket: LiveSocket | null = null;
  private _status: LiveStatus = 'idle';

  // resilience state
  private resumptionHandle: string | null = null;
  private completed = false; // the user called stop()
  private reconnecting = false; // this open is a resume, not a fresh start
  private retryCount = 0;
  private recycleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly deps: OrchestratorDeps) {}

  get status(): LiveStatus {
    return this._status;
  }

  private setStatus(status: LiveStatus): void {
    this._status = status;
    this.deps.callbacks?.onStatus?.(status);
  }

  async start(): Promise<void> {
    this.completed = false;
    this.reconnecting = false;
    this.retryCount = 0;
    this.resumptionHandle = null;
    this.setStatus('connecting');
    await this.openSession();
  }

  private async openSession(): Promise<void> {
    let wsUrl: string;
    try {
      wsUrl = await this.deps.resolveWsUrl();
    } catch (err) {
      this.setStatus(`error: ${(err as Error).message}`);
      return;
    }

    const socket = this.deps.createSocket(wsUrl);
    this.socket = socket;

    socket.onopen = (): void => {
      socket.send(
        JSON.stringify(buildSetupMessage(this.deps.systemInstruction, this.resumptionHandle ?? undefined)),
      );
    };
    socket.onmessage = (ev): void => {
      this.handleRaw(ev.data);
    };
    socket.onerror = (): void => {
      // Let onclose drive the reconnect/error decision.
    };
    socket.onclose = (ev): void => {
      this.handleClose(ev);
    };
  }

  private handleClose(ev: { code: number; reason: string }): void {
    if (this.recycleTimer) {
      clearTimeout(this.recycleTimer);
      this.recycleTimer = null;
    }
    if (this.completed) {
      this.deps.audio.stop();
      return;
    }
    // Transient drop mid-session: resume the SAME session (we keep the mic + playback
    // running) with the saved handle. Only auto-resume when we have a handle, so we
    // never silently restart the conversation from scratch.
    if (this.resumptionHandle && this.retryCount < MAX_RETRIES) {
      this.retryCount += 1;
      this.reconnecting = true;
      // Reopen the echo gate: if the socket dropped mid-AI-turn, `turn_complete`
      // never arrives, so without this the mic stays gated (dead) after resume.
      this.deps.audio.clearPlayback?.();
      this.setStatus('connecting');
      const retry = setTimeout(() => {
        if (!this.completed) void this.openSession();
      }, RECONNECT_DELAY_MS);
      (retry as unknown as { unref?: () => void }).unref?.();
      return;
    }
    // No handle yet, or out of retries → end.
    this.deps.audio.stop();
    if (this._status.startsWith('error')) return;
    if (ev.code !== 1000 && ev.code !== 1005) {
      this.setStatus(`error: Connection lost (code ${ev.code})`);
    } else {
      this.setStatus('idle');
    }
  }

  private handleRaw(raw: unknown): void {
    let msg: unknown = raw;
    if (typeof raw === 'string') {
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }
    }
    for (const evt of parseServerMessage(msg)) void this.handleEvent(evt);
  }

  private async handleEvent(evt: LiveEvent): Promise<void> {
    switch (evt.type) {
      case 'setup_complete': {
        const resuming = this.reconnecting;
        this.reconnecting = false;
        if (!resuming) {
          // First connect: start the mic, then nudge the model to greet first.
          try {
            await this.deps.audio.startCapture((b64) => {
              this.socket?.send(JSON.stringify(buildRealtimeInputMessage(b64)));
            });
          } catch (err) {
            // Mic unavailable — keep the session open for text + playback.
            this.deps.callbacks?.onMicError?.((err as Error).message || 'Microphone unavailable');
          }
          this.socket?.send(
            JSON.stringify(buildClientContentTurn(this.deps.openingTrigger ?? OPENING_TRIGGER)),
          );
        }
        this.setStatus('listening');
        // Proactively recycle before Gemini's ~10-min cutoff.
        if (this.recycleTimer) clearTimeout(this.recycleTimer);
        this.recycleTimer = setTimeout(() => {
          if (!this.completed) this.socket?.close();
        }, RECYCLE_MS);
        (this.recycleTimer as unknown as { unref?: () => void }).unref?.();
        break;
      }
      case 'audio':
        this.setStatus('ai-speaking');
        this.deps.audio.playPcm24Base64(evt.data); // closes the echo gate
        break;
      case 'transcript':
        this.deps.callbacks?.onTranscript?.({ speaker: evt.speaker, text: evt.text });
        break;
      case 'turn_complete':
        // A completed turn = the session is demonstrably healthy → reset the retry
        // budget here (NOT on setup_complete, or a flapping socket reconnects forever).
        this.retryCount = 0;
        this.setStatus('listening');
        this.deps.audio.aiTurnComplete?.(); // reopen the echo gate after the tail
        break;
      case 'interrupted':
        this.deps.audio.clearPlayback?.();
        this.setStatus('listening');
        break;
      case 'resumption_handle':
        this.resumptionHandle = evt.handle;
        break;
      case 'go_away':
        // Gemini warns before the cutoff — close now so onclose resumes cleanly.
        this.socket?.close();
        break;
      case 'error':
        this.setStatus(`error: ${evt.message}`);
        this.completed = true;
        this.socket?.close();
        break;
    }
  }

  /** Send a typed learner turn (mic-free fallback). Surfaces it in the transcript too. */
  sendText(text: string): void {
    const t = text.trim();
    if (!t || !this.socket) return;
    this.deps.callbacks?.onTranscript?.({ speaker: 'learner', text: t });
    this.socket.send(JSON.stringify(buildClientContentTurn(t)));
  }

  stop(): void {
    this.completed = true;
    if (this.recycleTimer) {
      clearTimeout(this.recycleTimer);
      this.recycleTimer = null;
    }
    this.deps.audio.stop();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setStatus('idle');
  }
}
