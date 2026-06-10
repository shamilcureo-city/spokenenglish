/** Database row shapes (snake_case), mirroring supabase/migrations/0001_init.sql. */

export interface ProfileRow {
  id: string;
  name: string | null;
  l1: string;
  goal: string | null;
  target_cefr: string;
  correction_mode: string;
  streak: number;
  last_active_date: string | null;
}

export interface SkillStateRow {
  user_id: string;
  skill_id: string;
  mastery: number;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  exposures: number;
  correct_count: number;
  error_count: number;
  last_reviewed_at: string | null;
  due_at: string | null;
  state: string;
  updated_at: string;
}

export interface ReviewItemRow {
  id: string;
  user_id: string;
  skill_id: string;
  correction_id: string | null;
  prompt: string | null;
  expected: string | null;
  l1_rule_id: string | null;
  due_at: string;
  interval_days: number;
  reps: number;
  lapses: number;
  suspended: boolean;
}

export interface CorrectionRow {
  id: string;
  user_id: string;
  session_id: string | null;
  utterance_id: string | null;
  skill_id: string | null;
  l1_rule_id: string | null;
  mistake_type: string | null;
  original: string | null;
  corrected: string | null;
  explanation: string | null;
  resolved: boolean;
  created_at: string;
}

export interface AssessmentRow {
  user_id: string;
  speak_score: number;
  band: string;
  sub_scores: unknown;
  placement: unknown;
  summary: string;
  strengths: string[];
  focus_areas: string[];
  taken_at: string;
}
