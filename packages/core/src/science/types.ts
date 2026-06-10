/**
 * Core type definitions for the FluentMap learning-science engine.
 *
 * Everything here is platform-agnostic data. The engine functions that operate
 * on these types are PURE and clock-injected (no Date.now() inside) so they are
 * deterministic and unit-testable — mirroring the existing app's
 * `calculateStreak(prev, last, now)` convention.
 */

export type SkillFamily = 'grammar' | 'function' | 'lexis' | 'phoneme';
export type SkillLifecycle = 'new' | 'learning' | 'review' | 'mastered';
export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

/** FSRS rating. 1=again (forgot), 2=hard, 3=good, 4=easy. */
export type Rating = 1 | 2 | 3 | 4;

/** How a skill is observed in a transcript. */
export interface SkillDetector {
  kind: 'regex' | 'pos_pattern' | 'phoneme' | 'llm_rubric';
  pattern?: string;
  rubricKey?: string;
}

/** A node in the mastery map (reference data; ~120 of these seeded). */
export interface Skill {
  id: string; // 'gr.present_perfect', 'ph.theta_voiceless', 'fn.disagree_politely'
  family: SkillFamily;
  label: string;
  cefr: Cefr;
  cluster: string; // 'Tenses', 'Articles & determiners', 'TH sounds', ...
  /** 0..1 fine-grained i+1 ordering signal, complements cefr. */
  difficulty: number;
  prerequisites: string[]; // skill ids that gate availability
  exemplar: string;
  detectors: SkillDetector[];
}

/** The FSRS memory model for one (user, skill). */
export interface MemoryState {
  /** FSRS S: days until retrievability decays to requestRetention. */
  stability: number;
  /** FSRS D: 1..10 intrinsic difficulty for this learner. */
  difficulty: number;
  reps: number;
  lapses: number;
  lastReviewedAt: string | null; // ISO
  dueAt: string | null; // ISO
}

/** Persisted per-user skill row (memory model + evidence + derived mastery). */
export interface SkillState extends MemoryState {
  userId: string;
  skillId: string;
  /** 0..1 — THE number the UI shows on the map. Derived, not authoritative. */
  mastery: number;
  exposures: number;
  correctCount: number;
  errorCount: number;
  state: SkillLifecycle;
  updatedAt: string; // ISO
}

/** An entry in the spaced-repetition queue (mistake notebook 2.0). */
export interface ReviewItem {
  id: string;
  userId: string;
  skillId: string;
  correctionId: string | null;
  prompt: string;
  expected: string;
  l1RuleId: string | null;
  dueAt: string; // ISO — mirrors skill_state.dueAt for fast querying
  intervalDays: number;
  reps: number;
  lapses: number;
  suspended: boolean;
}

export type L1 = 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Malayalam';
export type TransferCategory = 'grammar' | 'phonetic' | 'lexical' | 'pragmatic';

export interface TransferTrigger {
  kind: 'regex' | 'phoneme' | 'llm';
  pattern?: string; // regex source (case-insensitive applied by the engine)
}

/** A curated L1→L2 transfer rule (reference data, linguist-reviewed). */
export interface L1TransferRule {
  id: string; // 'hi.article_omission', 'ta.sov_word_order', ...
  l1: L1;
  category: TransferCategory;
  skillId: string; // the L2 skill this transfer interferes with
  title: string;
  cause: string; // shown in UI as the "science"
  triggers: TransferTrigger[];
  /** Correction explanation authored in each mother tongue. */
  explanations: Partial<Record<L1, string>>;
  contrast: { l1Form: string; l2Form: string };
  exampleErrors: string[];
}

/** Output of the adaptive sequencer. */
export interface ActivityChoice {
  kind: 'review' | 'lesson' | 'drill';
  skillIds: string[];
  lessonId?: string;
  rationale: string; // surfaced in the UI ("Reviewing 'present perfect' — due today")
}

/** Tunable FSRS parameters. */
export interface FsrsParams {
  /** 19 FSRS-5 weights. */
  w: number[];
  /** Target retention probability at the scheduled interval (e.g. 0.9). */
  requestRetention: number;
  /** Hard cap on interval in days. */
  maximumInterval: number;
}
