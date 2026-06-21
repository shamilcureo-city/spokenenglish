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

// ── Deploy hardening (safe defaults for local; lock down via env in prod) ────
// CORS: allow everything when ALLOWED_ORIGINS is unset (local dev); in prod set it
// to a comma-separated allowlist e.g. "https://speakwell.app".
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
function corsOrigin(origin, cb) {
  if (ALLOWED_ORIGINS.length === 0 || !origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
  cb(new Error('Origin not allowed'));
}

// In-memory per-IP rate limiter (single-process; swap for Redis when you scale).
function rateLimit({ windowMs, max }) {
  const hits = new Map(); // ip -> number[] (timestamps)
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) return res.status(429).json({ error: 'Too many requests — slow down.' });
    recent.push(now);
    hits.set(ip, recent);
    next();
  };
}

// Transcript input caps (prompt-injection / token-inflation guardrails).
const MAX_TURNS = 80;
const MAX_TURN_CHARS = 2000;
function validTranscript(t) {
  return (
    Array.isArray(t) &&
    t.length > 0 &&
    t.length <= MAX_TURNS &&
    t.every((x) => x && typeof x.text === 'string' && x.text.length <= MAX_TURN_CHARS)
  );
}

// Ephemeral Gemini Live tokens (opt-in via GEMINI_EPHEMERAL=true). Keeps the raw key
// off the client. VERIFY against your live Gemini project before enabling in prod —
// the API shape can change; this fails CLOSED (never falls back to the raw key).
const USE_EPHEMERAL = process.env.GEMINI_EPHEMERAL === 'true';
async function mintEphemeralToken() {
  const expire = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1alpha/auth_tokens?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uses: 1, expireTime: expire, newSessionExpireTime: expire }),
    },
  );
  if (!res.ok) throw new Error(`token mint failed (${res.status})`);
  const data = await res.json();
  const name = data.name || data.token || '';
  return name.startsWith('auth_tokens/') ? name.slice('auth_tokens/'.length) : name;
}

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
app.set('trust proxy', 1); // so req.ip is the real client behind a host/proxy
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '256kb' }));
const sessionLimiter = rateLimit({ windowMs: 60_000, max: 20 });
const scoreLimiter = rateLimit({ windowMs: 60_000, max: 30 });

app.get('/', (_req, res) => {
  res.json({
    service: 'speakwell-dev-api',
    geminiKey: GEMINI_API_KEY ? 'loaded' : 'MISSING',
    routes: ['/start-session', '/redeem-session', '/recap', '/placement'],
  });
});

// POST /start-session → { token }
app.post('/start-session', sessionLimiter, async (_req, res) => {
  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Server not configured.' });
  const now = Date.now();
  for (const [t, e] of tokens) if (now - e.createdAt > TTL_MS) tokens.delete(t); // sweep expired
  try {
    const wsUrl = USE_EPHEMERAL
      ? `${LIVE_WSS}?access_token=${await mintEphemeralToken()}` // fails closed — never the raw key
      : `${LIVE_WSS}?key=${GEMINI_API_KEY}`;
    const token = hexToken();
    tokens.set(token, { wsUrl, createdAt: Date.now() });
    res.json({ token });
  } catch (err) {
    console.error('[start-session]', err.message);
    res.status(502).json({ error: 'Could not start a session. Please try again.' });
  }
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

// POST /recap  { transcript, mode, supportLanguage, lesson? } → Recap
app.post('/recap', scoreLimiter, async (req, res) => {
  const { transcript, mode, supportLanguage, lesson } = req.body ?? {};
  if (!validTranscript(transcript)) {
    return res.status(400).json({ error: 'A valid transcript is required.' });
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
    console.error('[recap]', err.message); // keep upstream billing/quota details server-side
    res.status(502).json({ error: 'Could not generate feedback right now.' });
  }
});

// POST /placement  { transcript, supportLanguage } → { levelId, unitId, summary }
app.post('/placement', scoreLimiter, async (req, res) => {
  const { transcript, supportLanguage } = req.body ?? {};
  if (!validTranscript(transcript)) {
    return res.status(400).json({ error: 'A valid transcript is required.' });
  }
  try {
    const prompt = buildPlacementPrompt({
      transcript,
      supportLanguage: typeof supportLanguage === 'string' ? supportLanguage : 'Hindi',
    });
    const raw = await callGeminiJson(prompt, { temperature: 0.2 });
    res.json(parsePlacement(raw));
  } catch (err) {
    console.error('[placement]', err.message);
    res.status(502).json({ error: 'Could not score that right now.' });
  }
});

app.listen(PORT, () => {
  console.log(`\n  Greenroom dev API → http://localhost:${PORT}`);
  console.log(`  Gemini key: ${GEMINI_API_KEY ? '✅ loaded' : '❌ MISSING (set GEMINI_API_KEY)'}`);
  console.log(`  Point the web app at it: apps/web/.env → VITE_FUNCTIONS_URL=http://localhost:${PORT}\n`);
});
