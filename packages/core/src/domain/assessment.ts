/**
 * Standardized spoken-English assessment — ported from the original
 * `domain/assessment.js`. CEFR-aligned, deterministic placement ("same score →
 * same track"). Pure functions; the Gemini examiner + scoring run in the live
 * session / edge function, this module just defines the rubric and placement.
 */

import type { Cefr } from '../science/types.js';

export type TrackId = 'basic' | 'intermediate' | 'advanced';

export interface ScoreDimension {
  key: keyof SpeakSubScores;
  label: string;
  weight: number;
}

export interface SpeakSubScores {
  fluency: number;
  pronunciation: number;
  grammar: number;
  vocabulary: number;
  interaction: number;
}

/** Five scored dimensions; weights sum to 1. */
export const SCORE_DIMENSIONS: ScoreDimension[] = [
  { key: 'fluency', label: 'Fluency', weight: 0.25 },
  { key: 'pronunciation', label: 'Pronunciation', weight: 0.2 },
  { key: 'grammar', label: 'Grammar', weight: 0.2 },
  { key: 'vocabulary', label: 'Vocabulary', weight: 0.2 },
  { key: 'interaction', label: 'Interaction', weight: 0.15 },
];

export interface CefrBand {
  band: Cefr;
  label: string;
  min: number;
  max: number;
  track: TrackId;
}

export const CEFR_BANDS: CefrBand[] = [
  { band: 'A1', label: 'Beginner', min: 0, max: 24, track: 'basic' },
  { band: 'A2', label: 'Elementary', min: 25, max: 44, track: 'basic' },
  { band: 'B1', label: 'Intermediate', min: 45, max: 64, track: 'intermediate' },
  { band: 'B2', label: 'Upper-Intermediate', min: 65, max: 82, track: 'advanced' },
  { band: 'C1', label: 'Advanced', min: 83, max: 100, track: 'advanced' },
];

const clampScore = (n: number): number => Math.min(100, Math.max(0, Math.round(n)));

/** Weighted Speak Score (0..100) from the five sub-scores. */
export function computeSpeakScore(subScores: SpeakSubScores): number {
  const total = SCORE_DIMENSIONS.reduce((acc, d) => acc + (subScores[d.key] ?? 0) * d.weight, 0);
  return clampScore(total);
}

/** The CEFR band a score falls into. */
export function scoreToBand(score: number): CefrBand {
  const s = clampScore(score);
  return CEFR_BANDS.find((b) => s >= b.min && s <= b.max) ?? CEFR_BANDS[0]!;
}

export interface Placement {
  speakScore: number;
  band: Cefr;
  bandLabel: string;
  track: TrackId;
  /** Top-of-band learners skip the first module. */
  startModuleIndex: number;
  rationale: string;
}

/** Deterministic placement: same score always routes to the same track + start. */
export function scoreToPlacement(score: number): Placement {
  const speakScore = clampScore(score);
  const band = scoreToBand(speakScore);
  const position = (speakScore - band.min) / (band.max - band.min + 1);
  const startModuleIndex = position > 0.7 ? 1 : 0;
  return {
    speakScore,
    band: band.band,
    bandLabel: band.label,
    track: band.track,
    startModuleIndex,
    rationale:
      startModuleIndex === 1
        ? `Strong ${band.band} (${band.label}) — starting you a little ahead in the ${band.track} track.`
        : `${band.band} (${band.label}) — placed in the ${band.track} track.`,
  };
}

export interface AssessmentStage {
  id: string;
  title: string;
  seconds: number;
  scored: boolean;
  instruction: string;
  examinerLine: string;
}

/** A fixed passage everyone reads — a standardization anchor. */
export const READ_ALOUD_PASSAGE =
  'Every morning, I wake up early and prepare a hot cup of tea. Then I check my phone for messages and plan my day. I believe that small habits, repeated every day, lead to big results over time.';

/** The standardized 5-minute (300s) assessment: warm-up + 4 scored stages. */
export const ASSESSMENT_STAGES: AssessmentStage[] = [
  {
    id: 'warmup',
    title: 'Warm-up',
    seconds: 30,
    scored: false,
    instruction: 'Introduce yourself in a sentence or two.',
    examinerLine: "Hello! Let's begin. Could you tell me your name and which city you are from?",
  },
  {
    id: 'read-aloud',
    title: 'Read aloud',
    seconds: 45,
    scored: true,
    instruction: 'Read the passage on screen clearly and at a natural pace.',
    examinerLine: 'Please read this short passage aloud.',
  },
  {
    id: 'describe',
    title: 'Describe',
    seconds: 60,
    scored: true,
    instruction: 'Describe your typical day from morning to night.',
    examinerLine: 'Now, describe your typical day from morning to night.',
  },
  {
    id: 'role-play',
    title: 'Role-play',
    seconds: 105,
    scored: true,
    instruction: 'You are late to an important meeting. Call your manager and explain.',
    examinerLine: "Let's role-play. You are running late to an important meeting. Call me — your manager — and explain.",
  },
  {
    id: 'opinion',
    title: 'Opinion',
    seconds: 60,
    scored: true,
    instruction: 'Give your opinion and one clear reason.',
    examinerLine: 'Last question. Do you prefer working from home or from an office, and why?',
  },
];

/** Total assessment duration in seconds (300). */
export const ASSESSMENT_TOTAL_SECONDS = ASSESSMENT_STAGES.reduce((a, s) => a + s.seconds, 0);

/** System instruction for the AI examiner running the standardized assessment. */
export function buildExaminerPrompt(input: { supportLanguage: string }): string {
  return `You are a calm, professional CEFR-aligned spoken-English examiner for Indian learners. The candidate's first language is likely ${input.supportLanguage}.

Run a standardized 5-minute spoken assessment in these stages, in order:
1. Warm-up (unscored): ask their name and city.
2. Read-aloud: ask them to read the passage shown on their screen.
3. Describe: ask them to describe their typical day.
4. Role-play: you are their manager; they call to say they are late to a meeting. Ask one follow-up.
5. Opinion: ask whether they prefer working from home or office, and why.

RULES:
- Keep YOUR turns short (one question at a time). Let the candidate do most of the talking.
- Do NOT teach, correct, or coach during the assessment — only elicit speech.
- Be neutral and encouraging in tone; never shame.
- Move to the next stage once they have answered. After the opinion stage, thank them and end.
- You are speaking aloud — be natural and conversational, no markdown.`;
}
