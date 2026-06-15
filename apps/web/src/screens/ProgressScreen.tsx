import { LEVELS, courseProgress, levelProgress, type RecapDimensions } from '@fluentmap/core/conversation';
import { useStore } from '../store';
import { DimensionBar, Page } from './ui';

const DIM_KEYS: (keyof RecapDimensions)[] = ['clarity', 'concision', 'confidence', 'structure', 'filler'];
const DIM_LABELS: Record<keyof RecapDimensions, string> = {
  clarity: 'Clarity',
  concision: 'Concision',
  confidence: 'Confidence',
  structure: 'Structure',
  filler: 'Few fillers',
};

export function ProgressScreen({ onBack }: { onBack: () => void }) {
  const { completedLessonIds, recaps, streak, weekProgress, weeklyGoal } = useStore();
  const overall = courseProgress(completedLessonIds);

  // Average the last 10 recaps' dimensions for a simple "how you're doing" read.
  const recent = recaps.slice(0, 10);
  const avg =
    recent.length > 0
      ? DIM_KEYS.reduce((acc, k) => {
          acc[k] = Math.round(recent.reduce((s, r) => s + r.recap.dimensions[k], 0) / recent.length);
          return acc;
        }, {} as Record<keyof RecapDimensions, number>)
      : null;

  return (
    <Page>
      <header className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/50 hover:text-white/85">
          ← Back
        </button>
        <div className="text-sm font-semibold">Your progress</div>
        <div className="w-12" />
      </header>

      <div className="mb-5 grid grid-cols-3 gap-3 text-center">
        <Stat value={`${overall.pct}%`} label="course done" />
        <Stat value={`${streak}`} label="day streak" />
        <Stat value={`${weekProgress}/${weeklyGoal}`} label="this week" />
      </div>

      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Levels</h2>
        <div className="space-y-3">
          {LEVELS.map((level) => {
            const lp = levelProgress(level.id, completedLessonIds);
            return (
              <div key={level.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-sm font-semibold">{level.title}</span>
                  <span className="text-xs text-white/40">
                    {lp.done}/{lp.total}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                    style={{ width: `${lp.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {avg && (
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            How you're speaking <span className="font-normal lowercase text-white/30">· recent average</span>
          </h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            {DIM_KEYS.map((k) => (
              <DimensionBar key={k} label={DIM_LABELS[k]} value={avg[k]} />
            ))}
          </div>
        </section>
      )}

      {recaps.length === 0 && (
        <p className="mt-6 text-center text-sm text-white/40">
          Finish a lesson or a free-talk and your progress shows up here.
        </p>
      )}
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
