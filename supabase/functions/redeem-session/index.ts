// GET /redeem-session?token=... — second half of the token proxy.
// Single-use: returns the Live WebSocket URL and deletes the token. Rejects
// tokens older than 30 minutes (matches the original TTL).

import { handlePreflight, json } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/supabase.ts';

const TTL_MS = 30 * 60 * 1000;

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);

  const token = new URL(req.url).searchParams.get('token');
  if (!token) return json({ error: 'Missing token.' }, 400);

  try {
    const supabase = serviceClient();
    const { data, error } = await supabase
      .from('live_tokens')
      .select('ws_url, created_at')
      .eq('token', token)
      .maybeSingle();

    if (error) return json({ error: error.message }, 500);
    if (!data) return json({ error: 'Invalid or expired token.' }, 401);

    // Single-use: delete regardless of validity below.
    await supabase.from('live_tokens').delete().eq('token', token);

    if (Date.now() - new Date(data.created_at).getTime() > TTL_MS) {
      return json({ error: 'Invalid or expired token.' }, 401);
    }
    return json({ wsUrl: data.ws_url });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
