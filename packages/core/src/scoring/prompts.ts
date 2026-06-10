/**
 * Gemini scoring prompts.
 *
 * `buildAssessmentPrompt` is the ORIGINAL standardized-assessment prompt,
 * preserved verbatim (CEFR descriptors, fixed JSON shape, "same performance →
 * same score"). `buildSessionScoringPrompt` is new: it produces both a learner
 * summary and the structured skill + L1 evidence that `ingestSessionEvidence`
 * folds into the map.
 */

import type { Turn } from './types.js';

function renderTranscript(transcript: Turn[], coachLabel: string): string {
  return transcript.map((t) => `${t.speaker === 'ai' ? coachLabel : 'Learner'}: ${t.text}`).join('\n');
}

/** Verbatim port of the original `/api/score-assessment` prompt. */
export function buildAssessmentPrompt(input: { transcript: Turn[]; supportLanguage?: string }): string {
  const transcriptText = renderTranscript(input.transcript, 'Examiner');
  return `You are a certified CEFR-aligned spoken-English examiner. Score the LEARNER's spoken English from this standardized 5-minute assessment transcript. The learner's first language is likely ${input.supportLanguage || 'an Indian language'}.

TRANSCRIPT (Examiner lines are prompts; score ONLY the Learner's speech):
${transcriptText}

Score each dimension from 0 to 100 against CEFR descriptors (0-24=A1, 25-44=A2, 45-64=B1, 65-82=B2, 83-100=C1):
- fluency: pace, pauses, hesitation, sentence length and flow
- pronunciation: clarity and intelligibility (infer from word choice/spelling errors and disfluency markers in the transcript)
- grammar: accuracy, tense, articles, sentence structure
- vocabulary: range and appropriateness of word choice
- interaction: comprehension and how well answers addressed the questions

Be fair and consistent — the SAME performance must always get the SAME score. Do not inflate. Be encouraging in the written summary but honest in the numbers.

Return EXACTLY this JSON:
{
  "subScores": { "fluency": 0, "pronunciation": 0, "grammar": 0, "vocabulary": 0, "interaction": 0 },
  "summary": "Two-sentence plain-English summary of the learner's current spoken level.",
  "strengths": ["strength 1", "strength 2"],
  "focusAreas": ["area to improve 1", "area to improve 2"]
}`;
}

export interface SessionScoringInput {
  transcript: Turn[];
  l1: string;
  /** The fixed skill list Gemini must map evidence onto. */
  skills: { id: string; label: string }[];
  /** Candidate L1 transfer rules (pre-filtered by L1 + triggers). May be empty. */
  candidateRules: { id: string; title: string }[];
  lessonTitle?: string;
}

/** New prompt: produce a learner summary + structured skill/L1 evidence. */
export function buildSessionScoringPrompt(input: SessionScoringInput): string {
  const transcriptText = renderTranscript(input.transcript, 'Coach');
  const skillIndex = input.skills.map((s) => `${s.id}: ${s.label}`).join('\n');
  const ruleIndex =
    input.candidateRules.length > 0
      ? input.candidateRules.map((r) => `${r.id}: ${r.title}`).join('\n')
      : '(none detected — use null)';

  return `You are FluentMap, a warm, CEFR-aligned spoken-English coach for Indian learners. The learner's mother tongue is ${input.l1}. Evaluate the learner's spoken English from this lesson transcript and produce precise, structured evidence.
${input.lessonTitle ? `LESSON: ${input.lessonTitle}` : ''}

TRANSCRIPT (Coach lines are prompts; evaluate ONLY the Learner's speech):
${transcriptText}

Map every observation onto this fixed SKILL LIST — use these EXACT ids:
${skillIndex}

When a mistake is caused by the learner's mother tongue, choose the single best CAUSE id from this list (or null):
${ruleIndex}

Return EXACTLY this JSON:
{
  "summary": "One encouraging but honest sentence about the learner's performance.",
  "overallScore": 0,
  "skillsUsed": [
    { "skillId": "<an id from the SKILL LIST>", "outcome": "correct" }
  ],
  "errors": [
    { "original": "<what the learner said>", "corrected": "<the correct version>", "mistakeType": "grammar", "skillId": "<an id from the SKILL LIST>", "l1RuleId": "<a CAUSE id or null>" }
  ]
}

RULES:
- "overallScore" is 0-100 (CEFR: 0-24 A1, 25-44 A2, 45-64 B1, 65-82 B2, 83-100 C1).
- Only use skill ids from the SKILL LIST. Never invent ids.
- "outcome" is one of: "correct", "self_corrected", "error".
- "skillsUsed": 3-8 skills the learner demonstrated this session.
- "errors": up to 6 concrete mistakes; if there are none, use [].
- "mistakeType" is one of: "grammar", "vocabulary", "pronunciation", "fluency".
- Be consistent: the same performance must always get the same evaluation.`;
}
