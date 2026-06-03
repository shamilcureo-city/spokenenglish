import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addUsageMinutes,
  canUseMinutes,
  completeCheckout,
  createDefaultUsage,
  getPlanByName,
  getRemainingMinutes,
  normalizeUsageForToday,
} from '../src/domain/subscription.js';

test('calculates daily remaining minutes by plan', () => {
  const today = new Date('2026-06-03T00:00:00.000Z');
  const usage = createDefaultUsage(today);

  assert.equal(getPlanByName('Core').dailyMinutes, 30);
  assert.equal(getRemainingMinutes('Free', usage, today), 5);
  assert.equal(canUseMinutes('Free', usage, 6, today), false);
});

test('resets stale usage and adds usage minutes', () => {
  const today = new Date('2026-06-03T00:00:00.000Z');
  const staleUsage = { date: '2026-06-02', usedMinutes: 5 };
  const normalized = normalizeUsageForToday(staleUsage, today);
  const updated = addUsageMinutes(normalized, 2.5, today);

  assert.equal(normalized.usedMinutes, 0);
  assert.equal(updated.usedMinutes, 2.5);
});

test('simulates checkout and returns billing events', () => {
  const checkout = completeCheckout('Free', 'Career');

  assert.equal(checkout.planName, 'Career');
  assert.equal(checkout.event.status, 'payment_success');
  assert.equal(checkout.event.amount, 499);
});
