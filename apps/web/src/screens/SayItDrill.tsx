/**
 * "Say it" drill (redesign Phase 1) — the signature traffic-light moment.
 * The learner says each target phrase; we recognise it and colour every word
 * green / yellow / red by whether it was clearly caught (intelligibility), with
 * tap-to-fix (hear it + slow replay). Sits between Learn and Speak in a lesson.
 */
import { useEffect, useRef, useState } from 'react';
import {
  scoreUtterance,
  evidenceFromUtterance,
  attemptReliable,
  type UtteranceScore,
  type WordScore,
} from '@fluentmap/core/conversation';
import { useSpeechRecognition } from '../voice/useSpeechRecognition';
import { useStore } from '../store';
import { speak, ttsSupported } from '../lib/tts';
import { Page } from './ui';

const COLOR: Record<WordScore['status'], string> = {
  good: 'text-emerald-300',
  close: 'text-amber-300 underline decoration-amber-400/50 decoration-2 underline-offset-4',
  missing: 'text-red-400 underline decoration-red-500/50 decoration-2 underline-offset-4',
};

export function SayItDrill({
  phrases,
  onDone,
  coachName = 'Sunny',
}: {
  phrases: string[];
  /** Called when the drill finishes; passes the per-phrase scores (for the recap). */
  onDone: (results?: UtteranceScore[]) => void;
  coachName?: string;
}) {
  const { recordMastery } = useStore();
  const { supported, listening, transcript, interim, error, start, abort, reset } =
    useSpeechRecognition('en-IN');
  const [i, setI] = useState(0);
  const [results, setResults] = useState<Record<number, UtteranceScore>>({});
  const [fix, setFix] = useState<WordScore | null>(null);
  const [lowSignal, setLowSignal] = useState(false); // recogniser caught too little to trust
  // The phrase index the current recognition belongs to, so a late result is always
  // attributed to the phrase it was recorded for (never the phrase we've moved on to).
  const recordingIndexRef = useRef<number | null>(null);

  const phrase = phrases[i] ?? '';
  const result = results[i];
  const last = i >= phrases.length - 1;

  // When an attempt finishes, score it against the phrase it was recorded for.
  useEffect(() => {
    const ri = recordingIndexRef.current;
    if (!listening && transcript && ri !== null && results[ri] === undefined) {
      const target = phrases[ri] ?? '';
      // Don't score / record a garbled or clipped capture as "weakness" — ask for a retry.
      if (!attemptReliable(target, transcript)) {
        setLowSignal(true);
        return;
      }
      setLowSignal(false);
      const score = scoreUtterance(target, transcript);
      setResults((r) => ({ ...r, [ri]: score }));
      recordMastery(evidenceFromUtterance(target, score)); // feed the mastery memory
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, transcript]);

  function record() {
    setFix(null);
    setLowSignal(false);
    abort(); // discard any in-flight session before starting a fresh one
    recordingIndexRef.current = i;
    reset();
    setResults((r) => {
      const n = { ...r };
      delete n[i];
      return n;
    });
    start();
  }

  function next() {
    setFix(null);
    abort(); // never let a phrase-N session bleed into phrase N+1
    reset();
    if (last) onDone(Object.values(results));
    else setI(i + 1);
  }

  if (!supported) {
    return (
      <Page>
        <Header i={i} n={phrases.length} />
        <div className="grid min-h-[50vh] place-items-center text-center">
          <div>
            <div className="mb-3 text-3xl">🎤</div>
            <p className="mx-auto max-w-xs text-sm text-white/60">
              This browser can't do the say-it drill. You can still practise live with {coachName}.
            </p>
            <button
              onClick={() => onDone()}
              className="mt-5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-7 py-3 text-sm font-bold text-black"
            >
              Continue →
            </button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <Header i={i} n={phrases.length} />

      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-300/80">Say it</p>
      <p className="mb-4 text-sm text-white/50">Tap, then say the phrase clearly. I'll show you how it landed.</p>

      {/* The target phrase (or the scored, colour-coded version) */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="text-2xl font-semibold leading-snug">
          {result ? (
            result.words.map((w, idx) => {
              const space = idx < result.words.length - 1 ? ' ' : '';
              if (w.status === 'good') {
                return (
                  <span key={idx} className={COLOR.good}>
                    {w.word}
                    {space}
                  </span>
                );
              }
              return (
                <button
                  key={idx}
                  onClick={() => setFix(w)}
                  aria-label={`Fix "${w.word}" — ${w.status === 'missing' ? 'not caught' : 'almost there'}`}
                  className={`${COLOR[w.status]} cursor-pointer`}
                >
                  {w.word}
                  {space}
                </button>
              );
            })
          ) : (
            <span className="text-white/90">{phrase}</span>
          )}
        </div>
        {ttsSupported && (
          <button
            onClick={() => speak(phrase)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/[0.1]"
          >
            🔊 Hear it
          </button>
        )}
      </div>

      {/* Result summary */}
      {result && (
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
          <div className="text-sm">
            <span className="font-bold text-emerald-300">{result.intelligible}%</span>
            <span className="text-white/55"> clearly understood</span>
          </div>
          <div className="text-lg tracking-widest">
            {[1, 2, 3].map((n) => (
              <span key={n} className={n <= result.stars ? 'text-amber-300' : 'text-white/15'}>
                ★
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fix panel for a tapped word */}
      {fix && (
        <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-300/80">
            {fix.status === 'missing' ? 'A listener missed this' : 'Almost — polish this'}
          </div>
          <div className="text-lg font-semibold">{fix.word}</div>
          {fix.heardAs && <div className="mt-0.5 text-xs text-white/45">sounded like “{fix.heardAs}”</div>}
          {ttsSupported && (
            <div className="mt-3 flex gap-2">
              <button onClick={() => speak(fix.word)} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15">
                🔊 Hear it
              </button>
              <button onClick={() => speak(fix.word, { slow: true })} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15">
                🐢 Slowly
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mic / actions */}
      <div className="mt-6 flex flex-col items-center gap-3">
        {listening ? (
          <>
            <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-2xl ring-2 ring-emerald-400/50">
              <span className="animate-pulse">🎙️</span>
            </div>
            <div className="text-sm text-white/60">{interim || 'Listening… say the phrase'}</div>
          </>
        ) : (
          <>
            <button
              onClick={record}
              className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-300 text-2xl text-black shadow-lg shadow-emerald-500/20 transition hover:opacity-90"
              aria-label="Record"
            >
              🎤
            </button>
            <div className="text-xs text-white/45">{result ? 'Tap to try again' : 'Tap & say it'}</div>
          </>
        )}
        {error && error !== 'unsupported' && (
          <p className="text-center text-xs text-amber-200/80">
            {error === 'not-allowed' || error === 'service-not-allowed'
              ? 'Mic access is blocked — allow it in your browser settings, or tap Skip to talk live.'
              : error === 'audio-capture'
                ? 'No microphone found — plug one in, or tap Skip to talk live.'
                : "Couldn't hear that — tap and try again."}
          </p>
        )}
        {lowSignal && !error && (
          <p className="text-center text-xs text-amber-200/80">Couldn't quite catch that — say it once more.</p>
        )}
      </div>

      {/* Progress / continue */}
      <div className="mt-7 flex items-center justify-between">
        <button onClick={next} className="text-sm text-white/45 hover:text-white/80">
          Skip
        </button>
        {result && (
          <button
            onClick={next}
            className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-7 py-3 text-sm font-bold text-black hover:opacity-90"
          >
            {last ? 'Now talk with Sunny →' : 'Next phrase →'}
          </button>
        )}
      </div>
    </Page>
  );
}

function Header({ i, n }: { i: number; n: number }) {
  return (
    <header className="mb-5 flex items-center justify-between">
      <div className="text-sm font-semibold">Practise saying it</div>
      <div className="text-xs text-white/40">
        {i + 1}/{n}
      </div>
    </header>
  );
}
