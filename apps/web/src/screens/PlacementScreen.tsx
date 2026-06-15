import { useState } from 'react';
import { LEVELS, type Placement, type Turn } from '@fluentmap/core/conversation';
import { placement as scorePlacement } from '../lib/api';
import { useStore } from '../store';
import { ConversationScreen } from './ConversationScreen';
import { Page } from './ui';

const OPENER =
  "Let's chat for a couple of minutes so I can find your level. Tell me about yourself — your day, your work or studies, and why you'd like to improve your English. Feel free to ask me things too!";

export function PlacementScreen({ onDone }: { onDone: () => void }) {
  const { profile, setPlacement } = useStore();
  const [phase, setPhase] = useState<'intro' | 'speak' | 'scoring' | 'result'>('intro');
  const [result, setResult] = useState<Placement | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function assess(t: Turn[]) {
    const spoke = t.some((x) => x.speaker === 'learner' && x.text.trim().length > 0);
    if (!spoke) {
      onDone(); // nothing said → just start at Foundation
      return;
    }
    setPhase('scoring');
    try {
      const r = await scorePlacement({ transcript: t, supportLanguage: profile.l1 });
      setResult(r);
      setPlacement(r);
    } catch (e) {
      setError((e as Error).message);
    }
    setPhase('result');
  }

  if (phase === 'speak') {
    return (
      <ConversationScreen mode="warmup" warmupPrompt={OPENER} onBack={() => setPhase('intro')} onEnd={assess} />
    );
  }

  if (phase === 'scoring') {
    return (
      <Page>
        <div className="grid min-h-[60vh] place-items-center text-center">
          <div className="animate-pulse">
            <div className="mb-3 text-3xl">🎧</div>
            <p className="text-sm text-white/55">Finding your level…</p>
          </div>
        </div>
      </Page>
    );
  }

  if (phase === 'result') {
    const level = result ? LEVELS.find((l) => l.id === result.levelId) : null;
    return (
      <Page>
        <div className="grid min-h-[70vh] place-items-center text-center">
          <div>
            {level ? (
              <>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">
                  Your level
                </div>
                <h1 className="text-3xl font-bold">{level.title}</h1>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/65">
                  {result!.summary}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">Let's start at Foundation</h1>
                <p className="mx-auto mt-2 max-w-sm text-sm text-white/55">
                  {error ? "We couldn't score that, so we'll start from the beginning." : "We'll begin at the start and build up."}
                </p>
              </>
            )}
            <button
              onClick={onDone}
              className="mt-7 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-8 py-3 text-sm font-bold text-black hover:opacity-90"
            >
              Start the course →
            </button>
          </div>
        </div>
      </Page>
    );
  }

  // intro
  return (
    <Page>
      <div className="grid min-h-[70vh] place-items-center text-center">
        <div>
          <div className="mb-3 text-4xl">👋</div>
          <h1 className="text-2xl font-bold">Quick level check</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/60">
            Have a short, relaxed chat so we can start you in the right place. No pressure — just talk.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3">
            <button
              onClick={() => setPhase('speak')}
              className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-8 py-3 text-sm font-bold text-black hover:opacity-90"
            >
              Start the check →
            </button>
            <button onClick={onDone} className="text-xs text-white/40 underline hover:text-white/70">
              Skip — start at Foundation
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}
