import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickNextActivity } from '../src/science/sequencer.js';
import type { Cefr, ReviewItem, Skill, SkillLifecycle, SkillState } from '../src/science/types.js';

const NOW = new Date('2026-01-01T00:00:00.000Z');
const DAY = 86_400_000;

const skill = (
  id: string,
  difficulty: number,
  prerequisites: string[] = [],
  cefr: Cefr = 'A1',
): Skill => ({
  id,
  family: 'grammar',
  label: id,
  cefr,
  cluster: 'test',
  difficulty,
  prerequisites,
  exemplar: '',
  detectors: [],
});

const stateFor = (
  skillId: string,
  mastery: number,
  lifecycle: SkillLifecycle = 'review',
): SkillState => ({
  userId: 'u1',
  skillId,
  stability: lifecycle === 'mastered' ? 40 : 6,
  difficulty: 5,
  reps: 4,
  lapses: 0,
  lastReviewedAt: NOW.toISOString(),
  dueAt: null,
  mastery,
  exposures: 4,
  correctCount: 4,
  errorCount: 0,
  state: lifecycle,
  updatedAt: NOW.toISOString(),
});

const review = (skillId: string, dueDaysFromNow: number): ReviewItem => ({
  id: `rv-${skillId}`,
  userId: 'u1',
  skillId,
  correctionId: null,
  prompt: '',
  expected: '',
  l1RuleId: null,
  dueAt: new Date(NOW.getTime() + dueDaysFromNow * DAY).toISOString(),
  intervalDays: Math.abs(dueDaysFromNow),
  reps: 1,
  lapses: 0,
  suspended: false,
});

test('≥3 overdue reviews trigger a review set, capped at 7 unique skills', () => {
  const dueReviews = Array.from({ length: 9 }, (_, i) => review(`s${i}`, -(i + 1)));
  const out = pickNextActivity({
    states: [],
    skills: [skill('x', 0.1)],
    dueReviews,
    now: NOW,
  });
  assert.equal(out.kind, 'review');
  assert.equal(out.skillIds.length, 7);
});

test('fewer than 3 overdue reviews do not trigger a review set', () => {
  const out = pickNextActivity({
    states: [],
    skills: [skill('a', 0.1), skill('b', 0.2)],
    dueReviews: [review('a', -1), review('b', -2)],
    now: NOW,
  });
  assert.ok(out.kind === 'lesson' || out.kind === 'drill', `got ${out.kind}`);
});

test('a brand-new learner is given the easiest entry skill', () => {
  const out = pickNextActivity({
    states: [],
    skills: [skill('easy', 0.1), skill('mid', 0.2), skill('hard', 0.5)],
    dueReviews: [],
    now: NOW,
  });
  assert.deepEqual(out.skillIds, ['easy']);
});

test('prerequisite gate blocks a skill until its prereq is mastered', () => {
  const skills = [skill('A', 0.2), skill('B', 0.3, ['A'])];

  const locked = pickNextActivity({ states: [], skills, dueReviews: [], now: NOW });
  assert.deepEqual(locked.skillIds, ['A'], 'B is locked while A is unmastered');

  const unlocked = pickNextActivity({
    states: [stateFor('A', 0.95, 'mastered')],
    skills,
    dueReviews: [],
    now: NOW,
  });
  assert.deepEqual(unlocked.skillIds, ['B'], 'B unlocks once A is mastered');
});

test('i+1 band: picks a skill just above the frontier, not a far-harder one', () => {
  const skills = [
    skill('m1', 0.2),
    skill('m2', 0.4),
    skill('justAbove', 0.35),
    skill('wayHarder', 0.9),
  ];
  const out = pickNextActivity({
    states: [stateFor('m1', 0.95, 'mastered'), stateFor('m2', 0.95, 'mastered')],
    skills,
    dueReviews: [],
    now: NOW,
  });
  assert.deepEqual(out.skillIds, ['justAbove']);
});

test('weakest-first: lowest-mastery candidate in the band wins', () => {
  const skills = [skill('p', 0.35), skill('q', 0.36)];
  const out = pickNextActivity({
    states: [stateFor('p', 0.4, 'review'), stateFor('q', 0.1, 'learning')],
    skills,
    dueReviews: [],
    now: NOW,
  });
  assert.deepEqual(out.skillIds, ['q']);
});

test('targetCefr caps the ceiling — skills above the band are never chosen', () => {
  const skills = [skill('b1', 0.3, [], 'B1'), skill('c1', 0.31, [], 'C1')];
  const out = pickNextActivity({
    states: [],
    skills,
    dueReviews: [],
    now: NOW,
    targetCefr: 'B1',
  });
  assert.deepEqual(out.skillIds, ['b1']);
});

test('when everything reachable is mastered, it strengthens the weakest skill', () => {
  const skills = [skill('a', 0.2), skill('b', 0.3)];
  const out = pickNextActivity({
    states: [stateFor('a', 0.92, 'mastered'), stateFor('b', 0.95, 'mastered')],
    skills,
    dueReviews: [],
    now: NOW,
  });
  assert.equal(out.kind, 'drill');
  assert.deepEqual(out.skillIds, ['a']);
});

test('lessonForSkill resolver turns the choice into a lesson with a lessonId', () => {
  const out = pickNextActivity({
    states: [],
    skills: [skill('easy', 0.1)],
    dueReviews: [],
    now: NOW,
    lessonForSkill: (id) => (id === 'easy' ? 'lesson-easy' : undefined),
  });
  assert.equal(out.kind, 'lesson');
  assert.equal(out.lessonId, 'lesson-easy');
});

test('pickNextActivity is deterministic', () => {
  const input = {
    states: [stateFor('m1', 0.95, 'mastered')],
    skills: [skill('m1', 0.2), skill('next', 0.3)],
    dueReviews: [review('m1', -1)],
    now: NOW,
  };
  assert.deepEqual(pickNextActivity(input), pickNextActivity(input));
});
