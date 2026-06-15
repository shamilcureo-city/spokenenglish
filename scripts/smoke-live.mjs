// Headless smoke for the Gemini Live voice fix: connects, sends the setup + the
// opening trigger, and checks the AI responds FIRST (audio/transcript) with NO mic
// input. Verifies the model is available and the "AI speaks first" trigger works.
//
//   node scripts/smoke-live.mjs
//
// Reads GEMINI_API_KEY the same way the dev server does.

import { WebSocket } from 'ws';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  GEMINI_SETUP,
  buildSetupMessage,
  buildClientContentTurn,
  OPENING_TRIGGER,
  parseServerMessage,
} from '@fluentmap/core/voice';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PLACEHOLDERS = new Set(['your-key', 'your-gemini-key', 'your-google-gemini-api-key', '']);

function parseEnvKey(path, key) {
  try {
    if (!existsSync(path)) return null;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && m[1] === key) {
        let v = m[2].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        return v || null;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}
function loadKey() {
  if (process.env.GEMINI_API_KEY && !PLACEHOLDERS.has(process.env.GEMINI_API_KEY.trim()))
    return process.env.GEMINI_API_KEY.trim();
  for (const p of ['supabase/.env', '.env', '../spokenenglish/.env', '../spokenenglish/server/.env']) {
    const k = parseEnvKey(join(ROOT, p), 'GEMINI_API_KEY');
    if (k && !PLACEHOLDERS.has(k)) return k;
  }
  return null;
}

const KEY = loadKey();
if (!KEY) {
  console.error('No GEMINI_API_KEY found.');
  process.exit(1);
}
const WSS =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

const SYS =
  'You are Alex, a warm spoken-English tutor. The learner is Ravi. Greet Ravi by name in ONE short sentence and ask one simple, friendly question. Keep it very short.';

function testModel(model, setupMsg) {
  return new Promise((resolve) => {
    const r = { model, connected: false, setupComplete: false, gotAudio: false, transcript: '', error: null };
    const ws = new WebSocket(`${WSS}?key=${KEY}`);
    const done = () => {
      try {
        ws.close();
      } catch {
        /* */
      }
      resolve(r);
    };
    const timer = setTimeout(done, 15000);
    ws.on('open', () => {
      r.connected = true;
      ws.send(JSON.stringify(setupMsg));
    });
    ws.on('message', (data) => {
      let msg;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        return;
      }
      for (const evt of parseServerMessage(msg)) {
        if (evt.type === 'setup_complete') {
          r.setupComplete = true;
          ws.send(JSON.stringify(buildClientContentTurn(OPENING_TRIGGER)));
        } else if (evt.type === 'audio') r.gotAudio = true;
        else if (evt.type === 'transcript' && evt.speaker === 'ai') r.transcript += evt.text;
        else if (evt.type === 'error') r.error = evt.message;
        else if (evt.type === 'turn_complete' && (r.gotAudio || r.transcript)) {
          clearTimeout(timer);
          done();
        }
      }
    });
    ws.on('error', (e) => {
      r.error = String(e?.message || e);
    });
    ws.on('close', (code, reason) => {
      if (!r.error && !r.setupComplete) r.error = `closed ${code} ${reason || ''}`.trim();
      clearTimeout(timer);
      resolve(r);
    });
  });
}

const report = (r) => {
  const ok = r.setupComplete && (r.gotAudio || r.transcript);
  console.log(
    `\n${ok ? '✅' : '❌'} ${r.model}\n   connected=${r.connected} setupComplete=${r.setupComplete} ` +
      `aiAudio=${r.gotAudio} aiSaid="${r.transcript.slice(0, 80)}"${r.error ? `\n   error: ${r.error}` : ''}`,
  );
  return ok;
};

const models = [
  ['models/gemini-3.1-flash-live-preview (configured)', buildSetupMessage(SYS)],
  [
    'models/gemini-2.5-flash-native-audio-latest (fallback)',
    { setup: { ...GEMINI_SETUP, model: 'models/gemini-2.5-flash-native-audio-latest', system_instruction: { parts: [{ text: SYS }] } } },
  ],
];

console.log('Testing "AI speaks first" trigger against the live API (no mic)…');
for (const [label, setup] of models) {
  // eslint-disable-next-line no-await-in-loop
  report(await testModel(label, setup));
}
process.exit(0);
