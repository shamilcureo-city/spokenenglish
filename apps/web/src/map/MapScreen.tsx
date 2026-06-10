import { useMemo } from 'react';
import {
  SKILLS,
  fluentMapScore,
  cefrCoverage,
  countMastered,
  retentionPercent,
  weakestSkills,
  type SkillState,
} from '@fluentmap/core/science';
import { getRemainingMinutes, getPlanByName, toDateKey } from '@fluentmap/core/domain';
import { buildL1Insights } from '../mock/learner';
import { useStore } from '../store';
import { ScoreRing } from './ScoreRing';
import { ForgettingCurve } from './ForgettingCurve';
import { BrainMap } from './BrainMap';

const LEGEND = [
  { label: 'Not started', color: '#2b3040' },
  { label: 'Learning', color: '#f59e0b' },
  { label: 'Reviewing', color: '#34d399' },
  { label: 'Mastered', color: '#f4c430' },
];

export function MapScreen({
  onStartPractice,
  onStartReview,
}: {
  onStartPractice?: () => void;
  onStartReview?: () => void;
}) {
  const { profile, skillStates: states, reviewItems, now } = useStore();
  const stateById = useMemo(() => new Map(states.map((s) => [s.skillId, s])), [states]);

  const score = fluentMapScore(states, SKILLS, now);
  const coverage = cefrCoverage(states, SKILLS, now);
  const mastered = countMastered(states, now);
  const due = reviewItems.filter((r) => !r.suspended && new Date(r.dueAt) <= now).length;
  const retention = retentionPercent(states, now);
  const weakest = weakestSkills(states, SKILLS, 5, now);
  const insights = buildL1Insights(profile.l1);

  // Daily-minutes entitlement (demo usage; real usage tracked in the store later).
  const plan = 'Free';
  const todayKey = toDateKey(now);
  const minutesLeft = getRemainingMinutes(plan, { date: todayKey, usedMinutes: 2 }, todayKey);
  const dailyMinutes = getPlanByName(plan).dailyMinutes;

  const curveState: SkillState | undefined = weakest[0] && stateById.get(weakest[0].skill.id);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* Top bar */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-amber-300 text-sm font-black text-black">
            F
          </span>
          <span className="text-lg font-semibold tracking-tight">FluentMap</span>
        </div>
        <div className="flex items-center gap-3">
          {due > 0 && (
            <button
              onClick={onStartReview}
              className="rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-1.5 text-sm font-semibold text-amber-200 hover:bg-amber-300/20"
            >
              Review {due}
            </button>
          )}
          <button
            onClick={onStartPractice}
            className="rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-4 py-1.5 text-sm font-bold text-black hover:opacity-90"
          >
            Practice →
          </button>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm">
            <span className="text-white/55">{profile.l1} · {profile.goal}</span>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-xs font-semibold">
              {profile.name[0]}
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mb-6 grid gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-5">
          <ScoreRing value={score} />
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
              FluentMap Score
            </div>
            <p className="mt-1 max-w-[15rem] text-sm text-white/55">
              Namaste, {profile.name}. Speak a little every day — watch your map fill in.
            </p>
            <p className="mt-2 text-[11px] text-white/40">
              {plan} plan · <span className="text-white/70">{minutesLeft}/{dailyMinutes} min</span> left today
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 self-center">
          <Stat label="Skills mastered" value={`${mastered}`} sub={`of ${SKILLS.length}`} />
          <Stat label="Reviews due" value={`${due}`} sub="today" accent="#f59e0b" />
          <Stat label="Retention" value={`${retention}%`} sub="fresh now" accent="#34d399" />
        </div>
      </section>

      {/* CEFR coverage */}
      <section className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="mb-4 text-sm font-semibold text-white/80">CEFR coverage</h2>
        <div className="grid gap-4 sm:grid-cols-5">
          {coverage.map((b) => (
            <div key={b.band}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm font-semibold">{b.band}</span>
                <span className="text-[11px] tabular-nums text-white/40">
                  {b.mastered}/{b.total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300"
                  style={{ width: `${b.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Map + sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/80">Your brain map</h2>
            <div className="flex flex-wrap gap-3">
              {LEGEND.map((l) => (
                <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-white/45">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          <BrainMap skills={SKILLS} stateById={stateById} now={now} />
        </section>

        <aside className="space-y-6">
          {/* Weakest skills */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="mb-3 text-sm font-semibold text-white/80">Focus next</h2>
            <ul className="space-y-2.5">
              {weakest.map((w) => (
                <li key={w.skill.id} className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${Math.max(6, Math.round(w.mastery * 100))}%` }}
                    />
                  </div>
                  <span className="w-1/2 truncate text-xs text-white/65" title={w.skill.label}>
                    {w.skill.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Forgetting curve */}
          {curveState && weakest[0] && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <h2 className="text-sm font-semibold text-white/80">The science</h2>
              <p className="mb-3 mt-0.5 text-xs text-white/45">
                Memory for “{weakest[0].skill.label}” over time — and when we'll review it.
              </p>
              <ForgettingCurve stability={curveState.stability} />
            </div>
          )}

          {/* L1 insight */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold text-white/80">
              Your {profile.l1} patterns
            </h2>
            <p className="mb-3 mt-0.5 text-xs text-white/45">
              Mistakes that come from your mother tongue — and how many you've fixed.
            </p>
            <ul className="space-y-3">
              {insights.map((it) => (
                <li key={it.title}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-xs text-white/70" title={it.title}>
                      {it.title}
                    </span>
                    <span className="text-[11px] tabular-nums text-white/40">
                      {it.fixed}/{it.total}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-white/45" title={it.explanation}>
                    {it.explanation}
                  </p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${Math.round((it.fixed / it.total) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <footer className="mt-8 text-center text-[11px] text-white/30">
        Demo data generated from the real FSRS engine · FluentMap Phase 1
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      <div className="text-[11px] text-white/35">{sub}</div>
    </div>
  );
}
