import { useMemo, useState } from 'react';
import {
  ASSESSMENT_STAGES,
  ASSESSMENT_TOTAL_SECONDS,
  READ_ALOUD_PASSAGE,
  buildExaminerPrompt,
  computeSpeakScore,
  scoreToPlacement,
} from '@fluentmap/core/domain';
import { useStore } from '../store';
import { useGeminiLive } from '../voice/useGeminiLive';
import { scoreAssessment } from '../lib/api';
import { AudioVisualizer } from '../session/AudioVisualizer';

function currentStageIndex(elapsed: number): number {
  let acc = 0;
  for (let i = 0; i < ASSESSMENT_STAGES.length; i++) {
    acc += ASSESSMENT_STAGES[i]!.seconds;
    if (elapsed < acc) return i;
  }
  return ASSESSMENT_STAGES.length - 1;
}

export function AssessmentFlow() {
  const { profile, saveAssessment, startAssessment } = useStore();
  const examiner = useMemo(() => buildExaminerPrompt({ supportLanguage: profile.l1 }), [profile.l1]);
  const { status, transcript, elapsed, analyser, start, stop } = useGeminiLive(examiner);

  const [scoring, setScoring] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isActive = status === 'connecting' || status === 'listening' || status === 'ai-speaking';
  const isError = status.startsWith('error');
  const stageIdx = currentStageIndex(elapsed);
  const remaining = Math.max(0, ASSESSMENT_TOTAL_SECONDS - elapsed);

  async function finish() {
    setScoring(true);
    setErr(null);
    try {
      const score = await scoreAssessment(transcript, profile.l1);
      const speakScore = computeSpeakScore(score.subScores);
      saveAssessment({
        placement: scoreToPlacement(speakScore),
        subScores: score.subScores,
        summary: score.summary,
        strengths: score.strengths,
        focusAreas: score.focusAreas,
        takenAt: new Date().toISOString(),
      });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setScoring(false);
    }
  }

  function skip() {
    const subScores = { fluency: 58, pronunciation: 55, grammar: 60, vocabulary: 57, interaction: 52 };
    saveAssessment({
      placement: scoreToPlacement(computeSpeakScore(subScores)),
      subScores,
      summary: 'Sample placement — assessment skipped. Take it any time for an accurate level.',
      strengths: ['Clear simple sentences', 'Good everyday vocabulary'],
      focusAreas: ['Past-tense accuracy', 'Linking ideas with connectors'],
      takenAt: new Date().toISOString(),
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-xl font-bold">5-minute assessment</h1>
        <p className="text-xs text-white/45">
          Speak naturally with the examiner. {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} left
        </p>
      </header>

      {/* Stage stepper */}
      <div className="mb-5 flex gap-1.5">
        {ASSESSMENT_STAGES.map((s, i) => (
          <div key={s.id} className="flex-1">
            <div
              className={`h-1.5 rounded-full ${
                i < stageIdx ? 'bg-emerald-400' : i === stageIdx && isActive ? 'bg-amber-300' : 'bg-white/10'
              }`}
            />
            <div className={`mt-1 text-center text-[10px] ${i === stageIdx ? 'text-white/70' : 'text-white/30'}`}>
              {s.title}
            </div>
          </div>
        ))}
      </div>

      {/* Stage card */}
      <section className="mb-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="mb-3 flex items-center gap-3">
          <div
            className={`grid h-12 w-12 place-items-center rounded-full text-xl ${
              status === 'listening'
                ? 'bg-emerald-400/15 ring-2 ring-emerald-400/50'
                : status === 'ai-speaking'
                  ? 'bg-blue-400/15 ring-2 ring-blue-400/50'
                  : isError
                    ? 'bg-red-400/10 ring-2 ring-red-400/40'
                    : 'bg-white/[0.04] ring-1 ring-white/10'
            }`}
          >
            {status === 'ai-speaking' ? '🔊' : isError ? '⚠️' : '🎤'}
          </div>
          <div className="text-sm text-white/75">{ASSESSMENT_STAGES[stageIdx]!.instruction}</div>
        </div>
        <AudioVisualizer analyser={analyser} />

        {stageIdx === 1 && (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-relaxed text-white/75">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
              Read this aloud when asked
            </div>
            “{READ_ALOUD_PASSAGE}”
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-3">
          {isActive ? (
            <button onClick={stop} className="rounded-full bg-red-500/90 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-500">
              End early
            </button>
          ) : (
            <button
              onClick={start}
              className="rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-7 py-2.5 text-sm font-bold text-black hover:opacity-90"
            >
              {transcript.length > 0 ? 'Resume' : 'Start assessment'}
            </button>
          )}
        </div>
        {isError && (
          <div className="mt-4 text-center">
            <p className="text-xs text-white/45">
              The live examiner needs the backend running. Skip to explore the whole app now:
            </p>
            <button
              onClick={skip}
              className="mt-3 rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-6 py-2.5 text-sm font-bold text-black hover:opacity-90"
            >
              Skip &amp; explore the app (sample level) →
            </button>
          </div>
        )}
      </section>

      {transcript.length > 0 && !isActive && (
        <div className="mb-4 flex justify-center">
          <button
            onClick={finish}
            disabled={scoring}
            className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold hover:bg-white/[0.08] disabled:opacity-50"
          >
            {scoring ? 'Scoring…' : 'Finish & see my level →'}
          </button>
        </div>
      )}
      {err && <p className="mb-3 text-center text-xs text-red-300/80">{err}</p>}

      <div className="flex items-center justify-center gap-4 text-xs text-white/35">
        <button onClick={skip} className="underline hover:text-white/60">
          Skip for now (sample level)
        </button>
        <button onClick={() => startAssessment()} className="hover:text-white/60">
          Restart
        </button>
      </div>
    </div>
  );
}
