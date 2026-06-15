import {
  LEVELS,
  unitsByLevel,
  lessonsByUnit,
  isLessonUnlocked,
  levelProgress,
  type Lesson,
} from '@fluentmap/core/conversation';
import { useStore } from '../store';
import { Page } from './ui';

export function CourseScreen({
  onBack,
  onOpenLesson,
}: {
  onBack: () => void;
  onOpenLesson: (lesson: Lesson) => void;
}) {
  const { completedLessonIds, placement } = useStore();
  const done = new Set(completedLessonIds);
  const startUnit = placement?.unitId;

  return (
    <Page>
      <header className="mb-5 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/50 hover:text-white/85">
          ← Back
        </button>
        <div className="text-sm font-semibold">The course</div>
        <div className="w-12" />
      </header>

      <div className="space-y-7">
        {LEVELS.map((level) => {
          const lp = levelProgress(level.id, completedLessonIds);
          return (
            <section key={level.id}>
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-base font-bold">{level.title}</h2>
                <span className="text-xs text-white/40">
                  {lp.done}/{lp.total} · {lp.pct}%
                </span>
              </div>
              <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                  style={{ width: `${lp.pct}%` }}
                />
              </div>

              <div className="space-y-3">
                {unitsByLevel(level.id).map((unit) => (
                  <div key={unit.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="mb-2 px-1">
                      <div className="text-sm font-semibold">{unit.title}</div>
                      <div className="text-[11px] text-white/40">{unit.subtitle}</div>
                    </div>
                    <ul className="space-y-1">
                      {lessonsByUnit(unit.id).map((lesson) => {
                        const isDone = done.has(lesson.id);
                        const unlocked = isLessonUnlocked(lesson.id, completedLessonIds, startUnit);
                        return (
                          <li key={lesson.id}>
                            <button
                              disabled={!unlocked}
                              onClick={() => onOpenLesson(lesson)}
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                                unlocked ? 'hover:bg-white/[0.05]' : 'cursor-not-allowed opacity-40'
                              }`}
                            >
                              <span
                                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${
                                  isDone
                                    ? 'bg-emerald-400/20 text-emerald-300'
                                    : unlocked
                                      ? 'border border-white/20 text-white/50'
                                      : 'text-white/30'
                                }`}
                              >
                                {isDone ? '✓' : unlocked ? '' : '🔒'}
                              </span>
                              <span className={isDone ? 'text-white/60' : 'text-white/90'}>{lesson.title}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Page>
  );
}
