import assert from 'node:assert/strict';
import test from 'node:test';
import { courseCatalog, getLessonById, getLessonTotalMinutes, supportLanguages } from '../src/domain/course.js';
import { subscriptionPlans } from '../src/domain/subscription.js';

test('all seeded lessons are 30-minute sessions', () => {
  assert.ok(courseCatalog.length >= 4);
  for (const lesson of courseCatalog) {
    assert.equal(getLessonTotalMinutes(lesson), 30, lesson.title);
  }
});

test('lesson lookup falls back to the first lesson', () => {
  assert.equal(getLessonById('missing-id').id, courseCatalog[0].id);
});

test('mvp languages and plans are available', () => {
  assert.deepEqual(supportLanguages, ['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam']);
  assert.ok(subscriptionPlans.some((plan) => plan.dailyMinutes === 30));
});
