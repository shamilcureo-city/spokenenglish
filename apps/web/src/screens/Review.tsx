/**
 * Review tab (redesign Phase 2) — the retention moat made visible.
 * Driven by concept-mastery memory: your weakest phrases (re-practise them in a
 * focused say-it drill) and your trouble words (with mastery bars + hear-it), plus
 * a count of what you've mastered. Falls back to lesson-redo + free chat early on.
 */
import {
  weakestConcepts,
  masteryStats,
  weakLessons,
  warmupForUser,
  type Lesson,
} from '@fluentmap/core/conversation';
import { useStore } from '../store';
import { todayIndex } from '../lib/constants';
import { speak, ttsSupported } from '../lib/tts';
import { Page } from './ui';

function barColor(m: number): string {
  return m >= 0.8 ? 'bg-emerald-400' : m >= 0.5 ? 'bg-amber-400' : 'bg-red-400';
}

export function Review({
  onOpenLesson,
  onFreeChat,
  onPractise,
}: {
  onOpenLesson: (lesson: Lesson) => void;
  onFreeChat: (prompt: string) => void;
  onPractise: (phrases: string[]) => void;
}) {
  const { mastery, lessonStars, completedLessonIds, profile } = useStore();
  const weakPhrases = weakestConcepts(mastery, 8, { kind: 'phrase' });
  const weakWords = weakestConcepts(mastery, 8, { kind: 'word' });
  const stats = masteryStats(mastery);
  const weakLessonList = weakLessons(lessonStars, completedLessonIds, 4);
  const warmup = warmupForUser(todayIndex(), profile.interests);
  const hasData = stats.tracked > 0;
  const allCaughtUp =
    hasData && weakPhrases.length === 0 && weakWords.length === 0 && weakLessonList.length === 0;

  return (
    <Page bottomPad>
      <h1 className="mb-1 text-xl font-bold">Review &amp; improve</h1>
      <p className="mb-5 text-sm text-white/55">
        {allCaughtUp
          ? "You're all caught up — nothing needs work right now. Nice."
          : hasData
            ? "I keep track of what trips you up — let's polish it, weakest first."
            : 'As you practise, the words and phrases that trip you up will gather here.'}
      </p>

      {hasData && (
        <div className="mb-5 flex gap-3 text-center">
          <Stat value={`${stats.mastered}`} label="mastered" />
          <Stat value={`${stats.working}`} label="working on" />
          <Stat value={`${stats.tracked}`} label="tracked" />
        </div>
      )}

      {/* Weakest-first focused drill */}
      {weakPhrases.length > 0 && (
        <button
          onClick={() => onPractise(weakPhrases.map((p) => p.label))}
          className="mb-5 block w-full rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 p-5 text-left text-black shadow-lg shadow-amber-500/15 transition hover:opacity-95"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-black/55">Quick review</div>
          <div className="mt-1 text-lg font-bold leading-snug">Practise your weak spots</div>
          <div className="mt-0.5 text-sm text-black/70">
            {weakPhrases.length} phrase{weakPhrases.length > 1 ? 's' : ''} that need another go
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-black/15 px-4 py-2 text-sm font-bold">
            🎤 Say them again →
          </div>
        </button>
      )}

      {/* Trouble words */}
      {weakWords.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Your trouble words</h2>
          <ul className="space-y-2">
            {weakWords.map((w) => (
              <li
                key={w.id}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3"
              >
                <button
                  onClick={() => speak(w.label)}
                  disabled={!ttsSupported}
                  className="shrink-0 text-base disabled:opacity-40"
                  aria-label={`Hear ${w.label}`}
                >
                  🔊
                </button>
                <span className="w-28 shrink-0 truncate text-sm font-medium text-white/85">{w.label}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <span
                    className={`block h-full rounded-full ${barColor(w.mastery)}`}
                    style={{ width: `${Math.max(6, Math.round(w.mastery * 100))}%` }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Lessons to revisit (whole-lesson redo) */}
      {weakLessonList.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Lessons to revisit</h2>
          <ul className="space-y-2">
            {weakLessonList.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => onOpenLesson(l)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left transition hover:border-emerald-400/40 hover:bg-white/[0.04]"
                >
                  <div className="text-sm font-semibold text-white/90">{l.title}</div>
                  <span className="ml-3 shrink-0 text-sm tabular-nums text-amber-300">
                    {'★'.repeat(lessonStars[l.id] ?? 0)}
                    <span className="text-white/15">{'★'.repeat(3 - (lessonStars[l.id] ?? 0))}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {allCaughtUp && (
        <section className="mb-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-5 text-center">
          <div className="mb-1 text-2xl">🎉</div>
          <p className="text-sm text-white/70">
            Everything you've practised is solid. Keep going and new trouble spots will show up here.
          </p>
        </section>
      )}

      {!hasData && weakLessonList.length === 0 && (
        <section className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center">
          <div className="mb-1 text-2xl">✨</div>
          <p className="text-sm text-white/60">Do a lesson's say-it drill and your weak spots will show up here.</p>
        </section>
      )}

      <button
        onClick={() => onFreeChat(warmup.prompt)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-amber-300/40 hover:bg-white/[0.04]"
      >
        <div>
          <div className="text-sm font-semibold">Loosen up — free chat with Sunny 🎙️</div>
          <div className="text-xs text-white/45">A relaxed few minutes, no lesson.</div>
        </div>
        <span className="text-white/35">→</span>
      </button>
    </Page>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
      <div className="text-xl font-bold tabular-nums text-emerald-300">{value}</div>
      <div className="text-[11px] text-white/45">{label}</div>
    </div>
  );
}
