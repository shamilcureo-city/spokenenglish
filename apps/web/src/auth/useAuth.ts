import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../data/supabaseClient';

export interface Auth {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  signInWithOtp(phone: string): Promise<void>;
  verifyOtp(phone: string, token: string): Promise<void>;
  signOut(): Promise<void>;
}

/** Supabase phone-OTP auth. In local mode (unconfigured) it's an inert stub. */
export function useAuth(): Auth {
  const configured = isSupabaseConfigured();
  const [loading, setLoading] = useState(configured);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabase();
    void supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => undefined)
      .finally(() => setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [configured]);

  return {
    configured,
    loading,
    session,
    user: session?.user ?? null,
    signInWithOtp: async (phone) => {
      const { error } = await getSupabase().auth.signInWithOtp({ phone });
      if (error) throw new Error(error.message);
    },
    verifyOtp: async (phone, token) => {
      const { error } = await getSupabase().auth.verifyOtp({ phone, token, type: 'sms' });
      if (error) throw new Error(error.message);
    },
    signOut: async () => {
      await getSupabase().auth.signOut();
    },
  };
}
