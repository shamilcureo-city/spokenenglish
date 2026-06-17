/**
 * The app shell chrome for the 4-tab, voice-first IA (redesign Phase 0):
 *  - StateStrip: a calm top strip carrying streak · daily-goal · level (always glanceable).
 *  - TabBar: the fixed bottom nav — Today · Path · Review · You.
 *
 * Both are only shown on the top-level tabs; lessons/conversations render full-screen.
 */
import { xpIntoLevel } from '@fluentmap/core/conversation';
import { useStore } from '../store';

export type Tab = 'today' | 'path' | 'review' | 'you';

/** Glanceable status: streak, today's goal ring, current level. */
export function StateStrip() {
  const { streak, weekProgress, weeklyGoal, xp } = useStore();
  const lvl = xpIntoLevel(xp);
  const pct = Math.max(0, Math.min(1, weeklyGoal > 0 ? weekProgress / weeklyGoal : 0));
  const c = 2 * Math.PI * 9;
  return (
    <div className="mx-auto mb-4 flex w-full max-w-xl items-center justify-between px-5 pt-6">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/10 px-3 py-1 text-sm font-semibold text-amber-300">
        🔥 {streak}
      </span>
      <span className="inline-flex items-center gap-2 text-xs text-white/55">
        <svg viewBox="0 0 24 24" className="h-6 w-6 -rotate-90">
          <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="#34d399"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
          />
        </svg>
        {weekProgress}/{weeklyGoal} this week
      </span>
      <span className="rounded-full bg-white/[0.06] px-3 py-1 text-sm font-semibold text-white/80">
        Lv {lvl.level}
      </span>
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '☀️' },
  { id: 'path', label: 'Path', icon: '🗺️' },
  { id: 'review', label: 'Review', icon: '🔁' },
  { id: 'you', label: 'You', icon: '🙂' },
];

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0b0d12]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-xl items-stretch">
        {TABS.map((t) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                on ? 'text-emerald-300' : 'text-white/45 hover:text-white/70'
              }`}
              aria-current={on ? 'page' : undefined}
            >
              <span className={`text-lg leading-none ${on ? '' : 'opacity-70 grayscale'}`}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
