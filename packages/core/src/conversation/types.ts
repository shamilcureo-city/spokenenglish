/**
 * Core data contracts for the conversation engine. Shared byte-for-byte by the
 * web app, the local dev server, and (later) native.
 *
 * Speakwell is a spoken-English course: a daily WARM-UP free-talk, or a guided
 * LESSON practised live with the AI partner.
 */

/** A transcript turn. `ai` = the partner/counterpart; `learner` = the user. */
export interface Turn {
  speaker: 'ai' | 'learner';
  text: string;
}

/** Which kind of conversation the partner is running. */
export type ConversationMode = 'warmup' | 'lesson';

/**
 * Light, confidence-oriented dimensions reflected back after a session. Each is
 * 0..100 and **higher is always better** (incl. `filler`, where 100 = almost no
 * filler words). This is a gentle mirror, NOT a skill graph.
 */
export interface RecapDimensions {
  clarity: number;
  concision: number;
  confidence: number;
  structure: number;
  filler: number;
}

/** One high-leverage improvement, phrased gently. */
export interface RecapFix {
  /** Roughly what the learner said. */
  said: string;
  /** A stronger, natural way to say it. */
  better: string;
  /** Short reason, in English. */
  why: string;
  /** The same idea explained in the learner's mother tongue, when it helps. */
  explanationInL1?: string;
}

/** A stronger answer to one of the hard moments (rehearsal recaps only). */
export interface StrongerAnswer {
  question: string;
  answer: string;
}

/** The calm, confidence-first post-session card. */
export interface Recap {
  /** Warm 1–2 sentence overview. */
  summary: string;
  /** 1–2 specific things the learner did well. */
  wins: string[];
  /** 1–2 highest-leverage fixes. */
  fixes: RecapFix[];
  /** Rehearsal only: stronger answers to the counterpart's hard questions. */
  strongerAnswers: StrongerAnswer[];
  dimensions: RecapDimensions;
}
