import { useState } from 'react';
import type { Auth } from './useAuth';

export function AuthScreen({ auth }: { auth: Auth }) {
  const [phone, setPhone] = useState('+91');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setErr(null);
    try {
      await auth.signInWithOtp(phone.trim());
      setSent(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setErr(null);
    try {
      await auth.verifyOtp(phone.trim(), code.trim());
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <div className="mb-7 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-amber-300 text-base font-black text-black">
          F
        </span>
        <span className="text-xl font-semibold tracking-tight">FluentMap</span>
      </div>
      <h1 className="text-2xl font-bold">Sign in to save your progress</h1>
      <p className="mt-1.5 text-sm text-white/50">We'll text you a one-time code.</p>

      {!sent ? (
        <>
          <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-white/40">
            Phone number
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="+91 98765 43210"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-emerald-400/50"
          />
          <button
            onClick={send}
            disabled={busy}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-amber-300 px-6 py-3.5 text-sm font-bold text-black hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send code'}
          </button>
        </>
      ) : (
        <>
          <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-white/40">
            Enter the 6-digit code
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            placeholder="123456"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-lg tracking-[0.4em] outline-none focus:border-emerald-400/50"
          />
          <button
            onClick={verify}
            disabled={busy}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-amber-300 px-6 py-3.5 text-sm font-bold text-black hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Verifying…' : 'Verify & continue'}
          </button>
          <button onClick={() => setSent(false)} className="mt-3 text-center text-xs text-white/40 hover:text-white/60">
            Use a different number
          </button>
        </>
      )}
      {err && <p className="mt-3 text-center text-xs text-red-300/80">{err}</p>}
    </div>
  );
}
