import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeMastery,
  deriveLifecycle,
  newSkillState,
  applyReview,
  stabilityMaturity,
} from '../src/science/mastery.js';
import type { Rating, SkillState } from '../src/science/types.js';

const NOW = new Date('2026-01-01T00:00:00.000Z');
const plusDays = (base: Date, n: number): Date => new Date(base.getTime() + n * 86_400_000);

test('a brand-new skill has mastery 0 and lifecycle "new"', () => {
  const s = newSkillState('u1', 'gr.present_perfect', NOW);
  assert.equal(s.mastery, 0);
  assert.equal(s.state, 'new');
  assert.equal(computeMastery(s, NOW), 0);
});

test('stabilityMaturity is 0 at S=0, ~0.63 at the horizon, and monotonic increasing', () => {
  assert.equal(stabilityMaturity(0), 0);
  assert.ok(Math.abs(stabilityMaturity(21) - (1 - Math.exp(-1))) < 1e-9);
  assert.ok(stabilityMaturity(60) > stabilityMaturity(21));
});

test('mastery stays within [0,1] over a long mixed review history', () => {
  let s = newSkillState('u1', 'gr.articles', NOW);
  const ratings: Rating[] = [3, 3, 1, 2, 3, 4, 1, 3, 4, 4, 3, 2];
  let clock = NOW;
  for (const r of ratings) {
    s = applyReview(s, r, clock);
    assert.ok(s.mastery >= 0 && s.mastery <= 1, `mastery out of range: ${s.mastery}`);
    clock = new Date(s.dueAt!); // practise each item when it next falls due
  }
});

test('repeated spaced "good" reviews drive a skill to mastered', () => {
  let s = newSkillState('u1', 'fn.self_intro', NOW);
  let clock = NOW;
  for (let i = 0; i < 6; i++) {
    s = applyReview(s, 3, clock);
    clock = new Date(s.dueAt!);
  }
  assert.equal(s.state, 'mastered', `expected mastered, got ${s.state} (mastery ${s.mastery})`);
  assert.ok(s.stability >= 21);
});

test('an "again" lapse knocks a mastered skill out of mastered', () => {
  let s = newSkillState('u1', 'gr.past_simple', NOW);
  let clock = NOW;
  for (let i = 0; i < 6; i++) {
    s = applyReview(s, 3, clock);
    clock = new Date(s.dueAt!);
  }
  assert.equal(s.state, 'mastered');
  const lapsed = applyReview(s, 1, clock);
  assert.notEqual(lapsed.state, 'mastered');
  assert.ok(lapsed.stability < s.stability);
  assert.equal(lapsed.errorCount, s.errorCount + 1);
});

test('accuracy raises mastery: more correct exposures → higher mastery (same memory)', () => {
  const base: SkillState = {
    ...newSkillState('u1', 'gr.modals', NOW),
    stability: 20,
    difficulty: 5,
    reps: 5,
    lastReviewedAt: NOW.toISOString(),
  };
  const accurate = computeMastery({ ...base, exposures: 5, correctCount: 5 }, NOW);
  const sloppy = computeMastery({ ...base, exposures: 5, correctCount: 1 }, NOW);
  assert.ok(accurate > sloppy, `accurate=${accurate} sloppy=${sloppy}`);
});

test('freshness decays: mastery is lower when measured long after the last review', () => {
  let s = newSkillState('u1', 'lex.workplace', NOW);
  s = applyReview(s, 3, NOW); // one good review
  const immediate = computeMastery(s, new Date(s.lastReviewedAt!));
  const muchLater = computeMastery(s, plusDays(new Date(s.lastReviewedAt!), 120));
  assert.ok(muchLater < immediate, `later=${muchLater} immediate=${immediate}`);
});

test('deriveLifecycle thresholds', () => {
  assert.equal(deriveLifecycle(0.99, 100, 0), 'new', 'reps 0 is always new');
  assert.equal(deriveLifecycle(0.9, 30, 4), 'mastered');
  assert.equal(deriveLifecycle(0.9, 5, 4), 'review', 'high mastery but low durability is not mastered');
  assert.equal(deriveLifecycle(0.6, 10, 2), 'review');
  assert.equal(deriveLifecycle(0.2, 1, 1), 'learning');
});

test('applyReview is deterministic', () => {
  const s = newSkillState('u1', 'gr.prepositions', NOW);
  assert.deepEqual(applyReview(s, 3, NOW), applyReview(s, 3, NOW));
});
