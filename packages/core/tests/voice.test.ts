import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GEMINI_SETUP,
  GEMINI_MODEL_LIVE,
  VOICE_NAME,
  AUDIO,
  buildSetupMessage,
  buildRealtimeInputMessage,
  buildClientContentTurn,
  parseServerMessage,
  GeminiLiveOrchestrator,
  type AudioBridge,
  type LiveSocket,
  type LiveStatus,
} from '../src/voice/orchestrator.js';

/* ── Frozen-config guard: this literal IS the contract with the original app ── */

test('GEMINI_SETUP matches the preserved configuration byte-for-byte', () => {
  assert.deepEqual(GEMINI_SETUP, {
    model: 'models/gemini-3.1-flash-live-preview',
    generation_config: {
      response_modalities: ['AUDIO'],
      speech_config: {
        voice_config: {
          prebuilt_voice_config: { voice_name: 'Puck' },
        },
      },
    },
    realtime_input_config: {
      automatic_activity_detection: {
        disabled: false,
        start_of_speech_sensitivity: 'START_SENSITIVITY_HIGH',
        end_of_speech_sensitivity: 'END_SENSITIVITY_LOW',
        silence_duration_ms: 800,
      },
    },
    input_audio_transcription: {},
    output_audio_transcription: {},
    session_resumption: {},
  });
});

test('preserved audio constants (PCM16, 16 kHz in / 24 kHz out)', () => {
  assert.equal(GEMINI_MODEL_LIVE, 'models/gemini-3.1-flash-live-preview');
  assert.equal(VOICE_NAME, 'Puck');
  assert.equal(AUDIO.inputSampleRate, 16000);
  assert.equal(AUDIO.outputSampleRate, 24000);
  assert.equal(AUDIO.audioContextSampleRate, 24000);
  assert.equal(AUDIO.inputMimeType, 'audio/pcm;rate=16000');
  assert.equal(AUDIO.workletProcessorName, 'pcm-processor');
  assert.equal(AUDIO.chunkSamples, 4096);
});

test('buildSetupMessage injects system_instruction and preserves the frozen setup', () => {
  const msg = buildSetupMessage('You are a coach.');
  assert.deepEqual(msg.setup.system_instruction, { parts: [{ text: 'You are a coach.' }] });
  assert.equal(msg.setup.model, GEMINI_SETUP.model);
  assert.deepEqual(msg.setup.realtime_input_config, GEMINI_SETUP.realtime_input_config);
});

test('buildRealtimeInputMessage uses realtime_input.audio (not the deprecated media_chunks)', () => {
  assert.deepEqual(buildRealtimeInputMessage('BASE64'), {
    realtime_input: { audio: { mime_type: 'audio/pcm;rate=16000', data: 'BASE64' } },
  });
});

/* ── parseServerMessage ── */

test('parseServerMessage: setupComplete', () => {
  assert.deepEqual(parseServerMessage({ setupComplete: true }), [{ type: 'setup_complete' }]);
});

