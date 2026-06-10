import type { ReactNode } from 'react';
import {
  SKILLS,
  L1_TRANSFER_RULES,
  MASTERY_WEIGHTS,
  REVIEW_HORIZON_DAYS,
  DEFAULT_FSRS,
} from '@fluentmap/core/science';
import { LESSONS } from '@fluentmap/core/domain';
import { ForgettingCurve } from './map/ForgettingCurve';

const skillCount = SKILLS.length;
const ruleCount = L1_TRANSFER_RULES.length;
const languageCount = new Set(L1_TRANSFER_RULES.map((r) => r.l1)).size;
const lessonCount = LESSONS.length;
const retentionPct = Math.round(DEFAULT_FSRS.requestRetention * 100);
const w = {
  durability: Math.round(MASTERY_WEIGHTS.durability * 100),
  accuracy: Math.round(MASTERY_WEIGHTS.accuracy * 100),
  freshness: Math.round(MASTERY_WEIGHTS.freshness * 100),
};

export function ScienceScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <header className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/50 hover:text-white/80">
          ← Back
        </button>
        <div className="text-sm font-semibold">The science</div>
        <div className="w-12" />
      </header>

      <h1 className="text-3xl font-bold tracking-tight">
        The <span className="bg-gradient-to-r from-emerald-300 to-amber-300 bg-clip-text text-transparent">exact science</span> of learning to speak
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        Most apps make you memorize. FluentMap measures the {skillCount} skills behind real
        conversation and trains the exact ones you're weak on — on the schedule your brain forgets.
        Here's how.
      </p>

      <div className="mt-7 space-y-4">
        <Pillar n={1} title="We break speaking into measurable skills" stat={`${skillCount} micro-skills`}>
          “Spoken English” isn't one thing. We split it into {skillCount} discrete skills — tenses,
          articles, discourse moves, vocabulary clusters, and pronunciation sounds — each tracked
          with a live mastery score. Your map is literally these skills filling in.
        </Pillar>

        <Pillar n={2} title="We review right before you forget" stat={`${retentionPct}% retention`}>
          <p className="mb-3">
            Every skill rides a forgetting curve. We use <strong>FSRS</strong> (the modern
            spaced-repetition algorithm) to schedule each review at the moment your recall would drop
            to {retentionPct}% — not sooner (wasteful), not later (forgotten).
          </p>
          <div className="rounded-xl border border-white/5 bg-black/20 p-3">
            <ForgettingCurve stability={14} width={300} height={90} />
          </div>
        </Pillar>

        <Pillar n={3} title="We fix mistakes in your mother tongue" stat={`${languageCount} languages`}>
          When you slip, we diagnose <em>why</em> — the pattern your first language carries into
          English — and explain the fix in your own language, in native script. {ruleCount} curated
          transfer rules across {languageCount} languages (the moat).
        </Pillar>

        <Pillar n={4} title="We always teach your next step" stat={`${lessonCount}+ lessons`}>
          The app picks your weakest skill that's just above what you've mastered (the “i+1” zone)
          and opens the lesson that trains it. No fixed syllabus — the path adapts to you every day.
        </Pillar>

        <Pillar n={5} title="Your progress is transparent" stat={`${w.durability}/${w.accuracy}/${w.freshness}`}>
          We don't hand-wave “fluency.” Your mastery for every skill is a number you can see:
          <strong> {w.durability}% durability</strong> (how lasting the memory is) +{' '}
          <strong>{w.accuracy}% accuracy</strong> (how often you got it right) +{' '}
          <strong>{w.freshness}% freshness</strong> (how recently). A skill is “mastered” once it's
          durable past {REVIEW_HORIZON_DAYS} days.
        </Pillar>
      </div>

      <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-5 text-center">
        <p className="text-sm text-white/75">
          Speak a little every day. Watch the science do the rest.
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={onBack}
          className="rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-7 py-2.5 text-sm font-bold text-black hover:opacity-90"
        >
          Got it →
        </button>
      </div>
    </div>
  );
}

function Pillar({
  n,
  title,
  stat,
  children,
}: {
  n: number;
  title: string;
  stat: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="mb-2 flex items-center gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.06] text-xs font-bold text-white/60">
          {n}
        </span>
        <h2 className="flex-1 text-base font-semibold">{title}</h2>
        <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300/90">
          {stat}
        </span>
      </div>
      <div className="text-sm leading-relaxed text-white/60">{children}</div>
    </section>
  );
}
