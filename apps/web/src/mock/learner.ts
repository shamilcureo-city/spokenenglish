/**
 * A deterministic demo learner, built from the REAL engine so the map reflects
 * actual science (FSRS stability → mastery → lifecycle). No randomness: every
 * skill's state is derived from a stable hash of its id + its CEFR band.
 *
 * Replaced by live Supabase-backed state in Phase 2.
 */

import {
  SKILLS,
  L1_TRANSFER_RULES,
  resolveExplanation,
  computeMastery,
  deriveLifecycle,
  intervalDaysOf,
  type Cefr,
  type L1,
  type ReviewItem,
  type SkillState,
} from '@fluentmap/core/science';

const DAY = 86_400_000;
export const DEMO_NOW = new Date('2026-06-08T09:00:00.000Z');

export interface DemoProfile {
  name: string;
  l1: string;
  goal: string;
  targetCefr: Cefr;
}

export const DEMO_PROFILE: DemoProfile = {
  name: 'Ravi',
  l1: 'Hindi',
  goal: 'Interview English',
  targetCefr: 'B1',
};

/** Stable 0..1 hash of a string (FNV-1a). */
function hash01(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 10000 / 10000;
}

type Bucket = 'mastered' | 'strong' | 'learning' | 'due' | 'untouched';

interface BucketSpec {
  stability: number;
  ageDays: number;
  reps: number;
  accuracy: number;
}

const SPEC: Record<Exclude<Bucket, 'untouched'>, BucketSpec> = {
  mastered: { stability: 72, ageDays: 5, reps: 7, accuracy: 1 },
  strong: { stability: 28, ageDays: 9, reps: 5, accuracy: 0.9 },
  learning: { stability: 7, ageDays: 3, reps: 2, accuracy: 0.6 },
  due: { stability: 14, ageDays: 46, reps: 3, accuracy: 0.75 }, // overdue → shows in "due"
};

/** Pick a bucket from the skill's CEFR band and its hash — a realistic gradient. */
function bucketFor(cefr: Cefr, h: number): Bucket {
  switch (cefr) {
    case 'A1':
      return h < 0.8 ? 'mastered' : h < 0.92 ? 'strong' : 'due';
    case 'A2':
      return h < 0.55 ? 'mastered' : h < 0.8 ? 'strong' : h < 0.92 ? 'due' : 'learning';
    case 'B1':
      return h < 0.18 ? 'strong' : h < 0.5 ? 'learning' : h < 0.72 ? 'due' : 'untouched';
    case 'B2':
      return h < 0.22 ? 'learning' : h < 0.4 ? 'due' : 'untouched';
    case 'C1':
      return h < 0.12 ? 'learning' : 'untouched';
  }
}

function buildState(skillId: string, spec: BucketSpec): SkillState {
  const last = new Date(DEMO_NOW.getTime() - spec.ageDays * DAY);
  const correctCount = Math.round(spec.accuracy * spec.reps);
  const dueAt = new Date(last.getTime() + intervalDaysOf(spec.stability) * DAY).toISOString();

  const state: SkillState = {
    userId: 'demo',
    skillId,
    stability: spec.stability,
    difficulty: 5,
    reps: spec.reps,
    lapses: spec.reps - correctCount > 0 ? 1 : 0,
    exposures: spec.reps,
    correctCount,
    errorCount: spec.reps - correctCount,
    lastReviewedAt: last.toISOString(),
    dueAt,
    mastery: 0,
    state: 'new',
    updatedAt: last.toISOString(),
  };
  state.mastery = computeMastery(state, DEMO_NOW);
  state.state = deriveLifecycle(state.mastery, state.stability, state.reps);
  return state;
}

export function buildDemoStates(): SkillState[] {
  const states: SkillState[] = [];
  for (const skill of SKILLS) {
    const bucket = bucketFor(skill.cefr, hash01(skill.id));
    if (bucket === 'untouched') continue;
    states.push(buildState(skill.id, SPEC[bucket]));
  }
  return states;
}

export interface L1Insight {
  title: string;
  explanation: string; // in the learner's mother tongue (native script)
  total: number;
  fixed: number;
}

/** Demo review queue from the learner's L1 transfer patterns (all due now). */
export function buildDemoReviews(l1: string): ReviewItem[] {
  return L1_TRANSFER_RULES.filter((r) => r.l1 === l1 && r.category !== 'phonetic')
    .slice(0, 5)
    .map((r, i) => ({
      id: `demo-rv-${i}`,
      userId: 'demo',
      skillId: r.skillId,
      correctionId: null,
      prompt: `Say it correctly: “${r.contrast.l2Form}”`,
      expected: r.contrast.l2Form,
      l1RuleId: r.id,
      dueAt: new Date(DEMO_NOW.getTime() - (i + 1) * 3_600_000).toISOString(),
      intervalDays: 1,
      reps: 0,
      lapses: 0,
      suspended: false,
    }));
}

/** Mock "top transfer patterns" for the learner's L1 (the differentiator card). */
export function buildL1Insights(l1: string): L1Insight[] {
  return L1_TRANSFER_RULES.filter((r) => r.l1 === l1)
    .slice(0, 4)
    .map((r) => {
      const total = 4 + Math.floor(hash01(r.id) * 14); // 4..17
      const fixed = Math.floor(total * (0.4 + hash01(r.id + 'x') * 0.5));
      return { title: r.title, explanation: resolveExplanation(r, l1 as L1), total, fixed };
    });
}
