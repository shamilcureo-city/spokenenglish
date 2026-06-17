/**
 * Today — the anti-dashboard home (redesign Phase 0). One screen, one decision:
 * Sunny greets you in your mother tongue and points at the ONE thing to do now.
 * Everything else (course menu, progress, invite) moved to the other tabs.
 */
import {
  nextLesson,
  courseProgress,
  unitById,
  warmupForUser,
  type Lesson,
} from '@fluentmap/core/conversation';
import { useStore, dateKey } from '../store';
import { todayIndex } from '../lib/constants';
import { Page } from './ui';

/** A warm native-script greeting by mother tongue (falls back to English "Hi"). */
const GREETING: Record<string, string> = {
  Hindi: 'नमस्ते',
  Tamil: 'வணக்கம்',
  Telugu: 'నమస్కారం',
  Kannada: 'ನಮಸ್ಕಾರ',
  Malayalam: 'നമസ്കാരം',
  Marathi: 'नमस्कार',
  Bengali: 'নমস্কার',
  Gujarati: 'નમસ્તે',
  Punjabi: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
  English: 'Hi',
};

export function Today({
  onStartLesson,
  onFreeChat,
  onBrowsePath,
}: {
  onStartLesson: (lesson: Lesson) => void;
  onFreeChat: (prompt: string) => void;
  onBrowsePath: () => void;
}) {
  const { profile, completedLessonIds, placement, streak, days } = useStore();
  const next = nextLesson(completedLessonIds, placement?.unitId);
  const pct = courseProgress(completedLessonIds).pct;
  const warmup = warmupForUser(todayIndex(), profile.interests);
  const practicedToday = days.includes(dateKey());
  const hello = GREETING[profile.l1] ?? 'Hi';
  const name = profile.name || 'there';

  const subline = practicedToday
    ? 'Back already? Love it. One more?'
    : streak > 0
      ? `Day ${streak} — let's keep it going.`
      : "Let's speak for five minutes.";

  return (
    <Page bottomPad>
      {/* Sunny presence */}
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="relative mb-3 grid h-24 w-24 place-items-center">
          <div className="absolute inset-0 animate-pulse rounded-full bg-amber-300/20 blur-xl" />
          <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-4xl shadow-lg shadow-amber-500/20">
            ☀️
          </div>
        </div>
        <h1 className="text-xl font-bold">
          {hello}, {name} <span className="text-white/40">— I'm Sunny</span>
        </h1>
        <p className="mt-1 text-sm text-white/55">{subline}</p>
      </div>

      {/* THE one action */}
      {next ? (
        <button
          onClick={() => onStartLesson(next)}
          className="group block w-full rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-300 p-6 text-left text-black shadow-xl shadow-emerald-500/15 transition hover:opacity-95"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-black/55">
            Today's session · {unitById(next.unitId)?.title ?? ''} · {pct}% done
          </div>
          <div className="mt-1.5 text-2xl font-bold leading-tight">{next.title}</div>
          <div className="mt-1 text-sm text-black/70">{next.canDo}</div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/15 px-4 py-2 text-sm font-bold">
            🎤 Start speaking →
          </div>
          <div className="mt-3 flex gap-1.5">
            <span className="h-1.5 flex-1 rounded-full bg-black/25" title="warm-up" />
            <span className="h-1.5 flex-1 rounded-full bg-black/25" title="speak" />
            <span className="h-1.5 flex-1 rounded-full bg-black/25" title="feedback" />
          </div>
        </button>
      ) : (
        <div className="rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-300 p-6 text-black">
          <div className="text-2xl font-bold">🎉 Course complete!</div>
          <div className="mt-1 text-sm text-black/70">Keep your English sharp with a free chat below.</div>
        </div>
      )}

      {/* Secondary, smaller — the escape hatch */}
      <div className="mt-4 space-y-2.5">
        <button
          onClick={() => onFreeChat(warmup.prompt)}
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-amber-300/40 hover:bg-white/[0.04]"
        >
          <div>
            <div className="text-sm font-semibold">Free chat with Sunny 🎙️</div>
            <div className="text-xs text-white/45">{warmup.prompt}</div>
          </div>
          <span className="text-white/35">→</span>
        </button>
        <button
          onClick={onBrowsePath}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center text-xs text-white/50 transition hover:border-white/25 hover:text-white/80"
        >
          Practise something else
        </button>
      </div>
    </Page>
  );
}
