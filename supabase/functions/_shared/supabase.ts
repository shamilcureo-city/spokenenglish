// Service-role Supabase client (bypasses RLS). SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are auto-injected into edge functions at runtime —
// you never set them yourself.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function serviceClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set.');
  return createClient(url, key, { auth: { persistSession: false } });
}
