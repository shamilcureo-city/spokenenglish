/**
 * Types for the scoring layer — the contract between the Gemini REST scoring
 * passes (run in edge functions) and the rest of the system.
 */

import type { ScoredSession } from '../science/decompose.js';

/** A transcript turn. `ai` = coach/examiner; `learner` = the user. */
export interface Turn {
  speaker: 'ai' | 'learner';
  text: string;
}

export interface AssessmentSubScores {
  fluency: number;
  pronunciation: number;
  grammar: number;
  vocabulary: number;
  interaction: number;
}

/** Output of the 5-minute standardized assessment scoring pass. */
export interface AssessmentScore {
  subScores: AssessmentSubScores;
  summary: string;
  strengths: string[];
  focusAreas: string[];
}

/** Output of the lesson session scoring pass: a learner summary + engine evidence. */
export interface SessionScoreResult {
  summary: string;
  overallScore: number; // 0..100
  scored: ScoredSession;
}
