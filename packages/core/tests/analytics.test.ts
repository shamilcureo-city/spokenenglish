import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activationFunnel, activationScore, nextStep } from '../src/domain/analytics.js';

const allFalse = {
  hasProfile: false,
  assessed: false,
  enrolled: false,
  practiced: false,
  reviewed: false,
  habit: false,
};

test('activationFunnel has six ordered steps', () => {
  const f = activationFunnel(allFalse);
  assert.equal(f.length, 6);
  assert.deepEqual(
    f.map((s) => s.key),
    ['profile', 'assess', 'enroll', 'practice', 'review', 'habit'],
  );
  assert.ok(f.every((s) => !s.complete));
});

test('activationScore reflects completed fraction', () => {
  assert.equal(activationScore(activationFunnel(allFalse)), 0);
  assert.equal(
    activationScore(activationFunnel({ ...allFalse, hasProfile: true, assessed: true, enrolled: true })),
    50,
  );
  const all = { hasProfile: true, assessed: true, enrolled: true, practiced: true, reviewed: true, habit: true };
  assert.equal(activationScore(activationFunnel(all)), 100);
});

test('nextStep returns the first incomplete step, or null when done', () => {
  const partial = activationFunnel({ ...allFalse, hasProfile: true, assessed: true });
  assert.equal(nextStep(partial)?.key, 'enroll');
  const done = activationFunnel({
    hasProfile: true,
    assessed: true,
    enrolled: true,
    practiced: true,
    reviewed: true,
    habit: true,
  });
  assert.equal(nextStep(done), null);
});
