import assert from 'node:assert/strict';
import test from 'node:test';
import { createNotebookEntry, getCorrectionMode, practiceNotebookEntry, summarizeMistakeNotebook } from '../src/domain/correction.js';
import { getMockTutorResponse } from '../src/services/aiTutor.js';

const learnerTurn = {
  id: 'turn-1',
  speaker: 'learner',
  phase: 'Guided practice',
  text: 'I am completed my degree',
  timestamp: '2026-06-02T00:00:00.000Z',
};

test('returns gentle mode when an unknown correction mode is requested', () => {
  assert.equal(getCorrectionMode('unknown').id, 'gentle');
});

test('formats tutor response differently for fluency mode', () => {
  const response = getMockTutorResponse(learnerTurn, 'Hindi', 'fluency');

  assert.ok(response.correction);
  assert.match(response.aiText, /I saved one correction/);
});

test('tracks practice count and mastery in the mistake notebook', () => {
  const entry = createNotebookEntry({
    id: 'correction-1',
    mistakeType: 'grammar',
    original: 'I am completed my degree',
    corrected: 'I have completed my degree',
    explanation: 'Use have completed.',
    practicePrompt: 'Repeat the corrected sentence.',
  });

  const practiced = practiceNotebookEntry(practiceNotebookEntry(practiceNotebookEntry(entry)));

  assert.equal(practiced.practicedCount, 3);
  assert.equal(practiced.mastered, true);
  assert.deepEqual(summarizeMistakeNotebook([practiced]), { grammar: 1 });
});
