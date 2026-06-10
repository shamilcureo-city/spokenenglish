/**
 * Validate + assemble raw Gemini JSON into the typed contracts the engine
 * consumes. Crucially, this DEFENDS against model hallucination: any skill id
 * not in the taxonomy or rule id not in the KB is dropped/nulled, so bad ids
 * never reach `skill_states` or `review_items`.
 */

import { SKILL_IDS } from '../science/skills.js';
import { L1_TRANSFER_RULES } from '../science/l1-rules.js';
import type { L1 } from '../science/types.js';
import type {
  ScoredError,
  ScoredSession,
  ScoredSkillObservation,
  SkillOutcome,
} from '../science/decompose.js';
import type { AssessmentScore, AssessmentSubScores } from './types.js';

const RULE_IDS: ReadonlySet<string> = new Set(L1_TRANSFER_RULES.map((r) => r.id));
const OUTCOMES: ReadonlySet<string> = new Set(['correct', 'self_corrected', 'error']);

const clamp = (x: number, lo: number, hi: number): number => Math.min(Math.max(x, lo), hi);
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

export interface RawSessionScore {
  summary?: unknown;
  overallScore?: unknown;
  skillsUsed?: unknown;
  errors?: unknown;
}

export interface AssembledSession {
  scored: ScoredSession;
  summary: string;
  overallScore: number;
}

/** Assemble a validated ScoredSession from raw model output + session context. */
export function assembleScoredSession(
  raw: RawSessionScore,
  ctx: { sessionId: string; userId: string; l1: L1 },
): AssembledSession {
  const observations: ScoredSkillObservation[] = arr(raw.skillsUsed)
    .map((o) => o as Record<string, unknown>)
    .filter((o) => typeof o.skillId === 'string' && SKILL_IDS.has(o.skillId) && OUTCOMES.has(str(o.outcome)))
    .map((o) => ({
      skillId: o.skillId as string,
      outcome: o.outcome as SkillOutcome,
      ...(o.advanced === true ? { advanced: true } : {}),
    }));

  const errors: ScoredError[] = arr(raw.errors)
    .map((e) => e as Record<string, unknown>)
    .filter(
      (e) =>
        typeof e.skillId === 'string' &&
        SKILL_IDS.has(e.skillId) &&
        str(e.original).length > 0 &&
        str(e.corrected).length > 0,
    )
    .map((e) => {
      const ruleId = str(e.l1RuleId);
      return {
        skillId: e.skillId as string,
        original: str(e.original),
        corrected: str(e.corrected),
        ...(str(e.mistakeType) ? { mistakeType: str(e.mistakeType) } : {}),
        l1RuleId: ruleId && RULE_IDS.has(ruleId) ? ruleId : null,
      };
    });

  return {
    scored: { sessionId: ctx.sessionId, userId: ctx.userId, l1: ctx.l1, observations, errors },
    summary: str(raw.summary),
    overallScore: clamp(Math.round(num(raw.overallScore)), 0, 100),
  };
}

/** Validate + clamp the raw assessment scoring output. */
export function validateAssessmentScore(raw: unknown): AssessmentScore {
  const r = (raw ?? {}) as Record<string, unknown>;
  const rawSub = (r.subScores ?? {}) as Record<string, unknown>;
  const dim = (k: keyof AssessmentSubScores): number => clamp(Math.round(num(rawSub[k])), 0, 100);

  return {
    subScores: {
      fluency: dim('fluency'),
      pronunciation: dim('pronunciation'),
      grammar: dim('grammar'),
      vocabulary: dim('vocabulary'),
      interaction: dim('interaction'),
    },
    summary: str(r.summary),
    strengths: arr(r.strengths).map(str).filter((s) => s.length > 0),
    focusAreas: arr(r.focusAreas).map(str).filter((s) => s.length > 0),
  };
}