test('parseServerMessage: audio part → audio event', () => {
  const evts = parseServerMessage({
    serverContent: { modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm', data: 'AUD' } }] } },
  });
  assert.deepEqual(evts, [{ type: 'audio', data: 'AUD' }]);
});

test('parseServerMessage: transcription variants are emitted VERBATIM (spaces preserved)', () => {
  const camel = parseServerMessage({ serverContent: { inputTranscription: { text: 'great ' } } });
  assert.deepEqual(camel, [{ type: 'transcript', speaker: 'learner', text: 'great ' }]);
  const snake = parseServerMessage({ serverContent: { output_transcription: { text: 'yo' } } });
  assert.deepEqual(snake, [{ type: 'transcript', speaker: 'ai', text: 'yo' }]);
});

test('parseServerMessage: resumption handle and goAway', () => {
  assert.deepEqual(parseServerMessage({ sessionResumptionUpdate: { newHandle: 'H1', resumable: true } }), [
    { type: 'resumption_handle', handle: 'H1' },
  ]);
  assert.deepEqual(parseServerMessage({ goAway: { timeLeft: '5s' } }), [{ type: 'go_away' }]);
});

test('parseServerMessage: combined message yields ordered events', () => {
  const evts = parseServerMessage({
    serverContent: {
      modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm', data: 'A' } }] },
      outputTranscription: { text: 'hello' },
      turnComplete: true,
    },
  });
  assert.deepEqual(evts, [
    { type: 'audio', data: 'A' },
    { type: 'transcript', speaker: 'ai', text: 'hello' },
    { type: 'turn_complete' },
  ]);
});

test('parseServerMessage: API error', () => {
  assert.deepEqual(parseServerMessage({ error: { message: 'boom' } }), [
    { type: 'error', message: 'boom' },
  ]);
});

/* ── Orchestrator with fakes ── */

class FakeSocket implements LiveSocket {
  sent: string[] = [];
  closed = false;
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: ((ev: { code: number; reason: string }) => void) | null = null;
  send(data: string): void {
    this.sent.push(data);
  }
  close(): void {
    this.closed = true;
  }
  // test helpers
  open(): void {
    this.onopen?.();
  }
  emit(obj: unknown): void {
    this.onmessage?.({ data: JSON.stringify(obj) });
  }
}

class FakeAudio implements AudioBridge {
  captureCb: ((b64: string) => void) | null = null;
  played: string[] = [];
  stopped = false;
  startCapture(onChunk: (b64: string) => void): void {
    this.captureCb = onChunk;
  }
  playPcm24Base64(b64: string): void {
    this.played.push(b64);
  }
  stop(): void {
    this.stopped = true;
  }
}

test('orchestrator drives a full happy-path session', async () => {
  const socket = new FakeSocket();
  const audio = new FakeAudio();
  const statuses: LiveStatus[] = [];
  const transcripts: { speaker: string; text: string }[] = [];

  const orch = new GeminiLiveOrchestrator({
    resolveWsUrl: async () => 'wss://example/ws',
    createSocket: () => socket,
    audio,
    systemInstruction: 'Be kind.',
    callbacks: {
      onStatus: (s) => statuses.push(s),
      onTranscript: (t) => transcripts.push(t),
    },
  });

  await orch.start();
  assert.equal(orch.status, 'connecting');

  // Connection opens → setup payload sent (with our preserved config).
  socket.open();
  assert.equal(socket.sent.length, 1);
  const setupSent = JSON.parse(socket.sent[0]!);
  assert.equal(setupSent.setup.model, GEMINI_MODEL_LIVE);
  assert.equal(setupSent.setup.system_instruction.parts[0].text, 'Be kind.');

  // setupComplete → listening + mic capture starts.
  socket.emit({ setupComplete: true });
  // allow the awaited startCapture microtask to flush
  await Promise.resolve();
  assert.equal(orch.status, 'listening');
  assert.ok(audio.captureCb, 'capture should have started');

  // a captured mic chunk is framed and sent over the socket.
  audio.captureCb!('MICCHUNK');
  const last = JSON.parse(socket.sent[socket.sent.length - 1]!);
  assert.deepEqual(last, buildRealtimeInputMessage('MICCHUNK'));

  // model audio → ai-speaking + playback.
  socket.emit({
    serverContent: { modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm', data: 'AIAUD' } }] } },
  });
  assert.equal(orch.status, 'ai-speaking');
  assert.deepEqual(audio.played, ['AIAUD']);

  // transcripts surface to the callback.
  socket.emit({ serverContent: { outputTranscription: { text: 'Hello there' } } });
  assert.deepEqual(transcripts.at(-1), { speaker: 'ai', text: 'Hello there' });

  // turn complete → back to listening.
  socket.emit({ serverContent: { turnComplete: true } });
  assert.equal(orch.status, 'listening');

  // stop tears everything down.
  orch.stop();
  assert.ok(audio.stopped);
  assert.ok(socket.closed);
  assert.equal(orch.status, 'idle');
});

test('orchestrator surfaces API errors and closes the socket', async () => {
  const socket = new FakeSocket();
  const audio = new FakeAudio();
  const orch = new GeminiLiveOrchestrator({
    resolveWsUrl: async () => 'wss://x',
    createSocket: () => socket,
    audio,
    systemInstruction: 's',
  });
  await orch.start();
  socket.open();
  socket.emit({ error: { message: 'quota exceeded' } });
  assert.equal(orch.status, 'error: quota exceeded');
  assert.ok(socket.closed);
});

test('orchestrator keeps the session alive on mic failure (text fallback) and still starts the AI', async () => {
  const socket = new FakeSocket();
  const audio = new FakeAudio();
  audio.startCapture = () => {
    throw new Error('Microphone access denied');
  };
  let micErr = '';
  const orch = new GeminiLiveOrchestrator({
    resolveWsUrl: async () => 'wss://x',
    createSocket: () => socket,
    audio,
    systemInstruction: 's',
    callbacks: { onMicError: (m) => (micErr = m) },
  });
  await orch.start();
  socket.open();
  socket.emit({ setupComplete: true });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(orch.status, 'listening'); // session continues, not torn down
  assert.equal(socket.closed, false);
  assert.match(micErr, /Microphone/);
  assert.ok(
    socket.sent.some((s) => s.includes('clientContent')),
    'the opening trigger should still be sent',
  );
});

test('orchestrator reports a token/connect failure as an error status', async () => {
  const audio = new FakeAudio();
  const orch = new GeminiLiveOrchestrator({
    resolveWsUrl: async () => {
      throw new Error('no token');
    },
    createSocket: () => {
      throw new Error('should not be called');
    },
    audio,
    systemInstruction: 's',
  });
  await orch.start();
  assert.equal(orch.status, 'error: no token');
});

test('buildClientContentTurn frames a user text turn', () => {
  assert.deepEqual(buildClientContentTurn('hi'), {
    clientContent: { turns: [{ role: 'user', parts: [{ text: 'hi' }] }], turnComplete: true },
  });
});

test('orchestrator sends an opening trigger on setup so the AI speaks first', async () => {
  const socket = new FakeSocket();
  const audio = new FakeAudio();
  const orch = new GeminiLiveOrchestrator({
    resolveWsUrl: async () => 'wss://x',
    createSocket: () => socket,
    audio,
    systemInstruction: 's',
  });
  await orch.start();
  socket.open();
  socket.emit({ setupComplete: true });
  await Promise.resolve();
  const trigger = socket.sent.map((s) => JSON.parse(s)).find((m) => m.clientContent);
  assert.ok(trigger, 'an opening clientContent turn should be sent');
  assert.equal(trigger.clientContent.turnComplete, true);
});

test('sendText surfaces a learner turn and sends it over the socket', async () => {
  const socket = new FakeSocket();
  const audio = new FakeAudio();
  const transcripts: { speaker: string; text: string }[] = [];
  const orch = new GeminiLiveOrchestrator({
    resolveWsUrl: async () => 'wss://x',
    createSocket: () => socket,
    audio,
    systemInstruction: 's',
    callbacks: { onTranscript: (t) => transcripts.push(t) },
  });
  await orch.start();
  socket.open();
  orch.sendText('  I disagree  ');
  assert.deepEqual(transcripts.at(-1), { speaker: 'learner', text: 'I disagree' });
  const last = JSON.parse(socket.sent.at(-1)!);
  assert.deepEqual(last.clientContent.turns[0].parts[0], { text: 'I disagree' });
});
