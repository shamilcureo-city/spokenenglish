import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  personaFlavor,
  weakLessons,
  warmupForUser,
  warmupForDay,
  buildPartnerPrompt,
  GOALS,
} from '../src/conversation/index.js';

test('personaFlavor is empty when nothing is set', () => {
  assert.equal(personaFlavor(undefined, undefined), '');
  assert.equal(personaFlavor(undefined, []), '');
});

test('personaFlavor mentions the goal and interests', () => {
  const f = personaFlavor('work', ['Cricket', 'Food']);
  assert.match(f, /work/i);
  assert.match(f, /Cricket/);
  assert.match(f, /Food/);
});

test('buildPartnerPrompt weaves personalization into the system instruction', () => {
  const prompt = buildPartnerPrompt({
    mode: 'warmup',
    supportLanguage: 'Hindi',
    userName: 'Ravi',
    goal: 'travel',
    interests: ['Movies'],
  });
  assert.match(prompt, /travel/i);
  assert.match(prompt, /Movies/);
  // and still has the coach + greeting
  assert.match(prompt, /Sunny/);
});

test('every goal id produces a flavour line', () => {
  for (const g of GOALS) assert.ok(personaFlavor(g.id).length > 0, `goal ${g.id} should flavour`);
});

test('weakLessons returns completed sub-3-star lessons, weakest first, capped', () => {
  const completed = ['f1-greet', 'f1-introduce', 'f1-goodbye'];
  const stars = { 'f1-greet': 3, 'f1-introduce': 1, 'f1-goodbye': 2 };
  const weak = weakLessons(stars, completed, 5);
  // 3-star lesson excluded; weakest (1★) first
  assert.deepEqual(
    weak.map((l) => l.id),
    ['f1-introduce', 'f1-goodbye'],
  );
});

test('weakLessons treats a completed lesson with no recorded stars as 0 (weak)', () => {
  const weak = weakLessons({}, ['f1-greet'], 3);
  assert.equal(weak.length, 1);
  assert.equal(weak[0]!.id, 'f1-greet');
});

test('weakLessons respects the limit', () => {
  const completed = ['f1-greet', 'f1-introduce', 'f1-goodbye'];
  const stars = { 'f1-greet': 0, 'f1-introduce': 0, 'f1-goodbye': 0 };
  assert.equal(weakLessons(stars, completed, 1).length, 1);
});

test('warmupForUser falls back to the daily rotation when there are no interests', () => {
  for (const d of [0, 1, 7, 13]) {
    assert.equal(warmupForUser(d, []).id, warmupForDay(d).id);
  }
});

test('warmupForUser surfaces an interest-matched topic on its on-days', () => {
  // Travel maps to the 'travel' warm-up; even day → interest day.
  assert.equal(warmupForUser(0, ['Travel']).id, 'travel');
});

test('warmupForUser is deterministic', () => {
  assert.equal(warmupForUser(4, ['Food', 'Movies']).id, warmupForUser(4, ['Food', 'Movies']).id);
});
