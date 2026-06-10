import { useStore } from '../store';
import { ScoreRing } from '../map/ScoreRing';

const TRACK_LABEL: Record<string, string> = {
  basic: 'Basic English',
  intermediate: 'Intermediate English',
  advanced: 'Advanced English',
};

export function AssessmentResult() {
  const { assessment, enroll, startAssessment } = useStore();
  if (!assessment) return null;
  const { placement, summary, strengths, focusAreas } = assessment;

  return (
    <div className="mx-auto max-w-lg px-5 py-10">
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Your Speak Score</div>
        <div className="mt-4 flex justify-center">
          <ScoreRing value={placement.speakScore} size={160} />
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm">
          <span className="font-bold text-emerald-300">{placement.band}</span>
          <span className="text-white/55">{placement.bandLabel}</span>
        </div>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/65">{summary}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-300/80">Strengths</div>
          <ul className="space-y-1.5 text-sm text-white/70">
            {strengths.map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-300/80">Focus next</div>
          <ul className="space-y-1.5 text-sm text-white/70">
            {focusAreas.map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center">
        <div className="text-xs uppercase tracking-wider text-white/40">Your recommended course</div>
        <div className="mt-1 text-lg font-bold">{TRACK_LABEL[placement.track] ?? placement.track}</div>
        <div className="mt-1 text-xs text-white/45">{placement.rationale}</div>
      </div>

      <button
        onClick={enroll}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-amber-300 px-6 py-3.5 text-sm font-bold text-black hover:opacity-90"
      >
        Start learning → see my map
      </button>
      <button
        onClick={() => startAssessment()}
        className="mt-3 w-full text-center text-xs text-white/40 hover:text-white/60"
      >
        Retake the assessment
      </button>
    </div>
  );
}
