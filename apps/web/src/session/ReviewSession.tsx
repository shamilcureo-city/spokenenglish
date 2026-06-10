import { useState } from 'react';
import { getRule, resolveExplanation, type L1, type Rating } from '@fluentmap/core/science';
import { useStore } from '../store';

const GRADES: { rating: Rating; label: string; color: string }[] = [
  { rating: 1, label: 'Again', color: 'bg-red-500/80 hover:bg-red-500' },
  { rating: 2, label: 'Hard', color: 'bg-amber-500/80 hover:bg-amber-500' },
  { rating: 3, label: 'Good', color: 'bg-emerald-500/80 hover:bg-emerald-500' },
  { rating: 4, label: 'Easy', color: 'bg-blue-500/80 hover:bg-blue-500' },
];

export function ReviewSession({ onBack }: { onBack: () => void }) {
  const { profile, reviewItems, gradeReview, now } = useStore();
  const [revealed, setRevealed] = useState(false);

  const due = reviewItems.filter((r) => !r.suspended && new Date(r.dueAt) <= now);
  const item = due[0];

  function grade(rating: Rating) {
    if (!item) return;
    gradeReview(item, rating);
    setRevealed(false);
  }

  const rule = item?.l1RuleId ? getRule(item.l1RuleId) : undefined;
  const hint = rule ? resolveExplanation(rule, profile.l1 as L1) : '';

  return (
    <div className="mx-auto max-w-xl px-5 py-8">
      <header className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/50 hover:text-white/80">
          ← Map
        </button>
        <div className="text-sm font-semibold">Reviews</div>
        <div className="w-16 text-right text-sm tabular-nums text-white/50">{due.length} left</div>
      </header>

      {!item ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-10 text-center">
          <div className="text-4xl">✅</div>
          <h2 className="mt-3 text-lg font-bold">All caught up!</h2>
          <p className="mt-1 text-sm text-white/50">No reviews due right now. Come back later, or start a lesson.</p>
          <button
            onClick={onBack}
            className="mt-5 rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-6 py-2.5 text-sm font-bold text-black hover:opacity-90"
          >
            Back to map
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/40">Practice this</div>
          <p className="mt-2 text-xl font-medium">{item.prompt}</p>

          {revealed ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
                <div className="text-[11px] uppercase tracking-wider text-emerald-300/70">Answer</div>
                <p className="mt-1 text-lg text-emerald-200">{item.expected}</p>
              </div>
              {hint && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="text-[11px] uppercase tracking-wider text-white/40">Why ({profile.l1})</div>
                  <p className="mt-1 text-sm text-white/70">{hint}</p>
                </div>
              )}
              <div className="grid grid-cols-4 gap-2 pt-1">
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
              <p className="text-center text-[11px] text-white/30">How well did you recall it?</p>
            </div>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="mt-6 w-full rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold hover:bg-white/[0.08]"
            >
              Show answer
            </button>
          )}
        </div>
      )}

      {item && (
        <p className="mt-4 text-center text-[11px] text-white/30">
          Spaced repetition — graded reviews come back on the forgetting curve.
        </p>
      )}
    </div>
  );
}
