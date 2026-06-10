import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import { AuthScreen } from './AuthScreen';

/**
 * Gates the app on auth ONLY when Supabase is configured. Unconfigured → local
 * mode (no auth, demo data). Children receive the signed-in userId (or null) and
 * whether cloud persistence is active.
 */
export function AuthGate({
  children,
}: {
  children: (userId: string | null, cloud: boolean, signOut: () => Promise<void>) => ReactNode;
}) {
  const auth = useAuth();

  if (!auth.configured) return <>{children(null, false, auth.signOut)}</>;
  if (auth.loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-white/40">Loading…</div>;
  }
  if (!auth.session) return <AuthScreen auth={auth} />;
  return <>{children(auth.user?.id ?? null, true, auth.signOut)}</>;
}
