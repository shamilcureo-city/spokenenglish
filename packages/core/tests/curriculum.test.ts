import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LEVELS,
  UNITS,
  LESSONS,
  lessonById,
  unitsByLevel,
  lessonsByUnit,
  firstLessonOfUnit,
  nextLesson,
  isLessonUnlocked,
  levelProgress,
  courseProgress,
  pickScenario,
} from '../src/conversation/index.js';

test('curriculum has 3 levels, 16 units, and well-formed lessons', () => {
  assert.equal(LEVELS.length, 3);
  assert.equal(UNITS.length, 16);
  assert.ok(LESSONS.length >= 30);
  const unitIds = new Set(UNITS.map((u) => u.id));
  const ids = new Set<string>();
  for (const l of LESSONS) {
    assert.ok(l.id && !ids.has(l.id), `unique id: ${l.id}`);
    ids.add(l.id);
    assert.ok(unitIds.has(l.unitId), `valid unit: ${l.unitId}`);
    assert.ok(l.fn && l.canDo && l.scenario, `text fields: ${l.id}`);
    assert.ok(l.phrases.length >= 3, `phrases: ${l.id}`);
  }
});

test('every unit has at least one lesson', () => {
  for (const u of UNITS) assert.ok(lessonsByUnit(u.id).length >= 1, `unit ${u.id} has lessons`);
});

test('course is authored to full depth: ~64 lessons, every unit has at least 4', () => {
  assert.ok(LESSONS.length >= 60, `>=60 lessons (got ${LESSONS.length})`);
  for (const u of UNITS) assert.ok(lessonsByUnit(u.id).length >= 4, `unit ${u.id} depth (${lessonsByUnit(u.id).length})`);
});

test('every lesson: 5–8 phrases, ≥1 distinct scenario variant, id namespaced to its unit', () => {
  for (const l of LESSONS) {
    assert.ok(l.phrases.length >= 5 && l.phrases.length <= 8, `${l.id} phrases 5–8 (got ${l.phrases.length})`);
    assert.ok((l.variants?.length ?? 0) >= 1, `${l.id} has at least one variant`);
    assert.ok(l.id.startsWith(l.unitId + '-'), `${l.id} namespaced to ${l.unitId}`);
    for (const v of l.variants ?? []) assert.ok(v.trim() && v !== l.scenario, `${l.id} variant distinct & non-empty`);
  }
});

test('pickScenario rotates through the variants by attempt and wraps', () => {
  const l = LESSONS[0]!;
  const all = [l.scenario, ...(l.variants ?? [])];
  assert.equal(pickScenario(l, 0), all[0]);
  assert.equal(pickScenario(l, all.length), all[0]); // wraps around
  if (all.length > 1) assert.equal(pickScenario(l, 1), all[1]);
});

test('nextLesson starts at the very first lesson when nothing is done', () => {
  assert.equal(nextLesson([])?.id, LESSONS[0]!.id);
});

test('nextLesson advances past completed lessons', () => {
  const next = nextLesson([LESSONS[0]!.id, LESSONS[1]!.id]);
  assert.equal(next?.id, LESSONS[2]!.id);
});

test('placement start jumps the next lesson to that unit', () => {
  const firstI1 = firstLessonOfUnit('i1')!;
  assert.equal(nextLesson([], 'i1')?.id, firstI1.id);
});

test('lessons are gated sequentially', () => {
  assert.equal(isLessonUnlocked(LESSONS[0]!.id, []), true);
  assert.equal(isLessonUnlocked(LESSONS[5]!.id, []), false); // far ahead, locked
  // completing the first unlocks the second
  assert.equal(isLessonUnlocked(LESSONS[1]!.id, [LESSONS[0]!.id]), true);
});

test('placement unlocks everything up to the start unit', () => {
  const firstI1 = firstLessonOfUnit('i1')!;
  assert.equal(isLessonUnlocked(firstI1.id, [], 'i1'), true);
  // a foundation lesson before the start is also reachable (for review)
  assert.equal(isLessonUnlocked(LESSONS[0]!.id, [], 'i1'), true);
});

test('levelProgress and courseProgress count completion', () => {
  const foundation = LESSONS.filter((l) => l.levelId === 'foundation');
  const someDone = foundation.slice(0, 2).map((l) => l.id);
  const p = levelProgress('foundation', someDone);
  assert.equal(p.done, 2);
  assert.ok(p.total >= 10);
  assert.ok(p.pct > 0 && p.pct < 100);
  assert.equal(courseProgress([]).done, 0);
  assert.equal(courseProgress(LESSONS.map((l) => l.id)).pct, 100);
});

test('lessonById round-trips', () => {
  assert.equal(lessonById(LESSONS[0]!.id)?.title, LESSONS[0]!.title);
  assert.equal(lessonById('nope'), undefined);
  assert.ok(unitsByLevel('foundation').length >= 4);
});
