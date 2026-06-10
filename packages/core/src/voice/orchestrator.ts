/**
 * Platform-agnostic Gemini Live session orchestration.
 *
 * This is a faithful lift of the working web hook (`useGeminiLive.js`), with all
 * raw audio I/O delegated to an injected `AudioBridge` so the SAME orchestration
 * runs on web (AudioWorklet) and React Native (native PCM module).
 *
 * ⚠️  HARD CONSTRAINT: `GEMINI_SETUP`, `AUDIO`, and the message builders below are
 * the preserved Gemini configuration. They must match the original app byte-for-
 * byte. `voice.test.ts` asserts equality to a literal copy to catch accidental
 * edits. Do not "tidy" these values.
 */

/* ─────────────────────────── Frozen Gemini config ─────────────────────────── */

export const GEMINI_MODEL_LIVE = 'models/gemini-2.5-flash-native-audio-latest';
export const VOICE_NAME = 'Puck';

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
      silence_duration_ms: 400,
    },
  },
  input_audio_transcription: {},
  output_audio_transcription: {},
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

/** Build the full setup message, injecting the per-session system instruction. */
export function buildSetupMessage(systemInstruction: string): {
  setup: typeof GEMINI_SETUP & { system_instruction: { parts: { text: string }[] } };
} {
  return {
    setup: {
      ...GEMINI_SETUP,
      system_instruction: { parts: [{ text: systemInstruction }] },
    },
  };
}

/** Build a realtime audio-input message from a base64 PCM16/16 kHz chunk. */
export function buildRealtimeInputMessage(base64: string): {
  realtimeInput: { mediaChunks: { mimeType: string; data: string }[] };
} {
  return { realtimeInput: { mediaChunks: [{ mimeType: AUDIO.inputMimeType, data: base64 }] } };
}

/* ─────────────────────────── Server message parsing ───────────────────────── */

export type LiveEvent =
  | { type: 'setup_complete' }
  | { type: 'audio'; data: string }
  | { type: 'transcript'; speaker: 'learner' | 'ai'; text: string }
  | { type: 'turn_complete' }
  | { type: 'error'; message: string };

/**
 * Normalize one parsed Gemini server message into zero or more events.
 * Preserves the original handler semantics, including the camelCase/snake_case
 * transcription field variants.
 */
export function parseServerMessage(msg: unknown): LiveEvent[] {
  const events: LiveEvent[] = [];
  if (!msg || typeof msg !== 'object') return events;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = msg as any;

  if (m.setupComplete) {
    events.push({ type: 'setup_complete' });
    return events;
  }

  const apiErr = m.error || (Array.isArray(m) && m[0]?.error);
  if (apiErr) {
    events.push({ type: 'error', message: apiErr.message || 'Unknown API error' });
    return events;
  }

  const sc = m.serverContent;
  if (sc) {
    if (sc.modelTurn?.parts) {
      for (const part of sc.modelTurn.parts) {
        const mime = part?.inlineData?.mimeType;
        if (typeof mime === 'string' && mime.startsWith('audio/pcm')) {
          events.push({ type: 'audio', data: part.inlineData.data });
        }
      }
    }

    const inText: unknown = sc.inputTranscription?.text ?? sc.input_transcription?.text;
    if (typeof inText === 'string' && inText.trim()) {
      events.push({ type: 'transcript', speaker: 'learner', text: inText.trim() });
    }
    const outText: unknown = sc.outputTranscription?.text ?? sc.output_transcription?.text;
    if (typeof outText === 'string' && outText.trim()) {
      events.push({ type: 'transcript', speaker: 'ai', text: outText.trim() });
    }

    if (sc.turnComplete) events.push({ type: 'turn_complete' });
  }

  return events;
}

/* ─────────────────────────── Orchestrator ─────────────────────────── */

export type LiveStatus = 'idle' | 'connecting' | 'listening' | 'ai-speaking' | `error: ${string}`;

/** Platform-specific audio capture/playback, injected into the orchestrator. */
export interface AudioBridge {
  /** Begin mic capture; call `onChunk` with base64 PCM16/16 kHz frames. */
  startCapture(onChunk: (pcm16Base64: string) => void): Promise<void> | void;
  /** Play one base64 PCM16/24 kHz chunk from the model. */
  playPcm24Base64(base64: string): void;
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
}

export interface OrchestratorDeps {
  /** Performs the start-session → redeem-session token proxy and returns the WSS URL. */
  resolveWsUrl: () => Promise<string>;
  /** Opens a WebSocket-like connection to the resolved URL. */
  createSocket: (url: string) => LiveSocket;
  audio: AudioBridge;
  systemInstruction: string;
  callbacks?: OrchestratorCallbacks;
}

export class GeminiLiveOrchestrator {
  private socket: LiveSocket | null = null;
  private _status: LiveStatus = 'idle';

  constructor(private readonly deps: OrchestratorDeps) {}

  get status(): LiveStatus {
    return this._status;
  }

  private setStatus(status: LiveStatus): void {
    this._status = status;
    this.deps.callbacks?.onStatus?.(status);
  }

  async start(): Promise<void> {
    this.setStatus('connecting');

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
      socket.send(JSON.stringify(buildSetupMessage(this.deps.systemInstruction)));
    };
    socket.onmessage = (ev): void => {
      this.handleRaw(ev.data);
    };
    socket.onerror = (): void => {
      this.setStatus('error: WebSocket connection failed');
    };
    socket.onclose = (ev): void => {
      this.deps.audio.stop();
      if (this._status.startsWith('error')) return;
      if (ev.code !== 1000 && ev.code !== 1005) {
        this.setStatus(`error: Connection lost (code ${ev.code})`);
      } else {
        this.setStatus('idle');
      }
    };
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
      case 'setup_complete':
        try {
          await this.deps.audio.startCapture((b64) => {
            this.socket?.send(JSON.stringify(buildRealtimeInputMessage(b64)));
          });
          this.setStatus('listening');
        } catch (err) {
          this.setStatus(`error: ${(err as Error).message || 'Microphone unavailable'}`);
          this.socket?.close();
        }
        break;
      case 'audio':
        this.setStatus('ai-speaking');
        this.deps.audio.playPcm24Base64(evt.data);
        break;
      case 'transcript':
        this.deps.callbacks?.onTranscript?.({ speaker: evt.speaker, text: evt.text });
        break;
      case 'turn_complete':
        this.setStatus('listening');
        break;
      case 'error':
        this.setStatus(`error: ${evt.message}`);
        this.socket?.close();
        break;
    }
  }

  stop(): void {
    this.deps.audio.stop();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setStatus('idle');
  }
}
