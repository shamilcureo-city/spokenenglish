/**
 * Session-evidence ingestion — the load-bearing bridge between a scored voice
 * session and the learning-science engine.
 *
 * On Finish, the `score-session` Edge Function returns, per utterance, the skills
 * the learner demonstrated and the errors they made. This module turns that into:
 *   - FSRS rating updates on each skill's state (one aggregated rating per skill
 *     per session — never inflating reps),
 *   - a review item per error (the spaced-repetition queue / mistake notebook),
 *   - a correction record carrying the mother-tongue explanation.
 *
 * PURE and clock-injected; ids come from an injected generator so output is
 * fully deterministic and testable.
 */

import { newSkillState, applyReview } from './mastery.js';
import { intervalDaysOf } from './fsrs.js';
import { tagError } from './contrastive.js';
import type { FsrsParams, L1, L1TransferRule, Rating, ReviewItem, SkillState } from './types.js';

/** Outcome of a single demonstrated skill in a session. */
export type SkillOutcome = 'correct' | 'self_corrected' | 'error';

export interface ScoredSkillObservation {
  skillId: string;
  outcome: SkillOutcome;
  /** Used correctly at a level above the learner's frontier → bumps to "easy". */
  advanced?: boolean;
}

export interface ScoredError {
  skillId: string;
  original: string;
  corrected: string;
  mistakeType?: string; // grammar | vocabulary | pronunciation | fluency
  /** The transfer rule the scoring pass chose from the candidate list. */
  l1RuleId?: string | null;
  utteranceId?: string | null;
}

/** The contract returned by the `score-session` Edge Function. */
export interface ScoredSession {
  sessionId: string;
  userId: string;
  l1: L1;
  observations: ScoredSkillObservation[];
  errors: ScoredError[];
}

export interface CorrectionRecord {
  id: string;
  userId: string;
  sessionId: string;
  skillId: string;
  l1RuleId: string | null;
  mistakeType: string | null;
  original: string;
  corrected: string;
  explanation: string;
  resolved: boolean;
  createdAt: string;
}

export interface IngestResult {
  /** Every skill state touched this session, post-update. */
  updatedStates: SkillState[];
  /** One review item per error, queued for spaced repetition. */
  newReviewItems: ReviewItem[];
  /** Notebook entries with mother-tongue explanations. */
  corrections: CorrectionRecord[];
}

interface OutcomeCounts {
  correct: number;
  self: number;
  error: number;
  advanced: boolean;
}

/** Aggregate a skill's outcomes within one session into a single FSRS rating. */
export function aggregateRating(c: OutcomeCounts): Rating {
  if (c.error > 0 && c.correct === 0 && c.self === 0) return 1; // only errors → again
  if (c.error > 0) return 2; // used correctly too, but stumbled → hard
  if (c.self > 0) return 2; // self-corrected → hard
  return c.advanced && c.correct >= 2 ? 4 : 3; // clean → good, or easy if advanced
}

export interface IngestOptions {
  now: Date;
  params?: FsrsParams;
  /** Deterministic id generator. Defaults to the seed itself. */
  idFor?: (seed: string) => string;
  /** Override the KB (for testing). */
  rules?: L1TransferRule[];
}

/**
 * Fold a scored session into updated skill states, review items, and corrections.
 */
export function ingestSessionEvidence(
  scored: ScoredSession,
  priorStates: SkillState[],
  opts: IngestOptions,
): IngestResult {
  const { now, params } = opts;
  const idFor = opts.idFor ?? ((seed: string): string => seed);
  const nowIso = now.toISOString();

  const stateBy = new Map<string, SkillState>(priorStates.map((s) => [s.skillId, s]));

  // 1) Gather per-skill outcome counts from observations AND errors.
  const counts = new Map<string, OutcomeCounts>();
  const bump = (skillId: string, key: 'correct' | 'self' | 'error', advanced = false): void => {
    const c = counts.get(skillId) ?? { correct: 0, self: 0, error: 0, advanced: false };
    c[key] += 1;
    c.advanced = c.advanced || advanced;
    counts.set(skillId, c);
  };
  for (const o of scored.observations) {
    if (o.outcome === 'correct') bump(o.skillId, 'correct', o.advanced ?? false);
    else if (o.outcome === 'self_corrected') bump(o.skillId, 'self');
    else bump(o.skillId, 'error');
  }
  for (const e of scored.errors) bump(e.skillId, 'error');

  // 2) Apply one aggregated rating per skill.
  const updatedStates: SkillState[] = [];
  for (const [skillId, c] of counts) {
    const prior = stateBy.get(skillId) ?? newSkillState(scored.userId, skillId, now);
    const rating = aggregateRating(c);
    const next = applyReview(prior, rating, now, params);
    stateBy.set(skillId, next);
    updatedStates.push(next);
  }

  // 3) One review item + correction per error.
  const newReviewItems: ReviewItem[] = [];
  const corrections: CorrectionRecord[] = [];
  scored.errors.forEach((e, i) => {
    const tagged = tagError({ l1: scored.l1, ruleId: e.l1RuleId, text: e.original, rules: opts.rules });
    const skillId = tagged?.skillId ?? e.skillId;
    const updated = stateBy.get(skillId);
    const intervalDays = updated ? intervalDaysOf(updated.stability, params) : 1;
    const dueAt = updated?.dueAt ?? new Date(now.getTime() + intervalDays * 86_400_000).toISOString();

    const correctionId = idFor(`${scored.sessionId}:corr:${i}`);
    corrections.push({
      id: correctionId,
      userId: scored.userId,
      sessionId: scored.sessionId,
      skillId,
      l1RuleId: tagged?.l1RuleId ?? null,
      mistakeType: e.mistakeType ?? null,
      original: e.original,
      corrected: e.corrected,
      explanation: tagged?.explanation ?? `Practice the corrected version: "${e.corrected}".`,
      resolved: false,
      createdAt: nowIso,
    });

    newReviewItems.push({
      id: idFor(`${scored.sessionId}:rv:${i}`),
      userId: scored.userId,
      skillId,
      correctionId,
      prompt: `Say it correctly: "${e.corrected}"`,
      expected: e.corrected,
      l1RuleId: tagged?.l1RuleId ?? null,
      dueAt,
      intervalDays,
      reps: 0,
      lapses: 0,
      suspended: false,
    });
  });

  return { updatedStates, newReviewItems, corrections };
}
