import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getPlanByName,
  createDefaultUsage,
  normalizeUsageForToday,
  getRemainingMinutes,
  canUseMinutes,
  addUsageMinutes,
  completeCheckout,
  toDateKey,
} from '../src/domain/subscription.js';
import {
  calculateStreak,
  getSessionElapsedMinutes,
  shouldResumeSession,
} from '../src/domain/session.js';
import { moderateLearnerText, estimateAiCost } from '../src/domain/quality.js';
import { getReminderMessage, defaultReminder } from '../src/domain/retention.js';

/* ── subscription ── */

test('plans: Free is 5 min/day, unknown falls back to Free', () => {
  assert.equal(getPlanByName('Free').dailyMinutes, 5);
  assert.equal(getPlanByName('Career').dailyMinutes, 45);
  assert.equal(getPlanByName('???').name, 'Free');
});

test('usage normalizes when the day rolls over', () => {
  const stale = { date: '2026-06-09', usedMinutes: 4 };
  assert.deepEqual(normalizeUsageForToday(stale, '2026-06-10'), { date: '2026-06-10', usedMinutes: 0 });
  assert.deepEqual(normalizeUsageForToday(stale, '2026-06-09'), stale);
});

test('remaining minutes clamps and gating works', () => {
  const today = '2026-06-10';
  let usage = createDefaultUsage(today);
  assert.equal(getRemainingMinutes('Free', usage, today), 5);
  usage = addUsageMinutes(usage, 4, today);
  assert.equal(getRemainingMinutes('Free', usage, today), 1);
  assert.ok(canUseMinutes('Free', usage, today, 1));
  assert.ok(!canUseMinutes('Free', usage, today, 2));
  usage = addUsageMinutes(usage, 10, today);
  assert.equal(getRemainingMinutes('Free', usage, today), 0, 'never negative');
});

test('checkout switches the plan and records a paid event', () => {
  const { planName, event } = completeCheckout('Free', 'Core');
  assert.equal(planName, 'Core');
  assert.equal(event.status, 'paid');
  assert.equal(event.amount, getPlanByName('Core').amount);
});

test('toDateKey returns YYYY-MM-DD', () => {
  assert.equal(toDateKey(new Date('2026-06-10T15:00:00Z')), '2026-06-10');
});

/* ── session / streak ── */

test('streak: starts at 1, increments on consecutive days, holds same day, resets on gap', () => {
  assert.equal(calculateStreak(0, null, '2026-06-10T20:00:00Z'), 1);
  assert.equal(calculateStreak(3, '2026-06-09T20:00:00Z', '2026-06-10T08:00:00Z'), 4);
  assert.equal(calculateStreak(3, '2026-06-10T08:00:00Z', '2026-06-10T20:00:00Z'), 3);
  assert.equal(calculateStreak(7, '2026-06-07T20:00:00Z', '2026-06-10T20:00:00Z'), 1);
});

test('elapsed minutes and resume window', () => {
  const now = new Date('2026-06-10T10:30:00Z');
  assert.equal(getSessionElapsedMinutes('2026-06-10T10:00:00Z', now), 30);
  assert.ok(shouldResumeSession('2026-06-10T05:00:00Z', now));
  assert.ok(!shouldResumeSession('2026-06-08T05:00:00Z', now));
});

/* ── quality ── */

test('moderation flags self-harm and passes normal text', () => {
  assert.equal(moderateLearnerText('I want to practice my English').safe, true);
  const flagged = moderateLearnerText('sometimes I want to end my life');
  assert.equal(flagged.safe, false);
  assert.equal(flagged.category, 'self_harm');
  assert.ok(flagged.message && flagged.message.length > 0);
});

test('cost estimate is deterministic', () => {
  const a = estimateAiCost({ inputChars: 1000, outputChars: 500, audioMinutes: 5 });
  const b = estimateAiCost({ inputChars: 1000, outputChars: 500, audioMinutes: 5 });
  assert.equal(a, b);
  assert.ok(a > 0);
});

/* ── retention ── */

test('reminder message includes the name and time of day', () => {
  const msg = getReminderMessage('Ravi', defaultReminder);
  assert.match(msg, /Ravi/);
  assert.match(msg, /evening/);
});
