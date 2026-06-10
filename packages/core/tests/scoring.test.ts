import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAssessmentPrompt,
  buildSessionScoringPrompt,
  buildGenerateContentBody,
  geminiRestUrl,
  extractText,
  parseJsonResponse,
  assembleScoredSession,
  validateAssessmentScore,
  ASSESSMENT_TEMPERATURE,
  GEMINI_REST_MODEL,
} from '../src/scoring/index.js';
import type { Turn } from '../src/scoring/index.js';

const transcript: Turn[] = [
  { speaker: 'ai', text: 'Tell me about your day.' },
  { speaker: 'learner', text: 'I am knowing english since school.' },
];

test('buildAssessmentPrompt is the verbatim CEFR examiner prompt', () => {
  const p = buildAssessmentPrompt({ transcript, supportLanguage: 'Hindi' });
  assert.match(p, /certified CEFR-aligned spoken-English examiner/);
  assert.match(p, /Examiner: Tell me about your day\./);
  assert.match(p, /Learner: I am knowing english since school\./);
  assert.match(p, /"subScores"/);
  assert.match(p, /"focusAreas"/);
  assert.match(p, /first language is likely Hindi/);
});

test('buildAssessmentPrompt falls back when no support language', () => {
  assert.match(buildAssessmentPrompt({ transcript }), /likely an Indian language/);
});

test('buildGenerateContentBody forces JSON and includes temperature only when given', () => {
  const withTemp = buildGenerateContentBody('hi', { temperature: 0.2 });
  assert.equal(withTemp.generationConfig.responseMimeType, 'application/json');
  assert.equal(withTemp.generationConfig.temperature, 0.2);
  assert.equal(withTemp.contents[0]!.parts[0]!.text, 'hi');

  const noTemp = buildGenerateContentBody('hi');
  assert.equal('temperature' in noTemp.generationConfig, false);
});

test('assessment temperature is preserved at 0.2', () => {
  assert.equal(ASSESSMENT_TEMPERATURE, 0.2);
});

test('geminiRestUrl targets gemini-2.5-flash with the key', () => {
  const url = geminiRestUrl('SECRET');
  assert.match(url, new RegExp(`/models/${GEMINI_REST_MODEL}:generateContent`));
  assert.match(url, /key=SECRET/);
});

test('extractText pulls model text from a REST response', () => {
  const resp = { candidates: [{ content: { parts: [{ text: '{"a":1}' }] } }] };
  assert.equal(extractText(resp), '{"a":1}');
  assert.equal(extractText({}), '');
});

test('parseJsonResponse handles plain and fenced JSON', () => {
  assert.deepEqual(parseJsonResponse('{"x":1}'), { x: 1 });
  assert.deepEqual(parseJsonResponse('```json\n{"x":2}\n```'), { x: 2 });
});

test('buildSessionScoringPrompt embeds the skill list, candidate rules, and contract', () => {
  const p = buildSessionScoringPrompt({
    transcript,
    l1: 'Hindi',
    skills: [{ id: 'gr.stative_verbs', label: 'Stative verbs' }],
    candidateRules: [{ id: 'hi.stative_progressive', title: 'Stative verbs in -ing' }],
    lessonTitle: 'Interview intro',
  });
  assert.match(p, /gr\.stative_verbs: Stative verbs/);
  assert.match(p, /hi\.stative_progressive: Stative verbs in -ing/);
  assert.match(p, /"skillsUsed"/);
  assert.match(p, /LESSON: Interview intro/);
});

test('buildSessionScoringPrompt notes when no rules were detected', () => {
  const p = buildSessionScoringPrompt({ transcript, l1: 'Tamil', skills: [], candidateRules: [] });
  assert.match(p, /\(none detected — use null\)/);
});

test('assembleScoredSession keeps valid evidence and drops hallucinated ids', () => {
  const out = assembleScoredSession(
    {
      summary: 'Good effort.',
      overallScore: 250, // out of range → clamped
      skillsUsed: [
        { skillId: 'gr.present_simple', outcome: 'correct' },
        { skillId: 'gr.NOT_REAL', outcome: 'correct' }, // dropped: unknown skill
        { skillId: 'gr.articles', outcome: 'banana' }, // dropped: bad outcome
      ],
      errors: [
        { skillId: 'gr.stative_verbs', original: 'I am knowing', corrected: 'I know', l1RuleId: 'hi.stative_progressive' },
        { skillId: 'gr.articles', original: 'I am doctor', corrected: 'I am a doctor', l1RuleId: 'made.up.rule' }, // rule nulled
        { skillId: 'nope', original: 'x', corrected: 'y' }, // dropped: unknown skill
        { skillId: 'gr.articles', original: '', corrected: 'y' }, // dropped: empty original
      ],
    },
    { sessionId: 's1', userId: 'u1', l1: 'Hindi' },
  );

  assert.equal(out.scored.observations.length, 1);
  assert.equal(out.scored.observations[0]!.skillId, 'gr.present_simple');

  assert.equal(out.scored.errors.length, 2);
  assert.equal(out.scored.errors[0]!.l1RuleId, 'hi.stative_progressive');
  assert.equal(out.scored.errors[1]!.l1RuleId, null, 'unknown rule id is nulled');

  assert.equal(out.overallScore, 100, 'clamped to 100');
  assert.equal(out.scored.sessionId, 's1');
  assert.equal(out.scored.l1, 'Hindi');
});

test('validateAssessmentScore clamps sub-scores and coerces arrays', () => {
  const v = validateAssessmentScore({
    subScores: { fluency: 130, pronunciation: -5, grammar: 60, vocabulary: 55, interaction: 40 },
    summary: 'ok',
    strengths: ['clear', 42, ''],
    // focusAreas missing entirely
  });
  assert.equal(v.subScores.fluency, 100);
  assert.equal(v.subScores.pronunciation, 0);
  assert.deepEqual(v.strengths, ['clear']);
  assert.deepEqual(v.focusAreas, []);
});
