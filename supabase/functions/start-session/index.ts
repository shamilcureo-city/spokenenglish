// POST /start-session — first half of the Gemini Live token proxy.
// Mints a single-use, short-lived token mapped to the Live WebSocket URL, stored
// server-side in `live_tokens`. The client redeems it via /redeem-session.
//
// 🔒 SECURITY: by default the redeemed URL carries the raw GEMINI_API_KEY (the
//     verified Live path). Set GEMINI_USE_EPHEMERAL_TOKENS=true to instead mint a
//     single-use, short-lived ephemeral token so the key NEVER reaches the
//     browser — the proper fix. Falls back to the key path if minting fails, so
//     enabling it can't break voice. The operator should verify the ephemeral
//     path against their project before relying on it (see _shared/gemini.ts).

import { handlePreflight, json } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { mintEphemeralToken } from '../_shared/gemini.ts';

const LIVE_WSS =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
const LIVE_WSS_ALPHA =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';

function hexToken(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return json({ error: 'GEMINI_API_KEY is not set.' }, 500);

  const token = hexToken();
  const ephemeral = await mintEphemeralToken();
  const wsUrl = ephemeral
    ? `${LIVE_WSS_ALPHA}?key=${encodeURIComponent(ephemeral)}` // raw key never reaches the browser
    : `${LIVE_WSS}?key=${apiKey}`; // fallback: verified path

  try {
    const supabase = serviceClient();
    const { error } = await supabase.from('live_tokens').insert({ token, ws_url: wsUrl });
    if (error) return json({ error: error.message }, 500);
    return json({ token });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
