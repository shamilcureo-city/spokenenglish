/** Small shared UI atoms for the Greenroom shell. */

import type { ReactNode } from 'react';

/** Brand wordmark. */
export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`grid place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-300 font-black text-black ${
          small ? 'h-7 w-7 text-sm' : 'h-9 w-9 text-base'
        }`}
      >
        S
      </div>
      <span className={`font-bold tracking-tight ${small ? 'text-base' : 'text-lg'}`}>Speakwell</span>
    </div>
  );
}

/** A page container with consistent padding + max width. `bottomPad` clears the tab bar. */
export function Page({ children, bottomPad = false }: { children: ReactNode; bottomPad?: boolean }) {
  return (
    <div className={`mx-auto w-full max-w-xl px-5 py-7 ${bottomPad ? 'pb-28' : ''}`}>{children}</div>
  );
}

/** Weekly-goal ring (days practised this week / goal). */
export function GoalRing({ value, goal, streak }: { value: number; goal: number; streak: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, goal > 0 ? value / goal : 0));
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="url(#g)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
          />
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#34d399" />
              <stop offset="1" stopColor="#5eead4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center text-sm font-bold tabular-nums">
          {value}/{goal}
        </div>
      </div>
      <div className="text-xs leading-tight text-white/55">
        <div className="font-semibold text-white/80">This week</div>
        <div>{value >= goal ? 'Goal hit 🎉' : `${goal - value} to go`}</div>
        {streak > 0 && <div className="mt-0.5 text-amber-300/90">🔥 {streak}-day streak</div>}
      </div>
    </div>
  );
}

/** A subtle 0–100 dimension bar for the recap. */
export function DimensionBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] text-white/50">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
          style={{ width: `${Math.max(4, value)}%` }}
        />
      </div>
    </div>
  );
}
