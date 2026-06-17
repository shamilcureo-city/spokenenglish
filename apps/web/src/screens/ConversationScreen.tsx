import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildPartnerPrompt,
  weakestConcepts,
  COACH_NAME,
  type ConversationMode,
  type Lesson,
  type Turn,
} from '@fluentmap/core/conversation';
import { useGeminiLive } from '../voice/useGeminiLive';
import { AudioVisualizer } from '../session/AudioVisualizer';
import { useStore } from '../store';
import { DAILY_FREE_LIVE_SECONDS, IDLE_MS, MAX_SESSION_SECONDS } from '../lib/constants';
import { track } from '../lib/analytics';
import { Page } from './ui';

function mmss(total: number): string {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function ConversationScreen({
  mode,
  lesson,
  warmupPrompt,
  onEnd,
  onBack,
}: {
  mode: ConversationMode;
  lesson?: Lesson;
  warmupPrompt?: string;
  onEnd: (transcript: Turn[], recording?: Blob) => void;
  onBack: () => void;
}) {
  const { profile, lessonAttempts, mastery, liveSecondsUsedToday, recordLiveSeconds } = useStore();
  const secondsLeft = Math.max(0, DAILY_FREE_LIVE_SECONDS - liveSecondsUsedToday);
  const outOfMinutes = secondsLeft <= 0;
  const attempt = lesson ? lessonAttempts[lesson.id] ?? 0 : 0;

  const systemInstruction = useMemo(
    () =>
      buildPartnerPrompt({
        mode,
        supportLanguage: profile.l1,
        userName: profile.name,
        warmupPrompt,
        lesson,
        attempt,
        goal: profile.goal,
        interests: profile.interests,
        focus: weakestConcepts(mastery, 4).map((m) => m.label),
      }),
    [mode, profile.l1, profile.name, warmupPrompt, lesson, attempt, profile.goal, profile.interests, mastery],
  );

  const { status, transcript, elapsed, analyser, micBlocked, start, stop, sendText, getRecording } =
    useGeminiLive(systemInstruction);
  const [draft, setDraft] = useState('');

  const isActive = status === 'connecting' || status === 'listening' || status === 'ai-speaking';
  const isError = status.startsWith('error');
  const errorMsg = isError ? status.slice('error:'.length).trim() : null;
  const canType = status === 'listening' || status === 'ai-speaking';

  // Idle clock — reset whenever the learner speaks (or types).
  const lastActivityRef = useRef(Date.now());
  const learnerChars = transcript.reduce((n, t) => (t.speaker === 'learner' ? n + t.text.length : n), 0);
  useEffect(() => {
    lastActivityRef.current = Date.now();
  }, [learnerChars]);

  function begin() {
    lastActivityRef.current = Date.now();
    track('session_start', { mode });
    void start();
  }

  function submitDraft() {
    const t = draft.trim();
    if (!t) return;
    sendText(t);
    setDraft('');
  }

  const title = lesson?.title ?? 'Daily free-talk';
  const statusLabel =
    status === 'connecting'
      ? 'Connecting…'
      : status === 'listening'
        ? 'Listening — speak now'
        : status === 'ai-speaking'
          ? 'Speaking…'
          : isError
            ? 'Something went wrong'
            : `${COACH_NAME} is ready when you are`;

  function end() {
    const recording = getRecording() ?? undefined; // grab before teardown
    stop();
    if (elapsed > 0) recordLiveSeconds(elapsed); // COGS metering
    onEnd(transcript, recording);
  }

  // COGS guardrails: auto-end on prolonged silence or at the hard session cap.
  useEffect(() => {
    if (!isActive || elapsed === 0) return;
    const idleMs = Date.now() - lastActivityRef.current;
    const idleOut = status === 'listening' && elapsed > 5 && idleMs > IDLE_MS;
    if (elapsed >= MAX_SESSION_SECONDS || idleOut) end();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  return (
    <Page>
      <header className="mb-5 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/50 hover:text-white/85">
          ← Back
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-[11px] text-white/40">{lesson ? lesson.fn : `${profile.l1} support`}</div>
        </div>
        <div className="w-12 text-right font-mono text-sm tabular-nums text-white/55">{mmss(elapsed)}</div>
      </header>

      {/* Pre-start context */}
      {!isActive && transcript.length === 0 && (
        <div className="mb-5 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          {lesson ? (
            <>
              <p className="text-sm text-white/75">
                Goal: <span className="text-emerald-200">{lesson.canDo}</span>
              </p>
              <div className="mt-3">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  Try to use
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {lesson.phrases.map((p, i) => (
                    <span key={i} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-white/70">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-white/75">{warmupPrompt}</p>
          )}
          <p className="mt-3 border-t border-white/5 pt-3 text-xs text-white/40">
            {COACH_NAME} will say hi first — press start, listen, then just reply. No rush.
          </p>
        </div>
      )}

      {/* Stage */}
      <section className="mb-5 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="mb-4 flex flex-col items-center gap-3">
          <div
            className={`grid h-20 w-20 place-items-center rounded-full text-3xl transition-all ${
              status === 'listening'
                ? 'bg-emerald-400/15 ring-2 ring-emerald-400/50'
                : status === 'ai-speaking'
                  ? 'bg-teal-300/15 ring-2 ring-teal-300/50'
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

        <div className="mt-5 flex flex-col items-center gap-2">
          {isActive ? (
            <button
              onClick={end}
              className="rounded-full bg-red-500/90 px-7 py-2.5 text-sm font-semibold text-white hover:bg-red-500"
            >
              End &amp; see feedback →
            </button>
          ) : outOfMinutes ? (
            <div className="text-center">
              <div className="text-sm text-amber-200/90">You've used today's free practice.</div>
              <div className="mt-1 text-xs text-white/45">Come back tomorrow for more.</div>
            </div>
          ) : (
            <>
              <button
                onClick={begin}
                className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-8 py-3 text-sm font-bold text-black hover:opacity-90"
              >
                {transcript.length > 0 ? 'Start again' : 'Start speaking'}
              </button>
              <span className="text-[11px] text-white/35">
                {Math.ceil(secondsLeft / 60)} min of free practice left today
              </span>
            </>
          )}
        </div>

        {errorMsg && (
          <p className="mt-3 text-center text-xs text-red-300/80">
            {errorMsg}
            <br />
            <span className="text-white/35">
              Make sure the API server is running (npm run dev:api) and allow microphone access.
            </span>
          </p>
        )}
      </section>

      {/* Mic-blocked notice + type-to-reply fallback */}
      {(canType || micBlocked) && (
        <section className="mb-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          {micBlocked && (
            <p className="mb-3 text-xs text-amber-200/90">
              🎤 Your mic is blocked — you can still hear your partner. Type your replies below, or allow the
              mic in your browser and press Start again.
            </p>
          )}
          {canType && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitDraft();
              }}
              className="flex gap-2"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Or type your reply…"
                className="flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-emerald-400/50"
              />
              <button
                type="submit"
                className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-white/15"
              >
                Send
              </button>
            </form>
          )}
        </section>
      )}

      {/* Live transcript */}
      {transcript.length > 0 && (
        <section className="mb-5 space-y-2.5 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          {transcript.map((t, i) => (
            <div key={i} className={`flex ${t.speaker === 'learner' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  t.speaker === 'learner'
                    ? 'bg-emerald-400/15 text-emerald-50'
                    : 'bg-white/[0.06] text-white/80'
                }`}
              >
                {t.text}
              </div>
            </div>
          ))}
        </section>
      )}

      {!isActive && transcript.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={end}
            className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold hover:bg-white/[0.08]"
          >
            See my feedback →
          </button>
        </div>
      )}
    </Page>
  );
}
