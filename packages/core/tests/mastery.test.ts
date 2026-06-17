import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  recordEvidence,
  evidenceFromUtterance,
  weakestConcepts,
  masteryStats,
  scoreUtterance,
  slugify,
  type MasteryState,
} from '../src/conversation/index.js';

test('slugify makes stable ids', () => {
  assert.equal(slugify('Could I get…, please?'), 'could-i-get-please');
});

test('a new concept is seeded from a neutral prior, not pinned to the first sample', () => {
  let s: MasteryState = {};
  s = recordEvidence(s, [{ id: 'word:village', label: 'village', kind: 'word', outcome: 0 }]);
  // first miss → below neutral but not 0 (one bad sample shouldn't pin it)
  assert.ok(s['word:village']!.mastery > 0 && s['word:village']!.mastery < 0.4);
  assert.equal(s['word:village']!.attempts, 1);
  // first clean catch of a fresh word → "working on", not instantly mastered
  let s2: MasteryState = {};
  s2 = recordEvidence(s2, [{ id: 'word:good', label: 'good', kind: 'word', outcome: 1 }]);
  assert.ok(s2['word:good']!.mastery < 0.8);
});

test('repeated good attempts converge to mastered (EMA)', () => {
  let s: MasteryState = {};
  for (let i = 0; i < 3; i++) s = recordEvidence(s, [{ id: 'w', label: 'w', kind: 'word', outcome: 1 }]);
  assert.ok(s['w']!.mastery >= 0.8);
  assert.equal(s['w']!.attempts, 3);
});

test('recordEvidence is immutable and clamps outcomes', () => {
  const s0: MasteryState = {};
  const s1 = recordEvidence(s0, [{ id: 'word:x', label: 'x', kind: 'word', outcome: 5 }]);
  assert.notEqual(s0, s1);
  // clamped to 1 then blended with the neutral prior → ~0.725, never above 1
  assert.ok(s1['word:x']!.mastery > 0.7 && s1['word:x']!.mastery <= 1);
});

test('evidenceFromUtterance tracks the phrase + long words, skips short ones', () => {
  const score = scoreUtterance('I live in a village', 'I live in willage');
  const ev = evidenceFromUtterance('I live in a village', score);
  const ids = ev.map((e) => e.id);
  assert.ok(ids.includes('phrase:i-live-in-a-village'));
  assert.ok(ids.includes('word:village')); // close → tracked
  assert.ok(ids.includes('word:live'));
  assert.ok(!ids.some((id) => id === 'word:in' || id === 'word:a')); // short words skipped
  assert.equal(ev.find((e) => e.id === 'word:village')!.outcome, 0.5); // "close"
});

test('weakestConcepts returns lowest mastery first, excludes mastered, respects kind', () => {
  let s: MasteryState = {};
  s = recordEvidence(s, [
    { id: 'word:village', label: 'village', kind: 'word', outcome: 0.2 },
    { id: 'word:restaurant', label: 'restaurant', kind: 'word', outcome: 0.5 },
    { id: 'phrase:p', label: 'a phrase', kind: 'phrase', outcome: 0.3 },
  ]);
  // master "hello" with repeated good attempts so it drops off the weak list
  for (let i = 0; i < 3; i++) s = recordEvidence(s, [{ id: 'word:hello', label: 'hello', kind: 'word', outcome: 1 }]);
  const weakWords = weakestConcepts(s, 5, { kind: 'word' });
  assert.deepEqual(weakWords.map((m) => m.label), ['village', 'restaurant']); // hello excluded, asc
  const weakPhrases = weakestConcepts(s, 5, { kind: 'phrase' });
  assert.deepEqual(weakPhrases.map((m) => m.label), ['a phrase']);
});

test('masteryStats counts mastered vs working', () => {
  let s: MasteryState = {};
  s = recordEvidence(s, [{ id: 'b', label: 'b', kind: 'word', outcome: 0.3 }]);
  for (let i = 0; i < 3; i++) s = recordEvidence(s, [{ id: 'a', label: 'a', kind: 'word', outcome: 1 }]);
  const st = masteryStats(s);
  assert.equal(st.tracked, 2);
  assert.equal(st.mastered, 1); // a
  assert.equal(st.working, 1); // b
});
