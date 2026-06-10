// Calls the Gemini REST API using the PURE request/response helpers from
// @fluentmap/core/scoring (single source of truth for model + config). The key
// stays server-side here — it is never returned to the client.

import {
  buildGenerateContentBody,
  geminiRestUrl,
  extractText,
  parseJsonResponse,
} from '@fluentmap/core/scoring';

/** Run a JSON-returning Gemini prompt and parse the result. */
export async function callGeminiJson(
  prompt: string,
  opts: { temperature?: number } = {},
): Promise<unknown> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set.');

  const res = await fetch(geminiRestUrl(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildGenerateContentBody(prompt, opts)),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini error ${res.status}: ${detail}`);
  }

  const data = await res.json();
  return parseJsonResponse(extractText(data));
}

const LIVE_MODEL = 'models/gemini-2.5-flash-native-audio-latest';

/**
 * Mint a single-use, short-lived Gemini ephemeral auth token so the browser
 * never receives the raw API key. OPT-IN via `GEMINI_USE_EPHEMERAL_TOKENS=true`
 * — default off preserves the verified key-in-URL path.
 *
 * ⚠️  UNVERIFIED against a live key in this build — the operator must confirm the
 *     auth_tokens endpoint, `v1alpha` model availability, and the connect param
 *     for their project before enabling in production. Returns null on any
 *     failure so `start-session` falls back to the working path.
 */
export async function mintEphemeralToken(): Promise<string | null> {
  if (Deno.env.get('GEMINI_USE_EPHEMERAL_TOKENS') !== 'true') return null;
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return null;

  try {
    const now = Date.now();
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1alpha/auth_tokens?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uses: 1,
          expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
          newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
          liveConnectConstraints: { model: LIVE_MODEL },
        }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.name === 'string' ? data.name : null;
  } catch {
    return null;
  }
}
