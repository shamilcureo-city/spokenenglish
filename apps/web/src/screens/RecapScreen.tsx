import { useEffect, useRef, useState } from 'react';
import {
  scoreLesson,
  levelForXp,
  lessonsByUnit,
  unitById,
  humaneStreak,
  WARMUP_XP,
  type ConversationMode,
  type Lesson,
  type LessonScore,
  type Recap,
  type Turn,
} from '@fluentmap/core/conversation';
import { getRecap } from '../lib/api';
import { useStore, dateKey, shiftKey } from '../store';
import { track } from '../lib/analytics';
import { shareWin, renderWinCard, type Win } from '../lib/share';
import { Celebration } from './Celebration';
import { DimensionBar, Page } from './ui';

export function RecapScreen({
  transcript,
  mode,
  lesson,
  onDone,
  onRedo,
}: {
  transcript: Turn[];
  mode: ConversationMode;
  lesson?: Lesson;
  onDone: () => void;
  onRedo?: () => void;
}) {
  const { profile, addRecap, finishLesson, recordWarmup, xp, streak, days, completedLessonIds } = useStore();
  // This session counts today, but `days` won't include today until finishLesson/recordWarmup
  // commits on the next render — so forward-correct the streak for the share card (like XP/level).
  const liveStreak = days.includes(dateKey()) ? streak : humaneStreak([...days, dateKey()], shiftKey);
  const [recap, setRecap] = useState<Recap | null>(null);
  const [score, setScore] = useState<LessonScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [celebrations, setCelebrations] = useState<{ emoji: string; title: string; subtitle?: string }[]>([]);
  const [win, setWin] = useState<Win | null>(null);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const ran = useRef(false);

  const spoke = transcript.some((t) => t.speaker === 'learner' && t.text.trim().length > 0);
  const title = lesson?.title ?? 'Daily free-talk';

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!spoke) return;
    // The `ran` guard already prevents the double-run; do NOT also add an unmount
    // cancellation flag — under StrictMode the two together strand the recap on its
    // loading state forever (the remount short-circuits before re-arming the flag).
    void (async () => {
      try {
        const r = await getRecap({ transcript, mode, supportLanguage: profile.l1, lesson });
        setRecap(r);
        let nextWin: Win;
        if (lesson) {
          const sc = scoreLesson(r, lesson, transcript);
          setScore(sc);
          const newXp = xp + sc.xp;
          const unitLessons = lessonsByUnit(lesson.unitId);
          const doneAfter = new Set([...completedLessonIds, lesson.id]);
          // First clear vs. a redo (the weak-spot card invites redoing completed lessons):
          // only celebrate / count a unit as complete the first time it actually completes.
          const firstClear = !completedLessonIds.includes(lesson.id);
          const unitNewlyDone =
            firstClear && unitLessons.length > 0 && unitLessons.every((l) => doneAfter.has(l.id));
          const leveledUp = levelForXp(newXp) > levelForXp(xp); // XP rises on a redo too — legit
          const queue: { emoji: string; title: string; subtitle?: string }[] = [];
          if (unitNewlyDone)
            queue.push({ emoji: '🏆', title: 'Unit complete!', subtitle: unitById(lesson.unitId)?.title });
          if (leveledUp)
            queue.push({ emoji: '⚡', title: `Level ${levelForXp(newXp)}!`, subtitle: "You're getting more fluent." });
          setCelebrations(queue);
          finishLesson(lesson.id, sc);
          track('lesson_complete', { lesson: lesson.id, stars: sc.stars, xp: sc.xp, redo: !firstClear });
          if (unitNewlyDone) track('unit_complete', { unit: lesson.unitId });
          if (leveledUp) track('level_up', { level: levelForXp(newXp) });
          nextWin = {
            kind: leveledUp ? 'levelup' : unitNewlyDone ? 'unit' : 'lesson',
            title: unitNewlyDone ? unitById(lesson.unitId)?.title : lesson.title,
            stars: sc.stars,
            xp: sc.xp,
            streak: liveStreak,
            level: levelForXp(newXp),
          };
        } else {
          recordWarmup();
          nextWin = { kind: 'warmup', xp: WARMUP_XP, streak: liveStreak, level: levelForXp(xp + WARMUP_XP) };
        }
        setWin(nextWin);
        // Pre-render the share card now, so the Share click stays inside the user gesture.
        void renderWinCard(nextWin).then(setCardFile);
        track('session_end', { mode });
        addRecap({ mode, title, recap: r });
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function onShare() {
    if (!win) return;
    setShareMsg(null);
    const r = await shareWin(win, cardFile);
    track('share_win', { kind: win.kind, result: r });
    if (r === 'dismissed') return; // user backed out of the sheet — say nothing
    setShareMsg(
      r === 'copied'
        ? '📋 Copied — paste it into any chat.'
        : r === 'whatsapp'
          ? 'Opening WhatsApp…'
          : r === 'shared'
            ? 'Thanks for spreading the word 💚'
            : "Sharing isn't available on this device.",
    );
  }

  if (!spoke) {
    return (
      <Page>
        <div className="grid min-h-[60vh] place-items-center text-center">
          <div>
            <div className="mb-3 text-3xl">🎤</div>
            <p className="text-sm text-white/60">I didn't catch any speech that time.</p>
            <div className="mt-5 flex justify-center gap-3">
              {onRedo && (
                <button onClick={onRedo} className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-6 py-2.5 text-sm font-bold text-black">
                  Try again
                </button>
              )}
              <button onClick={onDone} className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold hover:bg-white/[0.06]">
                Done
              </button>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <div className="grid min-h-[60vh] place-items-center text-center">
          <div>
            <p className="text-sm text-red-300/80">Couldn't build your feedback.</p>
            <p className="mt-1 text-xs text-white/40">{error}</p>
            <button onClick={onDone} className="mt-5 rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold hover:bg-white/[0.06]">
              Done
            </button>
          </div>
        </div>
      </Page>
    );
  }

  if (!recap) {
    return (
      <Page>
        <div className="grid min-h-[60vh] place-items-center text-center">
          <div className="animate-pulse">
            <div className="mb-3 text-3xl">✨</div>
            <p className="text-sm text-white/55">Looking at how that went…</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {celebrations.length > 0 && (
        <Celebration
          emoji={celebrations[0]!.emoji}
          title={celebrations[0]!.title}
          subtitle={celebrations[0]!.subtitle}
          onDone={() => setCelebrations((c) => c.slice(1))}
        />
      )}

      {/* Lesson result — stars + XP (the earned-lesson reward) */}
      {score && lesson && (
        <section className="mb-5 rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.08] to-teal-300/[0.04] p-5 text-center">
          <div className="mb-1 text-3xl tracking-widest">
            {[1, 2, 3].map((n) => (
              <span key={n} className={n <= score.stars ? 'text-amber-300' : 'text-white/15'}>
                ★
              </span>
            ))}
          </div>
          <div className="text-lg font-bold text-emerald-200">+{score.xp} XP</div>
          {lesson.phrases.length > 0 && (
            <div className="mt-2 text-xs text-white/55">
              You used {score.usedMoves.length} of {lesson.phrases.length} target phrases
            </div>
          )}
          {score.usedMoves.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {score.usedMoves.map((m, i) => (
                <span key={i} className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs text-emerald-200">
                  ✓ {m}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Share my win — the growth loop (WhatsApp-first) */}
      {win && (
        <div className="mb-6 flex flex-col items-center gap-2">
          <button
            onClick={() => void onShare()}
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3 text-sm font-bold text-black shadow-lg shadow-[#25D366]/20 transition hover:brightness-110"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 1.76.46 3.48 1.34 5L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.13c-.24.68-1.42 1.32-1.96 1.36-.5.05-.97.23-3.27-.68-2.76-1.09-4.5-3.92-4.64-4.1-.13-.18-1.1-1.47-1.1-2.8 0-1.34.7-1.99.95-2.27.25-.27.54-.34.72-.34h.52c.17.01.39-.06.61.47.24.56.81 1.94.88 2.08.07.14.12.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.43.12.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.22.61-.13.25.09 1.6.76 1.88.9.27.14.45.2.52.32.07.11.07.66-.17 1.34Z" />
            </svg>
            Share my win
          </button>
          {shareMsg && <p className="text-xs text-white/55">{shareMsg}</p>}
        </div>
      )}

      <h1 className="mb-1 text-xl font-bold">Here's how that went</h1>
      <p className="mb-5 text-sm leading-relaxed text-white/70">{recap.summary}</p>

      {recap.wins.length > 0 && (
        <section className="mb-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-300/80">What worked</h2>
          <ul className="space-y-1.5">
            {recap.wins.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm text-white/80">
                <span className="text-emerald-400">✓</span>
                {w}
              </li>
            ))}
          </ul>
        </section>
      )}

      {recap.fixes.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">One or two things to try</h2>
          <ul className="space-y-3">
            {recap.fixes.map((f, i) => (
              <li key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                {f.said && <div className="text-sm text-white/40 line-through">{f.said}</div>}
                <div className="mt-0.5 text-sm font-medium text-emerald-200">{f.better}</div>
                {f.why && <div className="mt-1.5 text-xs text-white/55">{f.why}</div>}
                {f.explanationInL1 && (
                  <div className="mt-2 rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-white/75">{f.explanationInL1}</div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {recap.strongerAnswers.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Stronger answers</h2>
          <ul className="space-y-3">
            {recap.strongerAnswers.map((s, i) => (
              <li key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className="text-xs font-semibold text-white/55">{s.question}</div>
                <div className="mt-1.5 text-sm text-white/85">“{s.answer}”</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-5 grid grid-cols-2 gap-x-5 gap-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <DimensionBar label="Clarity" value={recap.dimensions.clarity} />
        <DimensionBar label="Concision" value={recap.dimensions.concision} />
        <DimensionBar label="Confidence" value={recap.dimensions.confidence} />
        <DimensionBar label="Structure" value={recap.dimensions.structure} />
        <DimensionBar label="Few fillers" value={recap.dimensions.filler} />
      </section>

      <div className="flex justify-center gap-3">
        {onRedo && (
          <button
            onClick={onRedo}
            className="rounded-full border border-white/15 px-7 py-3 text-sm font-semibold hover:bg-white/[0.06]"
          >
            Practise again
          </button>
        )}
        <button
          onClick={onDone}
          className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-7 py-3 text-sm font-bold text-black hover:opacity-90"
        >
          {mode === 'lesson' ? 'Complete & continue →' : 'Done'}
        </button>
      </div>
    </Page>
  );
}
