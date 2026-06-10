/**
 * FSRS-5 (Free Spaced Repetition Scheduler) — the forgetting-curve engine.
 *
 * Chosen over SM-2 because it separates *stability* from *difficulty*, models
 * *retrievability* continuously, and schedules to a target retention — the
 * strongest, most defensible "we show you the science" story.
 *
 * Every function here is PURE. `schedule()` takes `now` as an argument and never
 * reads the clock itself, so it is fully deterministic and golden-vector testable.
 *
 * Reference: Jarrett Ye et al., the FSRS-5 algorithm (Anki's default scheduler).
 */

import type { FsrsParams, MemoryState, Rating } from './types.js';

/** Forgetting-curve decay exponent. R = (1 + FACTOR·t/S)^DECAY. */
export const DECAY = -0.5;
/** Derived so that R = 0.9 exactly when t = S. FACTOR = 0.9^(1/DECAY) − 1 = 19/81. */
export const FACTOR = 19 / 81;

const S_MIN = 0.01;
const S_MAX = 36_500; // 100 years
const DAY_MS = 86_400_000;

/** Published FSRS-5 default weights (start here; refit per-cohort once data exists). */
export const DEFAULT_FSRS: FsrsParams = {
  w: [
    0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575,
    0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621,
  ],
  requestRetention: 0.9,
  maximumInterval: 365,
};

const clamp = (x: number, lo: number, hi: number): number => Math.min(Math.max(x, lo), hi);

/**
 * Probability of recall `elapsedDays` after a review, given memory `stability`.
 * R(0, S) = 1; R(S, S) = requestRetention (0.9); monotonically decreasing in t.
 */
export function retrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  const t = Math.max(0, elapsedDays);
  return Math.pow(1 + FACTOR * (t / stability), DECAY);
}

/**
 * The next interval (whole days) that lands retrievability at `requestRetention`.
 * At r = 0.9 this equals `stability`. Clamped to [1, maximumInterval].
 */
export function nextInterval(stability: number, p: FsrsParams = DEFAULT_FSRS): number {
  const ivl = (stability / FACTOR) * (Math.pow(p.requestRetention, 1 / DECAY) - 1);
  return clamp(Math.round(ivl), 1, p.maximumInterval);
}

function initStability(rating: Rating, w: (i: number) => number): number {
  return Math.max(w(rating - 1), S_MIN);
}

function initDifficulty(rating: Rating, w: (i: number) => number): number {
  return clamp(w(4) - Math.exp(w(5) * (rating - 1)) + 1, 1, 10);
}

/** FSRS-5 difficulty update with linear damping + mean reversion toward D0(easy). */
function nextDifficulty(D: number, rating: Rating, w: (i: number) => number): number {
  const deltaD = -w(6) * (rating - 3);
  const damped = D + (deltaD * (10 - D)) / 9; // linear damping
  const reverted = w(7) * initDifficulty(4, w) + (1 - w(7)) * damped; // mean reversion
  return clamp(reverted, 1, 10);
}

/** Post-recall stability (rating ∈ {hard, good, easy}). Never decreases stability. */
function nextRecallStability(
  D: number,
  S: number,
  R: number,
  rating: Rating,
  w: (i: number) => number,
): number {
  const hard = rating === 2 ? w(15) : 1;
  const easy = rating === 4 ? w(16) : 1;
  const inc =
    Math.exp(w(8)) *
    (11 - D) *
    Math.pow(S, -w(9)) *
    (Math.exp(w(10) * (1 - R)) - 1) *
    hard *
    easy;
  return S * (1 + inc);
}

/** Post-lapse stability (rating = again). */
function nextForgetStability(D: number, S: number, R: number, w: (i: number) => number): number {
  return w(11) * Math.pow(D, -w(12)) * (Math.pow(S + 1, w(13)) - 1) * Math.exp(w(14) * (1 - R));
}

/**
 * Advance the FSRS memory model by one graded exposure.
 *
 * @param memory current memory model (only the FSRS fields are read)
 * @param rating 1=again, 2=hard, 3=good, 4=easy
 * @param now    injected clock — the only source of "now"
 */
export function schedule(
  memory: Pick<MemoryState, 'stability' | 'difficulty' | 'reps' | 'lapses' | 'lastReviewedAt'>,
  rating: Rating,
  now: Date,
  p: FsrsParams = DEFAULT_FSRS,
): MemoryState {
  const w = (i: number): number => p.w[i] ?? 0;

  let S: number;
  let D: number;
  let reps = memory.reps;
  let lapses = memory.lapses;

  if (reps === 0 || memory.stability <= 0) {
    // First exposure: seed S and D from the weights.
    S = initStability(rating, w);
    D = initDifficulty(rating, w);
  } else {
    const elapsedDays = memory.lastReviewedAt
      ? Math.max(0, (now.getTime() - new Date(memory.lastReviewedAt).getTime()) / DAY_MS)
      : 0;
    const R = retrievability(elapsedDays, memory.stability);
    D = nextDifficulty(memory.difficulty, rating, w);
    if (rating === 1) {
      // A lapse must never increase stability.
      S = Math.min(nextForgetStability(memory.difficulty, memory.stability, R, w), memory.stability);
      lapses += 1;
    } else {
      S = nextRecallStability(memory.difficulty, memory.stability, R, rating, w);
    }
  }

  S = clamp(S, S_MIN, S_MAX);
  reps += 1;
  const intervalDays = nextInterval(S, p);
  const dueAt = new Date(now.getTime() + intervalDays * DAY_MS).toISOString();

  return {
    stability: S,
    difficulty: D,
    reps,
    lapses,
    lastReviewedAt: now.toISOString(),
    dueAt,
  };
}

/** Convenience: the whole-day interval implied by a memory state. */
export function intervalDaysOf(stability: number, p: FsrsParams = DEFAULT_FSRS): number {
  return nextInterval(stability, p);
}
