/**
 * You tab (redesign Phase 0) — a compact profile: level + streak + week, a link to
 * the full progress detail, the invite loop (moved off Home), and Settings.
 * Phase 4 adds the 5-skill speaking radar + a speaking certificate here.
 */
import { xpIntoLevel, courseProgress } from '@fluentmap/core/conversation';
import { useStore } from '../store';
import { shareInvite } from '../lib/share';
import { track } from '../lib/analytics';
import { Logo, Page } from './ui';

export function You({ onProgress, onSettings }: { onProgress: () => void; onSettings: () => void }) {
  const { profile, xp, streak, weekProgress, weeklyGoal, completedLessonIds } = useStore();
  const lvl = xpIntoLevel(xp);
  const pct = courseProgress(completedLessonIds).pct;

  function invite() {
    void (async () => {
      const result = await shareInvite(profile.name);
      track('invite_sent', { result });
    })();
  }

  return (
    <Page bottomPad>
      <header className="mb-6 flex items-center justify-between">
        <Logo small />
        <button
          onClick={onSettings}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/55 hover:text-white/90"
          aria-label="Settings"
        >
          ⚙
        </button>
      </header>

      <h1 className="text-xl font-bold">{profile.name || 'You'}</h1>
      <p className="mb-5 text-sm text-white/50">{profile.l1} speaker · learning with Sunny</p>

      {/* Level + XP */}
      <div className="mb-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-semibold text-white/80">Level {lvl.level}</span>
          <span className="text-white/45">
            {lvl.into}/{lvl.needed} XP
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-400"
            style={{ width: `${lvl.pct}%` }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-5 grid grid-cols-3 gap-3 text-center">
        <Stat value={`${pct}%`} label="course done" />
        <Stat value={`${streak}`} label="day streak" />
        <Stat value={`${weekProgress}/${weeklyGoal}`} label="this week" />
      </div>

      <button
        onClick={onProgress}
        className="mb-3 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-emerald-400/40 hover:bg-white/[0.04]"
      >
        <div>
          <div className="text-sm font-semibold">Your progress</div>
          <div className="text-xs text-white/45">Levels & how you're speaking</div>
        </div>
        <span className="text-white/35">→</span>
      </button>

      <button
        onClick={invite}
        className="flex w-full items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4 text-left transition hover:border-emerald-400/45 hover:bg-emerald-400/[0.08]"
      >
        <div>
          <div className="text-sm font-semibold text-emerald-100">Practise with a friend 💬</div>
          <div className="text-xs text-white/50">You'll both stick with it — invite them on WhatsApp</div>
        </div>
        <span className="text-emerald-300/70">↗</span>
      </button>
    </Page>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
      <div className="text-xl font-bold tabular-nums text-emerald-300">{value}</div>
      <div className="text-[11px] text-white/45">{label}</div>
    </div>
  );
}
