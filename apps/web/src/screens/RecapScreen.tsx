import { useEffect, useRef, useState } from 'react';
import {
  scoreLesson,
  levelForXp,
  lessonsByUnit,
  unitById,
  type ConversationMode,
  type Lesson,
  type LessonScore,
  type Recap,
  type Turn,
} from '@fluentmap/core/conversation';
import { getRecap } from '../lib/api';
import { useStore } from '../store';
import { track } from '../lib/analytics';
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
  const { profile, addRecap, finishLesson, recordWarmup, xp, completedLessonIds } = useStore();
  const [recap, setRecap] = useState<Recap | null>(null);
  const [score, setScore] = useState<LessonScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [celebrations, setCelebrations] = useState<{ emoji: string; title: string; subtitle?: string }[]>([]);
  const ran = useRef(false);

  const spoke = transcript.some((t) => t.speaker === 'learner' && t.text.trim().length > 0);
  const title = lesson?.title ?? 'Daily free-talk';

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!spoke) return;
    let active = true;
    void (async () => {
      try {
        const r = await getRecap({ transcript, mode, supportLanguage: profile.l1, lesson });
        if (!active) return;
        setRecap(r);
        if (lesson) {
          const sc = scoreLesson(r, lesson, transcript);
          setScore(sc);
          const newXp = xp + sc.xp;
          const unitLessons = lessonsByUnit(lesson.unitId);
          const doneAfter = new Set([...completedLessonIds, lesson.id]);
          const unitDone = unitLessons.length > 0 && unitLessons.every((l) => doneAfter.has(l.id));
          const leveledUp = levelForXp(newXp) > levelForXp(xp);
          const queue: { emoji: string; title: string; subtitle?: string }[] = [];
          if (unitDone) queue.push({ emoji: '🏆', title: 'Unit complete!', subtitle: unitById(lesson.unitId)?.title });
          if (leveledUp)
            queue.push({ emoji: '⚡', title: `Level ${levelForXp(newXp)}!`, subtitle: "You're getting more fluent." });
          setCelebrations(queue);
          finishLesson(lesson.id, sc);
          track('lesson_complete', { lesson: lesson.id, stars: sc.stars, xp: sc.xp });
          if (unitDone) track('unit_complete', { unit: lesson.unitId });
          if (leveledUp) track('level_up', { level: levelForXp(newXp) });
        } else {
          recordWarmup();
        }
        track('session_end', { mode });
        addRecap({ mode, title, recap: r });
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    })();
    return () => {
      active = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
