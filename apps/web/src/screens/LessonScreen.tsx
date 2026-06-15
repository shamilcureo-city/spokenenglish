import { useState } from 'react';
import type { Lesson, Turn } from '@fluentmap/core/conversation';
import { ConversationScreen } from './ConversationScreen';
import { RecapScreen } from './RecapScreen';
import { Page } from './ui';

/** A single lesson: Learn → Speak (live) → Feedback → complete. */
export function LessonScreen({
  lesson,
  onExit,
  onNext,
}: {
  lesson: Lesson;
  onExit: () => void;
  onNext: () => void;
}) {
  const [phase, setPhase] = useState<'learn' | 'speak' | 'feedback'>('learn');
  const [transcript, setTranscript] = useState<Turn[]>([]);

  if (phase === 'speak') {
    return (
      <ConversationScreen
        mode="lesson"
        lesson={lesson}
        onBack={() => setPhase('learn')}
        onEnd={(t) => {
          setTranscript(t);
          setPhase('feedback');
        }}
      />
    );
  }

  if (phase === 'feedback') {
    return (
      <RecapScreen
        transcript={transcript}
        mode="lesson"
        lesson={lesson}
        onRedo={() => setPhase('learn')}
        onDone={onNext}
      />
    );
  }

  // Learn
  return (
    <Page>
      <header className="mb-5 flex items-center justify-between">
        <button onClick={onExit} className="text-sm text-white/50 hover:text-white/85">
          ← Course
        </button>
        <div className="text-sm font-semibold">{lesson.title}</div>
        <div className="w-12" />
      </header>

      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Learn</div>
      <h1 className="text-xl font-bold">{lesson.fn}</h1>
      <p className="mt-1 text-sm text-white/60">
        By the end: <span className="text-white/85">{lesson.canDo}</span>
      </p>

      <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Say it like this</div>
        <ul className="space-y-2">
          {lesson.phrases.map((p, i) => (
            <li key={i} className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-white/85">
              “{p}”
            </li>
          ))}
        </ul>
        {lesson.l1Note && (
          <div className="mt-3 rounded-lg border border-amber-300/15 bg-amber-300/[0.06] px-3 py-2 text-xs text-amber-100/80">
            Tip: {lesson.l1Note}
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-white/55">
        Now use these in a real conversation — I'll guide you.
      </p>
      <button
        onClick={() => setPhase('speak')}
        className="mt-3 w-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 py-3.5 text-sm font-bold text-black hover:opacity-90"
      >
        Start speaking →
      </button>
    </Page>
  );
}
