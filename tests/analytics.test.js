import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createAnalyticsEvent,
  createBetaReadinessChecklist,
  createPilotExport,
  summarizeLearnerAnalytics,
} from '../src/domain/analytics.js';

test('summarizes activation funnel and engagement metrics', () => {
  const summary = summarizeLearnerAnalytics({
    profile: { name: 'Asha', supportLanguage: 'Hindi', plan: 'Core', streak: 3 },
    transcript: [
      { speaker: 'ai', text: 'Hello' },
      { speaker: 'learner', text: 'I am learning English' },
    ],
    corrections: [{ id: 'c1' }],
    reports: [{ lessonId: 'interview-basics', overallScore: 82 }],
    progress: { 'interview-basics': { completedSessions: 1 } },
    usage: { usedMinutes: 18 },
    billingEvents: [],
    qualityEvents: [],
    safetyEvents: [],
    analyticsEvents: [createAnalyticsEvent('session_started', { lessonId: 'interview-basics' })],
  });

  assert.equal(summary.activationScore, 100);
  assert.equal(summary.engagement.learnerTurns, 1);
  assert.equal(summary.engagement.completedSessions, 1);
  assert.equal(summary.engagement.lessonsTouched, 1);
  assert.deepEqual(summary.alerts, ['No critical beta alerts for this local learner.']);
});

test('creates beta readiness checklist from analytics summary', () => {
  const summary = summarizeLearnerAnalytics({ profile: { name: 'Ravi', supportLanguage: 'Tamil', plan: 'Starter' }, transcript: [], reports: [] });
  const checklist = createBetaReadinessChecklist(summary);

  assert.equal(checklist[0].status, 'needs_work');
  assert.equal(checklist.find((item) => item.item.includes('speaking turn')).status, 'needs_work');
});

test('creates pilot export payload without transcript text', () => {
  const analyticsSummary = summarizeLearnerAnalytics({
    profile: { name: 'Meena', supportLanguage: 'Telugu', goal: 'Job interview', level: 'Beginner', plan: 'Career' },
    transcript: [{ speaker: 'learner', text: 'Private learner text' }],
  });
  const payload = createPilotExport({
    profile: { name: 'Meena', supportLanguage: 'Telugu', goal: 'Job interview', level: 'Beginner', plan: 'Career' },
    analyticsSummary,
    generatedAt: '2026-06-03T00:00:00.000Z',
  });

  assert.equal(payload.generatedAt, '2026-06-03T00:00:00.000Z');
  assert.equal(payload.learner.supportLanguage, 'Telugu');
  assert.equal(JSON.stringify(payload).includes('Private learner text'), false);
});
