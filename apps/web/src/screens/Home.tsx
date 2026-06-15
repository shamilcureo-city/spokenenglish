import {
  nextLesson,
  courseProgress,
  unitById,
  warmupForDay,
  xpIntoLevel,
  type Lesson,
} from '@fluentmap/core/conversation';
import { useStore, dateKey } from '../store';
import { todayIndex } from '../lib/constants';
import { shareInvite } from '../lib/share';
import { track } from '../lib/analytics';
import { Logo, GoalRing, Page } from './ui';

export function Home({
  onOpenLesson,
  onBrowseCourse,
  onWarmup,
  onProgress,
  onSettings,
}: {
  onOpenLesson: (lesson: Lesson) => void;
  onBrowseCourse: () => void;
  onWarmup: (prompt: string) => void;
  onProgress: () => void;
  onSettings: () => void;
}) {
  const { profile, completedLessonIds, placement, weeklyGoal, weekProgress, streak, xp, days, reminderTime } =
    useStore();
  const lvl = xpIntoLevel(xp);
  const practicedToday = days.includes(dateKey());
  const next = nextLesson(completedLessonIds, placement?.unitId);
  const pct = courseProgress(completedLessonIds).pct;
  const warmup = warmupForDay(todayIndex());

  function invite() {
    void (async () => {
      const result = await shareInvite(profile.name);
      track('invite_sent', { result });
    })();
  }

  return (
    <Page>
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

      <h1 className="mb-1 text-xl font-bold">
        Hi {profile.name || 'there'} <span className="font-normal text-white/40">— ready to speak?</span>
      </h1>
      {streak > 0 ? (
        <p className="mb-5 text-sm text-amber-300/80">🔥 Day {streak} — you're becoming a daily speaker.</p>
      ) : reminderTime && !practicedToday ? (
        <p className="mb-5 text-sm text-white/55">Your practice is waiting — just five minutes today.</p>
      ) : (
        <div className="mb-5" />
      )}

      <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <div className="mb-3">
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
        <GoalRing value={weekProgress} goal={weeklyGoal} streak={streak} />
      </div>

      {/* Continue the course — the spine */}
      {next ? (
        <button
          onClick={() => onOpenLesson(next)}
          className="group mb-3 block w-full rounded-2xl bg-gradient-to-br from-emerald-400/90 to-teal-300/90 p-5 text-left text-black transition hover:opacity-95"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-black/55">
            Continue your course · {unitById(next.unitId)?.title ?? ''} · {pct}% done
          </div>
          <div className="mt-1.5 text-lg font-semibold leading-snug">{next.title}</div>
          <div className="mt-0.5 text-sm text-black/70">{next.canDo}</div>
          <div className="mt-3 inline-flex items-center gap-1 text-sm font-bold">Start lesson →</div>
        </button>
      ) : (
        <div className="mb-3 rounded-2xl bg-gradient-to-br from-emerald-400/90 to-teal-300/90 p-5 text-black">
          <div className="text-lg font-bold">🎉 Course complete!</div>
          <div className="mt-1 text-sm text-black/70">Keep your English sharp with a daily free-talk below.</div>
        </div>
      )}

      {/* Browse the course */}
      <button
        onClick={onBrowseCourse}
        className="mb-3 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-emerald-400/40 hover:bg-white/[0.04]"
      >
        <div>
          <div className="text-sm font-semibold">Browse the course</div>
          <div className="text-xs text-white/45">All levels, units & lessons</div>
        </div>
        <span className="text-white/35">→</span>
      </button>

      {/* Daily free-talk */}
      <button
        onClick={() => onWarmup(warmup.prompt)}
        className="mb-3 block w-full rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-emerald-400/40 hover:bg-white/[0.04]"
      >
        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
          Daily free-talk · {warmup.skill}
        </div>
        <div className="mt-1 text-sm font-medium leading-snug text-white/85">{warmup.prompt}</div>
        <div className="mt-1 text-xs text-white/45">A relaxed 5-minute chat — no lesson, just talk. →</div>
      </button>

      {/* Progress */}
      <button
        onClick={onProgress}
        className="mb-3 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-emerald-400/40 hover:bg-white/[0.04]"
      >
        <div>
          <div className="text-sm font-semibold">Your progress</div>
          <div className="text-xs text-white/45">Levels, streak & how you're improving</div>
        </div>
        <span className="text-white/35">→</span>
      </button>

      {/* Invite a friend — the "practise with me" growth loop */}
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
