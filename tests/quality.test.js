import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyRetentionPolicy,
  createQualityEvent,
  estimateAiCost,
  moderateLearnerText,
  summarizeQualityEvents,
} from '../src/domain/quality.js';

test('moderates unsafe learner text', () => {
  assert.equal(moderateLearnerText('I want to practice').safe, true);
  const result = moderateLearnerText('I will hurt you');
  assert.equal(result.safe, false);
  assert.equal(result.category, 'harassment');
});

test('estimates cost and summarizes quality events', () => {
  const cost = estimateAiCost({ inputChars: 1000, outputChars: 1000, audioMinutes: 2 });
  const events = [
    createQualityEvent({ kind: 'ai_turn', latencyMs: 100, cost }),
    createQualityEvent({ kind: 'voice', status: 'error', latencyMs: 300, cost: 0 }),
  ];
  const summary = summarizeQualityEvents(events);

  assert.ok(cost > 0);
  assert.equal(summary.events, 2);
  assert.equal(summary.errorCount, 1);
  assert.equal(summary.averageLatencyMs, 200);
});

test('applies transcript retention policy', () => {
  const kept = { id: 'new', timestamp: '2026-06-03T00:00:00.000Z' };
  const old = { id: 'old', timestamp: '2026-05-01T00:00:00.000Z' };
  const result = applyRetentionPolicy(
    { transcript: [kept, old], corrections: [], reports: [] },
    { saveTranscript: true, retentionDays: 7 },
    new Date('2026-06-03T00:00:00.000Z'),
  );

  assert.deepEqual(result.transcript, [kept]);
  assert.deepEqual(applyRetentionPolicy({ transcript: [kept], corrections: [], reports: [] }, { saveTranscript: false, retentionDays: 7 }).transcript, []);
});
