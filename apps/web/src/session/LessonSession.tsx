import { useMemo, useState } from 'react';
import { ingestSessionEvidence, type IngestResult } from '@fluentmap/core/science';
import type { AssembledSession } from '@fluentmap/core/scoring';
import type { Lesson } from '@fluentmap/core/domain';
import { useGeminiLive } from '../voice/useGeminiLive';
import { buildCoachPrompt } from '../voice/coachPrompt';
import { scoreSession } from '../lib/api';
import { AudioVisualizer } from './AudioVisualizer';
import { useStore } from '../store';

function mmss(total: number): string {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function LessonSession({
  lesson,
  rationale,
  onBack,
}: {
  lesson: Lesson;
  rationale: string;
  onBack: () => void;
}) {
  const { profile, userId, skillStates, applyEvidence } = useStore();
  const systemInstruction = useMemo(
    () =>
      buildCoachPrompt({
        level: lesson.level,
        lessonTitle: lesson.title,
        scenario: lesson.scenario,
        supportLanguage: profile.l1,
      }),
    [profile.l1, lesson],
  );

  const { status, transcript, elapsed, analyser, start, stop } = useGeminiLive(systemInstruction);
  const [report, setReport] = useState<AssembledSession | null>(null);
  const [ingest, setIngest] = useState<IngestResult | null>(null);
  const [scoring, setScoring] = useState(false);
  const [scoreErr, setScoreErr] = useState<string | null>(null);

  const isActive = status === 'connecting' || status === 'listening' || status === 'ai-speaking';
  const isError = status.startsWith('error');
  const errorMsg = isError ? status.slice('error:'.length).trim() : null;

  const statusLabel =
    status === 'idle'
      ? 'Ready when you are'
      : status === 'connecting'
        ? 'Connecting to your coach…'
        : status === 'listening'
          ? 'Listening — speak now'
          : status === 'ai-speaking'
            ? 'Coach is speaking…'
            : 'Something went wrong';

  async function handleFinish() {
    setScoring(true);
    setScoreErr(null);
    try {
      const result = await scoreSession({
        sessionId: `sess-${Date.now()}`,
        userId: userId ?? 'demo',
        l1: profile.l1,
        lessonTitle: lesson.title,
        transcript,
      });
      setReport(result);
      const ig = ingestSessionEvidence(result.scored, skillStates, { now: new Date() });
      setIngest(ig);
      applyEvidence(ig);
    } catch (err) {
      setScoreErr((err as Error).message);
    } finally {
      setScoring(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <header className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/50 hover:text-white/80">
          ← Map
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold">{lesson.title}</div>
          <div className="text-[11px] text-white/40">{profile.l1} support · {lesson.level}</div>
        </div>
        <div className="w-16 text-right font-mono text-sm tabular-nums text-white/60">{mmss(elapsed)}</div>
      </header>

      <p className="mb-4 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2 text-center text-xs text-white/55">
        {rationale}
      </p>

      {/* Stage */}
      <section className="mb-5 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="mb-4 flex flex-col items-center gap-3">
          <div
            className={`grid h-20 w-20 place-items-center rounded-full text-3xl transition-all ${
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
          <div className="text-sm text-white/70">{statusLabel}</div>
        </div>

        <AudioVisualizer analyser={analyser} />

        <div className="mt-5 flex justify-center">
          {isActive ? (
            <button
              onClick={stop}
              className="rounded-full bg-red-500/90 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-500"
            >
              End session
            </button>
          ) : (
            <button
              onClick={start}
              className="rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-7 py-2.5 text-sm font-bold text-black hover:opacity-90"
            >
              {transcript.length > 0 ? 'Restart session' : 'Start session'}
            </button>
          )}
        </div>

        {errorMsg && (
          <p className="mt-3 text-center text-xs text-red-300/80">
            {errorMsg}
            <br />
            <span className="text-white/35">
              Start the backend (`supabase functions serve`) and allow microphone access.
            </span>
          </p>
        )}
        {!isActive && !isError && (
          <p className="mt-3 text-center text-[11px] text-white/30">
            Needs the edge functions running + a microphone.
          </p>
        )}
      </section>

      {/* Transcript */}
      {transcript.length > 0 && (
        <section className="mb-5 space-y-2.5 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/40">Transcript</h2>
          {transcript.map((t, i) => (
            <div key={i} className={`flex ${t.speaker === 'learner' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  t.speaker === 'learner' ? 'bg-emerald-400/15 text-emerald-50' : 'bg-white/[0.06] text-white/80'
                }`}
              >
                {t.text}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Finish → report */}
      {!isActive && transcript.length > 0 && !report && (
        <div className="flex justify-center">
          <button
            onClick={handleFinish}
            disabled={scoring}
            className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold hover:bg-white/[0.08] disabled:opacity-50"
          >
            {scoring ? 'Scoring…' : 'Get my report →'}
          </button>
        </div>
      )}
      {scoreErr && <p className="mt-3 text-center text-xs text-red-300/80">{scoreErr}</p>}

      {report && ingest && (
        <section className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/80">Session report</h2>
            <span className="text-2xl font-bold tabular-nums text-emerald-300">{report.overallScore}</span>
          </div>
          <p className="text-sm text-white/65">{report.summary}</p>

          <div className="flex gap-3 text-center text-xs">
            <div className="flex-1 rounded-lg bg-white/[0.03] p-3">
              <div className="text-lg font-bold">{ingest.updatedStates.length}</div>
              <div className="text-white/40">skills practiced</div>
            </div>
            <div className="flex-1 rounded-lg bg-white/[0.03] p-3">
              <div className="text-lg font-bold">{ingest.newReviewItems.length}</div>
              <div className="text-white/40">reviews scheduled</div>
            </div>
            <div className="flex-1 rounded-lg bg-white/[0.03] p-3">
              <div className="text-lg font-bold">{report.scored.observations.length}</div>
              <div className="text-white/40">skills used</div>
            </div>
          </div>

          {ingest.corrections.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                Corrections ({profile.l1})
              </h3>
              <ul className="space-y-2.5">
                {ingest.corrections.map((c) => (
                  <li key={c.id} className="rounded-lg bg-white/[0.03] p-3 text-sm">
                    <div className="text-red-300/80 line-through">{c.original}</div>
                    <div className="text-emerald-300">{c.corrected}</div>
                    <div className="mt-1 text-xs text-white/50">{c.explanation}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
