/**
 * Mastery model — turns the raw FSRS memory state + speaking evidence into the
 * single 0..1 number the learner sees on their map, plus the lifecycle label.
 *
 * mastery = durability + accuracy + freshness, a transparent, defensible blend:
 *   - durability  : how long the memory will last (stability → review horizon)
 *   - accuracy    : how often the skill was used correctly (evidence ratio)
 *   - freshness   : how likely it is recallable right now (FSRS retrievability)
 *
 * All functions are PURE and clock-injected.
 */

import { retrievability, schedule, DEFAULT_FSRS } from './fsrs.js';
import type { FsrsParams, Rating, SkillState, SkillLifecycle } from './types.js';

const DAY_MS = 86_400_000;

/** Weights of the three mastery components (sum to 1). Exposed for transparency. */
export const MASTERY_WEIGHTS = { durability: 0.5, accuracy: 0.3, freshness: 0.2 } as const;

/** Stability (days) at which a memory is treated as "well learned". */
export const REVIEW_HORIZON_DAYS = 21;

/** Thresholds for the lifecycle label. */
export const LIFECYCLE = {
  masteredMastery: 0.85,
  masteredStability: REVIEW_HORIZON_DAYS,
  masteredMinReps: 3,
  reviewMastery: 0.5,
} as const;

const clamp01 = (x: number): number => Math.min(Math.max(x, 0), 1);

/** 0 at stability 0, ~0.63 at the review horizon, → 1 as memory becomes durable. */
export function stabilityMaturity(stability: number): number {
  return 1 - Math.exp(-Math.max(0, stability) / REVIEW_HORIZON_DAYS);
}

function elapsedDays(lastReviewedAt: string | null, now: Date): number {
  if (!lastReviewedAt) return 0;
  return Math.max(0, (now.getTime() - new Date(lastReviewedAt).getTime()) / DAY_MS);
}

/** Compute the live mastery scalar (0..1) for a skill state at time `now`. */
export function computeMastery(
  state: Pick<
    SkillState,
    'stability' | 'lastReviewedAt' | 'exposures' | 'correctCount' | 'reps'
  >,
  now: Date,
): number {
  if (state.reps === 0) {
    // Never practised: only the (usually empty) accuracy term contributes.
    const acc0 = state.exposures > 0 ? state.correctCount / state.exposures : 0;
    return clamp01(MASTERY_WEIGHTS.accuracy * acc0);
  }
  const durability = stabilityMaturity(state.stability);
  const accuracy = state.exposures > 0 ? state.correctCount / state.exposures : 0;
  const freshness = retrievability(elapsedDays(state.lastReviewedAt, now), state.stability);
  return clamp01(
    MASTERY_WEIGHTS.durability * durability +
      MASTERY_WEIGHTS.accuracy * accuracy +
      MASTERY_WEIGHTS.freshness * freshness,
  );
}

/** Derive the lifecycle label from mastery + memory durability + reps. */
export function deriveLifecycle(
  mastery: number,
  stability: number,
  reps: number,
): SkillLifecycle {
  if (reps === 0) return 'new';
  if (
    mastery >= LIFECYCLE.masteredMastery &&
    stability >= LIFECYCLE.masteredStability &&
    reps >= LIFECYCLE.masteredMinReps
  ) {
    return 'mastered';
  }
  return mastery >= LIFECYCLE.reviewMastery ? 'review' : 'learning';
}

/** Create a blank skill state for a (user, skill). */
export function newSkillState(userId: string, skillId: string, now: Date): SkillState {
  return {
    userId,
    skillId,
    stability: 0,
    difficulty: 0,
    reps: 0,
    lapses: 0,
    lastReviewedAt: null,
    dueAt: null,
    mastery: 0,
    exposures: 0,
    correctCount: 0,
    errorCount: 0,
    state: 'new',
    updatedAt: now.toISOString(),
  };
}

/**
 * Apply one graded exposure to a skill state: advance FSRS memory, update the
 * evidence counters, and recompute the derived mastery + lifecycle. This is the
 * single mutation used by session-evidence ingestion and standalone reviews.
 */
export function applyReview(
  state: SkillState,
  rating: Rating,
  now: Date,
  params: FsrsParams = DEFAULT_FSRS,
): SkillState {
  const memory = schedule(state, rating, now, params);
  const exposures = state.exposures + 1;
  const correctCount = state.correctCount + (rating >= 3 ? 1 : 0);
  const errorCount = state.errorCount + (rating === 1 ? 1 : 0);

  const next: SkillState = {
    ...state,
    ...memory,
    exposures,
    correctCount,
    errorCount,
    updatedAt: now.toISOString(),
  };
  next.mastery = computeMastery(next, now);
  next.state = deriveLifecycle(next.mastery, next.stability, next.reps);
  return next;
}
