import assert from 'node:assert/strict';
import test from 'node:test';
import { courseCatalog } from '../src/domain/course.js';
import {
  calculateStreak,
  createSessionRuntime,
  getNextPhase,
  getPhaseProgress,
  getSessionElapsedMinutes,
  shouldResumeSession,
} from '../src/domain/session.js';
import { defaultReminder, getReminderMessage } from '../src/domain/retention.js';

const lesson = courseCatalog[0];

test('creates resumable session runtime and phase progress', () => {
  const runtime = createSessionRuntime(lesson, new Date('2026-06-02T05:00:00.000Z'));
  const progress = getPhaseProgress(lesson, runtime.currentPhase);

  assert.equal(runtime.status, 'in_progress');
  assert.equal(progress.currentIndex, 0);
  assert.equal(progress.totalPhases, 6);
  assert.equal(getNextPhase(lesson, runtime.currentPhase), 'Mini lesson');
  assert.equal(shouldResumeSession(runtime, new Date('2026-06-02T06:00:00.000Z')), true);
});

test('calculates elapsed minutes and streaks', () => {
  assert.equal(getSessionElapsedMinutes('2026-06-02T05:00:00.000Z', new Date('2026-06-02T05:15:00.000Z')), 15);
  assert.equal(calculateStreak(3, '2026-06-01T10:00:00.000Z', new Date('2026-06-02T10:00:00.000Z')), 4);
  assert.equal(calculateStreak(3, '2026-05-30T10:00:00.000Z', new Date('2026-06-02T10:00:00.000Z')), 1);
});

test('formats reminder copy', () => {
  assert.match(getReminderMessage({ name: 'Ravi' }, defaultReminder), /Ravi/);
  assert.match(getReminderMessage({ name: 'Ravi' }, defaultReminder), /19:30/);
});
