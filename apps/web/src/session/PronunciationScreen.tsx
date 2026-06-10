import { useMemo, useState } from 'react';
import { phonemeDrills } from '@fluentmap/core/domain';
import {
  L1_TRANSFER_RULES,
  resolveExplanation,
  computeMastery,
  type L1,
  type Rating,
} from '@fluentmap/core/science';
import { useStore } from '../store';

const GRADES: { rating: Rating; label: string; color: string }[] = [
  { rating: 1, label: 'Tough', color: 'bg-red-500/80 hover:bg-red-500' },
  { rating: 2, label: 'Okay', color: 'bg-amber-500/80 hover:bg-amber-500' },
  { rating: 3, label: 'Good', color: 'bg-emerald-500/80 hover:bg-emerald-500' },
  { rating: 4, label: 'Easy', color: 'bg-blue-500/80 hover:bg-blue-500' },
];

function l1TipFor(skillId: string, l1: L1): string | null {
  const rule = L1_TRANSFER_RULES.find(
    (r) => r.category === 'phonetic' && r.skillId === skillId && r.l1 === l1,
  );
  return rule ? resolveExplanation(rule, l1) : null;
}

export function PronunciationScreen({ onBack }: { onBack: () => void }) {
  const { profile, skillStates, practiceSkill, now } = useStore();

  // Weakest sounds first.
  const ordered = useMemo(() => {
    const masteryOf = (skillId: string): number => {
      const st = skillStates.find((s) => s.skillId === skillId);
      return st ? computeMastery(st, now) : 0;
    };
    return [...phonemeDrills].sort((a, b) => masteryOf(a.skillId) - masteryOf(b.skillId));
  }, [skillStates, now]);

  const [idx, setIdx] = useState(0);
  const drill = ordered[idx];

  function grade(rating: Rating) {
    if (drill) practiceSkill(drill.skillId, rating);
    setIdx((i) => (i + 1) % ordered.length);
  }

  if (!drill) return null;
  const l1Tip = l1TipFor(drill.skillId, profile.l1 as L1);

  return (
    <div className="mx-auto max-w-xl px-5 py-8">
      <header className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/50 hover:text-white/80">
          ← Map
        </button>
        <div className="text-sm font-semibold">Sounds</div>
        <div className="w-16 text-right text-xs tabular-nums text-white/40">
          {idx + 1}/{ordered.length}
        </div>
      </header>

      <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/40">{drill.label}</div>
          <div className="mt-2 text-4xl font-bold tracking-tight text-blue-300">{drill.sound}</div>

          {drill.minimalPair && (
            <div className="mt-4 flex items-center justify-center gap-3 text-2xl font-semibold">
              <span className="text-emerald-300">{drill.minimalPair.a}</span>
              <span className="text-white/30">↔</span>
              <span className="text-amber-300">{drill.minimalPair.b}</span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {drill.examples.map((e) => (
              <span key={e} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-white/70">
                {e}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm leading-relaxed text-white/65">
          💡 {drill.tip}
        </div>
        {l1Tip && (
          <div className="mt-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4 text-sm leading-relaxed text-white/75">
            <span className="text-[11px] uppercase tracking-wider text-emerald-300/70">{profile.l1} tip</span>
            <div className="mt-1">{l1Tip}</div>
          </div>
        )}

        <p className="mt-5 text-center text-xs text-white/45">Say the words aloud. How did your pronunciation sound?</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {GRADES.map((g) => (
            <button
              key={g.rating}
              onClick={() => grade(g.rating)}
              className={`rounded-xl px-2 py-2.5 text-sm font-semibold text-white ${g.color}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </section>

      <p className="mt-4 text-center text-[11px] text-white/30">
        Targeted at the sounds your mother tongue makes hardest — graded onto the forgetting curve.
      </p>
    </div>
  );
}
