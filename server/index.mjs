// Greenroom local dev API — a tiny, dependency-light stand-in for a cloud backend,
// so you get the REAL Gemini voice + scene-building + recaps with NO Docker and NO
// Supabase. It reuses the exact same @fluentmap/core/conversation logic the app uses
// (prompts, parsing), so behaviour is identical — only the token store (an in-memory
// Map) differs.
//
// Run:  npm run dev:api        (reads GEMINI_API_KEY from env or a .env file)
// The web app points at it via apps/web/.env → VITE_FUNCTIONS_URL=http://localhost:8787

import express from 'express';
import cors from 'cors';
import { randomBytes } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  buildRecapPrompt,
  parseRecap,
  buildPlacementPrompt,
  parsePlacement,
  buildGenerateContentBody,
  geminiRestUrl,
  extractText,
  parseJsonResponse,
  RECAP_TEMPERATURE,
} from '@fluentmap/core/conversation';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..'); // fluentmap/

const LIVE_WSS =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
const PORT = Number(process.env.PORT) || 8787;
const TTL_MS = 30 * 60 * 1000;
const PLACEHOLDERS = new Set(['your-key', 'your-gemini-key', 'your-google-gemini-api-key', '']);

// ── Gemini key: env first, then the usual .env locations ────────────────────
function parseEnvKey(path, key) {
  try {
    if (!existsSync(path)) return null;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && m[1] === key) {
        let v = m[2].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        return v || null;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function loadGeminiKey() {
  if (process.env.GEMINI_API_KEY && !PLACEHOLDERS.has(process.env.GEMINI_API_KEY.trim())) {
    return process.env.GEMINI_API_KEY.trim();
  }
  const candidates = [
    join(ROOT, 'supabase/.env'),
    join(ROOT, '.env'),
    join(ROOT, '../spokenenglish/.env'),
    join(ROOT, '../spokenenglish/server/.env'),
    join(ROOT, '../spokenenglish/.env.local'),
  ];
  for (const p of candidates) {
    const k = parseEnvKey(p, 'GEMINI_API_KEY');
    if (k && !PLACEHOLDERS.has(k)) {
      console.log(`[greenroom-api] Gemini key loaded from ${p.replace(ROOT, '.')}`);
      return k;
    }
  }
  return null;
}

const GEMINI_API_KEY = loadGeminiKey();

// ── Gemini REST caller (same pure helpers as the core) ──────────────────────
async function callGeminiJson(prompt, opts = {}) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set on the dev server.');
  const res = await fetch(geminiRestUrl(GEMINI_API_KEY), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildGenerateContentBody(prompt, opts)),
  });
  if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
  return parseJsonResponse(extractText(await res.json()));
}

// ── Token proxy store (in-memory; fine for a single local process) ──────────
const tokens = new Map(); // token -> { wsUrl, createdAt }
function hexToken(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => {
  res.json({
    service: 'speakwell-dev-api',
    geminiKey: GEMINI_API_KEY ? 'loaded' : 'MISSING',
    routes: ['/start-session', '/redeem-session', '/recap', '/placement'],
  });
});

// POST /start-session → { token }
app.post('/start-session', (_req, res) => {
  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not set.' });
  const token = hexToken();
  tokens.set(token, { wsUrl: `${LIVE_WSS}?key=${GEMINI_API_KEY}`, createdAt: Date.now() });
  res.json({ token });
});

// GET /redeem-session?token=... → { wsUrl }  (single-use, 30-min TTL)
app.get('/redeem-session', (req, res) => {
  const token = req.query.token;
  const entry = typeof token === 'string' ? tokens.get(token) : undefined;
  if (token) tokens.delete(token); // single-use
  if (!entry || Date.now() - entry.createdAt > TTL_MS) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
  res.json({ wsUrl: entry.wsUrl });
});

// POST /recap  { transcript, mode, supportLanguage, scene?, lesson? } → Recap
app.post('/recap', async (req, res) => {
  const { transcript, mode, supportLanguage, lesson } = req.body ?? {};
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return res.status(400).json({ error: 'A valid transcript array is required.' });
  }
  try {
    const prompt = buildRecapPrompt({
      transcript,
      mode: mode === 'lesson' ? 'lesson' : 'warmup',
      supportLanguage: typeof supportLanguage === 'string' ? supportLanguage : 'Hindi',
      lesson: lesson && typeof lesson === 'object' ? lesson : undefined,
    });
    const raw = await callGeminiJson(prompt, { temperature: RECAP_TEMPERATURE });
    res.json(parseRecap(raw));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /placement  { transcript, supportLanguage } → { levelId, unitId, summary }
app.post('/placement', async (req, res) => {
  const { transcript, supportLanguage } = req.body ?? {};
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return res.status(400).json({ error: 'A valid transcript array is required.' });
  }
  try {
    const prompt = buildPlacementPrompt({
      transcript,
      supportLanguage: typeof supportLanguage === 'string' ? supportLanguage : 'Hindi',
    });
    const raw = await callGeminiJson(prompt, { temperature: 0.2 });
    res.json(parsePlacement(raw));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n  Greenroom dev API → http://localhost:${PORT}`);
  console.log(`  Gemini key: ${GEMINI_API_KEY ? '✅ loaded' : '❌ MISSING (set GEMINI_API_KEY)'}`);
  console.log(`  Point the web app at it: apps/web/.env → VITE_FUNCTIONS_URL=http://localhost:${PORT}\n`);
});
