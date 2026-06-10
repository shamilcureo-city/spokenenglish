import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ingestSessionEvidence,
  aggregateRating,
  type ScoredSession,
} from '../src/science/decompose.js';
import { newSkillState } from '../src/science/mastery.js';

const NOW = new Date('2026-01-01T00:00:00.000Z');
const opts = { now: NOW, idFor: (s: string) => s };

const session = (over: Partial<ScoredSession>): ScoredSession => ({
  sessionId: 'sess-1',
  userId: 'u1',
  l1: 'Hindi',
  observations: [],
  errors: [],
  ...over,
});

test('aggregateRating maps outcome mixes to FSRS ratings', () => {
  assert.equal(aggregateRating({ correct: 0, self: 0, error: 2, advanced: false }), 1);
  assert.equal(aggregateRating({ correct: 2, self: 0, error: 1, advanced: false }), 2);
  assert.equal(aggregateRating({ correct: 0, self: 1, error: 0, advanced: false }), 2);
  assert.equal(aggregateRating({ correct: 1, self: 0, error: 0, advanced: false }), 3);
  assert.equal(aggregateRating({ correct: 2, self: 0, error: 0, advanced: true }), 4);
});

test('a clean correct observation creates a skill state and no review items', () => {
  const res = ingestSessionEvidence(
    session({ observations: [{ skillId: 'gr.articles', outcome: 'correct' }] }),
    [],
    opts,
  );
  assert.equal(res.updatedStates.length, 1);
  const s = res.updatedStates[0]!;
  assert.equal(s.skillId, 'gr.articles');
  assert.equal(s.reps, 1);
  assert.equal(s.correctCount, 1);
  assert.ok(s.mastery > 0);
  assert.equal(res.newReviewItems.length, 0);
  assert.equal(res.corrections.length, 0);
});

test('an error enqueues a review item and a mother-tongue correction', () => {
  const res = ingestSessionEvidence(
    session({
      errors: [
        {
          skillId: 'gr.stative_verbs',
          original: 'I am knowing the answer',
          corrected: 'I know the answer',
          mistakeType: 'grammar',
          l1RuleId: 'hi.stative_progressive',
        },
      ],
    }),
    [],
    opts,
  );
  assert.equal(res.newReviewItems.length, 1);
  const rv = res.newReviewItems[0]!;
  assert.equal(rv.expected, 'I know the answer');
  assert.equal(rv.l1RuleId, 'hi.stative_progressive');

  assert.equal(res.corrections.length, 1);
  const corr = res.corrections[0]!;
  assert.equal(corr.skillId, 'gr.stative_verbs');
  assert.equal(corr.l1RuleId, 'hi.stative_progressive');
  assert.match(corr.explanation, /continuous/i); // resolved Hindi explanation
  assert.equal(corr.resolved, false);

  // the skill was rated "again" → it has an error recorded
  const state = res.updatedStates.find((s) => s.skillId === 'gr.stative_verbs')!;
  assert.equal(state.errorCount, 1);
});

test('multiple observations of one skill aggregate to a single exposure', () => {
  const res = ingestSessionEvidence(
    session({
      observations: [
        { skillId: 'gr.articles', outcome: 'correct' },
        { skillId: 'gr.articles', outcome: 'correct' },
        { skillId: 'gr.articles', outcome: 'error' },
      ],
    }),
    [],
    opts,
  );
  const s = res.updatedStates.find((x) => x.skillId === 'gr.articles')!;
  assert.equal(s.exposures, 1, 'one session = one exposure for the skill');
  assert.equal(s.reps, 1);
});

test('each error produces its own review item', () => {
  const res = ingestSessionEvidence(
    session({
      errors: [
        { skillId: 'gr.articles', original: 'I am doctor', corrected: 'I am a doctor' },
        { skillId: 'gr.countability', original: 'many informations', corrected: 'much information' },
      ],
    }),
    [],
    opts,
  );
  assert.equal(res.newReviewItems.length, 2);
  assert.deepEqual(
    res.newReviewItems.map((r) => r.expected).sort(),
    ['I am a doctor', 'much information'],
  );
});

test('an error with no matching rule still corrects, with a fallback explanation', () => {
  const res = ingestSessionEvidence(
    session({
      errors: [{ skillId: 'gr.misc', original: 'gibberish xyz', corrected: 'the correct form' }],
    }),
    [],
    opts,
  );
  const corr = res.corrections[0]!;
  assert.equal(corr.l1RuleId, null);
  assert.match(corr.explanation, /correct form/);
});

test('prior state is advanced, not reset', () => {
  const prior = { ...newSkillState('u1', 'gr.articles', NOW), reps: 3, exposures: 3, correctCount: 3, stability: 10, lastReviewedAt: new Date(NOW.getTime() - 10 * 86_400_000).toISOString() };
  const res = ingestSessionEvidence(
    session({ observations: [{ skillId: 'gr.articles', outcome: 'correct' }] }),
    [prior],
    opts,
  );
  const s = res.updatedStates[0]!;
  assert.equal(s.reps, 4);
  assert.equal(s.exposures, 4);
});

test('review item dueAt mirrors the updated skill state', () => {
  const res = ingestSessionEvidence(
    session({
      errors: [{ skillId: 'gr.stative_verbs', original: 'I am knowing', corrected: 'I know', l1RuleId: 'hi.stative_progressive' }],
    }),
    [],
    opts,
  );
  const rv = res.newReviewItems[0]!;
  const state = res.updatedStates.find((s) => s.skillId === 'gr.stative_verbs')!;
  assert.equal(rv.dueAt, state.dueAt);
});

test('ingestSessionEvidence is deterministic', () => {
  const s = session({
    observations: [{ skillId: 'gr.articles', outcome: 'correct' }],
    errors: [{ skillId: 'gr.stative_verbs', original: 'I am knowing', corrected: 'I know' }],
  });
  assert.deepEqual(ingestSessionEvidence(s, [], opts), ingestSessionEvidence(s, [], opts));
});
