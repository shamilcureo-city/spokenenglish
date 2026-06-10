import { SKILLS, countMastered, masteredSince } from '@fluentmap/core/science';
import { activationFunnel, activationScore, nextStep } from '@fluentmap/core/domain';
import { useStore } from '../store';
import { buildL1Insights } from '../mock/learner';

export function ProgressScreen({ onBack }: { onBack: () => void }) {
  const { profile, skillStates, streak, reviewsDone, assessment, trackId, now } = useStore();

  const mastered = countMastered(skillStates, now);
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const masteredWeek = masteredSince(skillStates, SKILLS, weekAgo, now).length;

  const funnel = activationFunnel({
    hasProfile: profile.name.length > 0,
    assessed: assessment !== null || skillStates.length > 0,
    enrolled: trackId !== null,
    practiced: skillStates.some((s) => s.reps > 0),
    reviewed: reviewsDone > 0,
    habit: streak >= 7,
  });
  const activation = activationScore(funnel);
  const next = nextStep(funnel);

  const patternsFixed = buildL1Insights(profile.l1).reduce((a, i) => a + i.fixed, 0);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <header className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/50 hover:text-white/80">
          ← Map
        </button>
        <div className="text-sm font-semibold">Your progress</div>
        <div className="w-16" />
      </header>

      <section className="mb-5 flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-amber-400/10 text-4xl">🔥</div>
        <div>
          <div className="text-3xl font-bold tabular-nums">{streak} days</div>
          <div className="text-sm text-white/50">practice streak — keep it alive!</div>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-3 gap-3">
        <Stat value={`${masteredWeek}`} label="mastered this week" accent="#f4c430" />
        <Stat value={`${reviewsDone}`} label="reviews done" accent="#34d399" />
        <Stat value={`${mastered}`} label={`of ${SKILLS.length} skills`} />
      </section>

      <section className="mb-5 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/80">Your journey</h2>
          <span className="text-xs tabular-nums text-white/40">{activation}% there</span>
        </div>
        <ul className="space-y-2.5">
          {funnel.map((step) => (
            <li key={step.key} className="flex items-center gap-3">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                  step.complete ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/[0.05] text-white/30'
                }`}
              >
                {step.complete ? '✓' : '○'}
              </span>
              <span className={`text-sm ${step.complete ? 'text-white/75' : 'text-white/40'}`}>
                {step.label}
              </span>
            </li>
          ))}
        </ul>
        {next && (
          <p className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/[0.06] px-4 py-2 text-xs text-amber-200/90">
            Next up: {next.label}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="text-sm font-semibold text-white/80">Mother-tongue patterns fixed</h2>
        <p className="mt-1 text-xs text-white/45">
          {patternsFixed} {profile.l1} transfer mistakes corrected so far — that's the moat working for you.
        </p>
      </section>
    </div>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
      <div className="text-2xl font-bold tabular-nums" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      <div className="text-[11px] text-white/40">{label}</div>
    </div>
  );
}
