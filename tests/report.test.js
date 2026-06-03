import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSavedReport,
  estimateTalkTime,
  generateSessionReport,
  generateWeeklyProgress,
} from '../src/domain/report.js';

const turn = (speaker, text, phase = 'Guided practice') => ({
  id: `${speaker}-${text}`,
  speaker,
  phase,
  text,
  timestamp: '2026-06-02T00:00:00.000Z',
});

const correction = {
  id: 'correction-1',
  original: 'I am completed my degree',
  corrected: 'I have completed my degree',
  explanation: 'Use have completed for finished education.',
  supportLanguage: 'Hindi',
  mistakeType: 'grammar',
  practicePrompt: 'Repeat the corrected sentence.',
};

test('estimates learner talk time from learner turns only', () => {
  const transcript = [
    turn('ai', 'Please introduce yourself'),
    turn('learner', 'I have completed my degree and I want to work in customer support'),
  ];

  assert.equal(estimateTalkTime(transcript), 1);
});

test('creates actionable scores, corrections, vocabulary, pronunciation focus, and homework', () => {
  const report = generateSessionReport('Confident self-introduction', [
    turn('learner', 'I am completed my degree'),
    turn('ai', 'Small correction'),
  ], [correction]);

  assert.equal(report.sessionTitle, 'Confident self-introduction');
  assert.ok(report.overallScore > 0);
  assert.ok(report.scores.grammar < 78);
  assert.equal(report.topCorrections.length, 1);
  assert.ok(report.pronunciationFocus.length > 0);
  assert.ok(report.vocabulary.includes('strength'));
  assert.match(report.homework[0], /one-minute self-introduction/);
});

test('saves reports with detailed review fields and computes weekly progress', () => {
  const report = generateSessionReport('Confident self-introduction', [
    turn('learner', 'I am completed my degree', 'Role play'),
  ], [correction]);
  const savedReport = createSavedReport({ report, lessonId: 'lesson-1', correctionMode: 'gentle' });
  const progress = generateWeeklyProgress([savedReport]);

  assert.equal(savedReport.lessonId, 'lesson-1');
  assert.equal(savedReport.correctionMode, 'gentle');
  assert.equal(savedReport.homework.length, 3);
  assert.equal(progress.sessions, 1);
  assert.equal(progress.totalCorrections, 1);
  assert.equal(progress.latestScore, savedReport.overallScore);
});
