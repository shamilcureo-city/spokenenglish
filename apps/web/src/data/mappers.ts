/** Map between snake_case DB rows and the camelCase core types. */

import type {
  SkillState,
  SkillLifecycle,
  ReviewItem,
  CorrectionRecord,
} from '@fluentmap/core/science';
import type { CorrectionRow, ReviewItemRow, SkillStateRow } from './rows';

export const rowToSkillState = (r: SkillStateRow): SkillState => ({
  userId: r.user_id,
  skillId: r.skill_id,
  mastery: r.mastery,
  stability: r.stability,
  difficulty: r.difficulty,
  reps: r.reps,
  lapses: r.lapses,
  exposures: r.exposures,
  correctCount: r.correct_count,
  errorCount: r.error_count,
  lastReviewedAt: r.last_reviewed_at,
  dueAt: r.due_at,
  state: r.state as SkillLifecycle,
  updatedAt: r.updated_at,
});

export const skillStateToRow = (s: SkillState): SkillStateRow => ({
  user_id: s.userId,
  skill_id: s.skillId,
  mastery: s.mastery,
  stability: s.stability,
  difficulty: s.difficulty,
  reps: s.reps,
  lapses: s.lapses,
  exposures: s.exposures,
  correct_count: s.correctCount,
  error_count: s.errorCount,
  last_reviewed_at: s.lastReviewedAt,
  due_at: s.dueAt,
  state: s.state,
  updated_at: s.updatedAt,
});

export const rowToReviewItem = (r: ReviewItemRow): ReviewItem => ({
  id: r.id,
  userId: r.user_id,
  skillId: r.skill_id,
  correctionId: r.correction_id,
  prompt: r.prompt ?? '',
  expected: r.expected ?? '',
  l1RuleId: r.l1_rule_id,
  dueAt: r.due_at,
  intervalDays: r.interval_days,
  reps: r.reps,
  lapses: r.lapses,
  suspended: r.suspended,
});

export const reviewItemToRow = (r: ReviewItem): ReviewItemRow => ({
  id: r.id,
  user_id: r.userId,
  skill_id: r.skillId,
  correction_id: r.correctionId,
  prompt: r.prompt,
  expected: r.expected,
  l1_rule_id: r.l1RuleId,
  due_at: r.dueAt,
  interval_days: r.intervalDays,
  reps: r.reps,
  lapses: r.lapses,
  suspended: r.suspended,
});

export const correctionToRow = (c: CorrectionRecord): CorrectionRow => ({
  id: c.id,
  user_id: c.userId,
  session_id: c.sessionId,
  utterance_id: null,
  skill_id: c.skillId,
  l1_rule_id: c.l1RuleId,
  mistake_type: c.mistakeType,
  original: c.original,
  corrected: c.corrected,
  explanation: c.explanation,
  resolved: c.resolved,
  created_at: c.createdAt,
});
