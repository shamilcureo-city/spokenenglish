/**
 * Review tab (redesign Phase 0). Today it resurfaces your weakest completed lessons
 * to redo, plus a free-chat option. Phase 2 upgrades this into the real moat:
 * concept-mastery scored from spoken usage, weakest-first, with cross-session memory.
 */
import { weakLessons, warmupForUser, type Lesson } from '@fluentmap/core/conversation';
import { useStore } from '../store';
import { todayIndex } from '../lib/constants';
import { Page } from './ui';

export function Review({
  onOpenLesson,
  onFreeChat,
}: {
  onOpenLesson: (lesson: Lesson) => void;
  onFreeChat: (prompt: string) => void;
}) {
  const { lessonStars, completedLessonIds, profile } = useStore();
  const weak = weakLessons(lessonStars, completedLessonIds, 5);
  const warmup = warmupForUser(todayIndex(), profile.interests);

  return (
    <Page bottomPad>
      <h1 className="mb-1 text-xl font-bold">Review &amp; improve</h1>
      <p className="mb-5 text-sm text-white/55">Come back to what didn't quite land — and beat your best.</p>

      {weak.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-300/80">
            Your weak spots
          </h2>
          <ul className="space-y-2">
            {weak.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => onOpenLesson(l)}
                  className="flex w-full items-center justify-between rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-left transition hover:border-amber-300/45 hover:bg-amber-300/[0.09]"
                >
                  <div>
                    <div className="text-sm font-semibold text-white/90">{l.title}</div>
                    <div className="text-xs text-white/45">{l.canDo}</div>
                  </div>
                  <span className="ml-3 shrink-0 text-sm tabular-nums text-amber-300">
                    {'★'.repeat(lessonStars[l.id] ?? 0)}
                    <span className="text-white/15">{'★'.repeat(3 - (lessonStars[l.id] ?? 0))}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center">
          <div className="mb-1 text-2xl">✨</div>
          <p className="text-sm text-white/60">
            No weak spots yet — finish a few lessons and the ones to revisit will show up here.
          </p>
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
