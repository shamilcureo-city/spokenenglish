/**
 * Adaptive sequencer — picks the learner's next activity.
 *
 * Policy (mastery learning + i+1 comprehensible input):
 *   1. If enough reviews are overdue, do a review set first (protect retention).
 *   2. Gate out skills whose prerequisites aren't sufficiently mastered.
 *   3. Restrict to the "i+1" difficulty band just above the learner's frontier.
 *   4. Pick weakest-first (lowest mastery, then most-decayed).
 *
 * This subsumes the old linear `getNextLesson` walk; the linear track ordering
 * becomes a fallback when the skill graph offers no clear next node.
 *
 * PURE and clock-injected.
 */

import { retrievability } from './fsrs.js';
import type { ActivityChoice, Cefr, ReviewItem, Skill, SkillState } from './types.js';

const DAY_MS = 86_400_000;
const CEFR_ORDER: Record<Cefr, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4 };

export interface SequencerInput {
  states: SkillState[];
  skills: Skill[];
  dueReviews: ReviewItem[];
  now: Date;
  /** Optional ceiling — don't surface skills above this band. */
  targetCefr?: Cefr;
  /** Resolve the best lesson for a skill (content lookup). Optional. */
  lessonForSkill?: (skillId: string) => string | undefined;
  /** How many overdue reviews trigger a review set. Default 3. */
  overdueReviewThreshold?: number;
  /** Prerequisite mastery floor for a skill to be "available". Default 0.7. */
  prerequisiteMasteryFloor?: number;
  /** Width of the i+1 difficulty band above the frontier. Default 0.2. */
  iPlusOneBand?: number;
}

const uniq = <T>(xs: T[]): T[] => [...new Set(xs)];

function freshness(state: SkillState | undefined, now: Date): number {
  if (!state || state.reps === 0) return 0;
  const elapsed = state.lastReviewedAt
    ? Math.max(0, (now.getTime() - new Date(state.lastReviewedAt).getTime()) / DAY_MS)
    : 0;
  return retrievability(elapsed, state.stability);
}

/** Mean difficulty of mastered skills — the learner's current frontier. */
function currentFrontier(states: SkillState[], skills: Skill[], fallback: number): number {
  const diffBy = new Map(skills.map((s) => [s.id, s.difficulty]));
  const mastered = states
    .filter((s) => s.state === 'mastered')
    .map((s) => diffBy.get(s.skillId))
    .filter((d): d is number => typeof d === 'number');
  if (mastered.length === 0) return fallback;
  return mastered.reduce((a, b) => a + b, 0) / mastered.length;
}

/**
 * Choose the next activity for a learner.
 */
export function pickNextActivity(input: SequencerInput): ActivityChoice {
  const {
    states,
    skills,
    dueReviews,
    now,
    targetCefr,
    lessonForSkill,
    overdueReviewThreshold = 3,
    prerequisiteMasteryFloor = 0.7,
    iPlusOneBand = 0.2,
  } = input;

  const stateBy = new Map(states.map((s) => [s.skillId, s]));
  const masteryOf = (skillId: string): number => stateBy.get(skillId)?.mastery ?? 0;

  // 1) Spaced repetition takes priority — overdue reviews protect retention.
  const overdue = dueReviews
    .filter((r) => !r.suspended && new Date(r.dueAt).getTime() <= now.getTime())
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  if (overdue.length >= overdueReviewThreshold) {
    const skillIds = uniq(overdue.map((r) => r.skillId)).slice(0, 7);
    return {
      kind: 'review',
      skillIds,
      rationale: `${overdue.length} skills are due for review — let's lock them in first.`,
    };
  }

  // 2) Availability gate (prerequisite mastery floor) + CEFR ceiling.
  const withinCefr = (sk: Skill): boolean =>
    targetCefr === undefined || CEFR_ORDER[sk.cefr] <= CEFR_ORDER[targetCefr];
  const available = skills.filter(
    (sk) =>
      withinCefr(sk) && sk.prerequisites.every((p) => masteryOf(p) >= prerequisiteMasteryFloor),
  );

  const unlearned = available.filter((sk) => masteryOf(sk.id) < 0.9);

  // Everything reachable is mastered → strengthen the weakest known skill.
  if (unlearned.length === 0) {
    const weakest = [...states]
      .filter((s) => skills.some((sk) => sk.id === s.skillId))
      .sort((a, b) => a.mastery - b.mastery)[0];
    if (weakest) {
      return {
        kind: 'drill',
        skillIds: [weakest.skillId],
        rationale: `Everything in reach is mastered — strengthening your weakest skill.`,
      };
    }
    return { kind: 'review', skillIds: [], rationale: 'Nothing to practise right now.' };
  }

  // 3) i+1 band: skills just above the current frontier.
  const minAvailableDifficulty = Math.min(...unlearned.map((sk) => sk.difficulty));
  const frontier = currentFrontier(states, skills, minAvailableDifficulty);
  const inBand = unlearned.filter(
    (sk) => sk.difficulty >= frontier && sk.difficulty <= frontier + iPlusOneBand,
  );

  // 4) Weakest-first (lowest mastery, then most-decayed, then easiest).
  const rank = (a: Skill, b: Skill): number =>
    masteryOf(a.id) - masteryOf(b.id) ||
    freshness(stateBy.get(a.id), now) - freshness(stateBy.get(b.id), now) ||
    a.difficulty - b.difficulty;

  const pool = inBand.length > 0 ? inBand : unlearned;
  const target = [...pool].sort(rank)[0];

  // `pool` is non-empty here (unlearned.length > 0), so target is defined.
  if (!target) {
    return { kind: 'review', skillIds: [], rationale: 'Nothing to practise right now.' };
  }

  const lessonId = lessonForSkill?.(target.id);
  return {
    kind: lessonId ? 'lesson' : 'drill',
    skillIds: [target.id],
    ...(lessonId ? { lessonId } : {}),
    rationale: `Focusing on '${target.label}' — your next step just above what you've mastered.`,
  };
}
