import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FSRS,
  FACTOR,
  retrievability,
  nextInterval,
  schedule,
} from '../src/science/fsrs.js';
import type { MemoryState, Rating } from '../src/science/types.js';

const NOW = new Date('2026-01-01T00:00:00.000Z');
const daysAgo = (n: number): string => new Date(NOW.getTime() - n * 86_400_000).toISOString();

const fresh = (): MemoryState => ({
  stability: 0,
  difficulty: 0,
  reps: 0,
  lapses: 0,
  lastReviewedAt: null,
  dueAt: null,
});

const reviewed = (stability: number, difficulty: number, ageDays: number) => ({
  stability,
  difficulty,
  reps: 3,
  lapses: 0,
  lastReviewedAt: daysAgo(ageDays),
});

test('retrievability is 1 immediately after review', () => {
  assert.equal(retrievability(0, 10), 1);
});

test('retrievability ≈ requestRetention (0.9) when elapsed == stability', () => {
  const r = retrievability(10, 10);
  assert.ok(Math.abs(r - 0.9) < 1e-6, `expected ~0.9, got ${r}`);
});

test('retrievability is monotonically decreasing in elapsed time', () => {
  let prev = Infinity;
  for (let t = 0; t <= 60; t += 5) {
    const r = retrievability(t, 10);
    assert.ok(r <= prev, `R should not increase: t=${t} r=${r} prev=${prev}`);
    prev = r;
  }
});

test('retrievability is 0 for non-positive stability', () => {
  assert.equal(retrievability(5, 0), 0);
});

test('nextInterval equals stability (rounded) at requestRetention 0.9', () => {
  assert.equal(nextInterval(10), 10);
  assert.equal(nextInterval(37), 37);
});

test('nextInterval clamps to [1, maximumInterval]', () => {
  assert.equal(nextInterval(0.2), 1, 'tiny stability floors to 1 day');
  assert.equal(nextInterval(100000), DEFAULT_FSRS.maximumInterval, 'huge stability caps');
});

test('first exposure seeds stability from weights (good == w[2])', () => {
  const out = schedule(fresh(), 3, NOW);
  assert.equal(out.stability, DEFAULT_FSRS.w[2]);
  assert.equal(out.reps, 1);
  assert.equal(out.lapses, 0);
  assert.equal(out.lastReviewedAt, NOW.toISOString());
});

test('first-exposure stability ordering: easy > good > hard > again', () => {
  const again = schedule(fresh(), 1, NOW).stability;
  const hard = schedule(fresh(), 2, NOW).stability;
  const good = schedule(fresh(), 3, NOW).stability;
  const easy = schedule(fresh(), 4, NOW).stability;
  assert.ok(easy > good && good > hard && hard > again, `${easy} ${good} ${hard} ${again}`);
});

test('a "good" recall never decreases stability', () => {
  const before = reviewed(10, 5, 10);
  const after = schedule(before, 3, NOW);
  assert.ok(after.stability >= before.stability, `${after.stability} < ${before.stability}`);
});

test('an "again" lapse decreases stability and increments lapses', () => {
  const before = reviewed(30, 5, 20);
  const after = schedule(before, 1, NOW);
  assert.ok(after.stability <= before.stability, `${after.stability} > ${before.stability}`);
  assert.equal(after.lapses, before.lapses + 1);
});

test('recall stability ordering on review: easy ≥ good ≥ hard', () => {
  const before = reviewed(20, 6, 18); // aged so R < 1 and the spread is visible
  const hard = schedule(before, 2, NOW).stability;
  const good = schedule(before, 3, NOW).stability;
  const easy = schedule(before, 4, NOW).stability;
  assert.ok(easy >= good && good >= hard, `easy=${easy} good=${good} hard=${hard}`);
});

test('difficulty stays within [1, 10] across many reviews', () => {
  let mem = fresh();
  const ratings: Rating[] = [1, 2, 3, 4, 1, 1, 3, 4, 2, 3];
  let clock = NOW;
  for (const r of ratings) {
    mem = schedule(mem, r, clock);
    assert.ok(mem.difficulty >= 1 && mem.difficulty <= 10, `D out of range: ${mem.difficulty}`);
    clock = new Date(new Date(mem.dueAt!).getTime());
  }
});

test('reps increments on every call', () => {
  let mem = fresh();
  for (let i = 1; i <= 5; i++) {
    mem = schedule(mem, 3, NOW);
    assert.equal(mem.reps, i);
  }
});

test('schedule is deterministic: same (memory, rating, now) → identical output', () => {
  const before = reviewed(15, 5, 12);
  const a = schedule(before, 3, NOW);
  const b = schedule(before, 3, NOW);
  assert.deepEqual(a, b);
});

test('dueAt is in the future and consistent with the interval', () => {
  const out = schedule(reviewed(10, 5, 10), 3, NOW);
  const due = new Date(out.dueAt!).getTime();
  assert.ok(due > NOW.getTime(), 'due date must be after now');
  const days = Math.round((due - NOW.getTime()) / 86_400_000);
  assert.equal(days, nextInterval(out.stability));
});

test('FACTOR is the value that pins R(S,S) = 0.9', () => {
  // (1 + FACTOR)^(-0.5) === 0.9  →  FACTOR === 1/0.81 - 1
  assert.ok(Math.abs(FACTOR - (1 / 0.81 - 1)) < 1e-9);
});
