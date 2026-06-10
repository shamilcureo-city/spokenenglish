import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCORE_DIMENSIONS,
  CEFR_BANDS,
  computeSpeakScore,
  scoreToBand,
  scoreToPlacement,
  ASSESSMENT_STAGES,
  ASSESSMENT_TOTAL_SECONDS,
  buildExaminerPrompt,
} from '../src/domain/assessment.js';

test('score dimension weights sum to 1', () => {
  const sum = SCORE_DIMENSIONS.reduce((a, d) => a + d.weight, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9, `weights sum to ${sum}`);
});

test('CEFR bands tile 0..100 with no gaps or overlaps', () => {
  assert.equal(CEFR_BANDS[0]!.min, 0);
  assert.equal(CEFR_BANDS[CEFR_BANDS.length - 1]!.max, 100);
  for (let i = 1; i < CEFR_BANDS.length; i++) {
    assert.equal(CEFR_BANDS[i]!.min, CEFR_BANDS[i - 1]!.max + 1, `gap before ${CEFR_BANDS[i]!.band}`);
  }
});

test('computeSpeakScore: extremes and a weighted example', () => {
  assert.equal(
    computeSpeakScore({ fluency: 100, pronunciation: 100, grammar: 100, vocabulary: 100, interaction: 100 }),
    100,
  );
  assert.equal(
    computeSpeakScore({ fluency: 0, pronunciation: 0, grammar: 0, vocabulary: 0, interaction: 0 }),
    0,
  );
  // 80*.25 + 70*.2 + 60*.2 + 50*.2 + 40*.15 = 62
  assert.equal(
    computeSpeakScore({ fluency: 80, pronunciation: 70, grammar: 60, vocabulary: 50, interaction: 40 }),
    62,
  );
});

test('scoreToBand respects boundaries', () => {
  assert.equal(scoreToBand(24).band, 'A1');
  assert.equal(scoreToBand(25).band, 'A2');
  assert.equal(scoreToBand(44).band, 'A2');
  assert.equal(scoreToBand(45).band, 'B1');
  assert.equal(scoreToBand(64).band, 'B1');
  assert.equal(scoreToBand(65).band, 'B2');
  assert.equal(scoreToBand(82).band, 'B2');
  assert.equal(scoreToBand(83).band, 'C1');
  assert.equal(scoreToBand(100).band, 'C1');
});

test('scoreToPlacement maps bands to tracks deterministically', () => {
  assert.equal(scoreToPlacement(10).track, 'basic');
  assert.equal(scoreToPlacement(50).track, 'intermediate');
  assert.equal(scoreToPlacement(90).track, 'advanced');
  assert.deepEqual(scoreToPlacement(55), scoreToPlacement(55));
});

test('top-of-band learners are accelerated to module 2', () => {
  // B1 spans 45..64 (width 20). >70% in → score >= 45 + 0.7*20 = 59 → start at module 1.
  assert.equal(scoreToPlacement(46).startModuleIndex, 0);
  assert.equal(scoreToPlacement(63).startModuleIndex, 1);
});

test('the assessment is exactly 5 minutes with 4 scored stages', () => {
  assert.equal(ASSESSMENT_TOTAL_SECONDS, 300);
  assert.equal(ASSESSMENT_STAGES.filter((s) => s.scored).length, 4);
  assert.equal(ASSESSMENT_STAGES[0]!.scored, false, 'warm-up is unscored');
});

test('buildExaminerPrompt mentions the support language and stays neutral', () => {
  const p = buildExaminerPrompt({ supportLanguage: 'Tamil' });
  assert.match(p, /first language is likely Tamil/);
  assert.match(p, /Do NOT teach, correct, or coach/);
});
