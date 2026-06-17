import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreUtterance, normalizeWord, tokenize, levenshtein } from '../src/conversation/index.js';

test('normalizeWord strips punctuation and case, keeps inner apostrophes', () => {
  assert.equal(normalizeWord('Hello,'), 'hello');
  assert.equal(normalizeWord("I'm"), "i'm");
  assert.equal(normalizeWord('"good"'), 'good');
  assert.equal(tokenize('Hi, how are you?').join(' '), 'hi how are you');
});

test('levenshtein basics', () => {
  assert.equal(levenshtein('village', 'village'), 0);
  assert.equal(levenshtein('village', 'willage'), 1);
  assert.equal(levenshtein('', 'abc'), 3);
});

test('a perfect repeat is all green and 3 stars', () => {
  const r = scoreUtterance('Could I get a coffee, please?', 'could I get a coffee please');
  assert.ok(r.words.every((w) => w.status === 'good'), JSON.stringify(r.words));
  assert.equal(r.intelligible, 100);
  assert.equal(r.stars, 3);
});

test('a missing word is red and lowers the score', () => {
  const r = scoreUtterance('I work as a teacher', 'I work as teacher');
  const a = r.words.find((w) => w.word === 'a')!;
  assert.equal(a.status, 'missing');
  assert.ok(r.intelligible < 100 && r.intelligible >= 60);
});

test('a near-match is yellow (close) and records what was heard', () => {
  const r = scoreUtterance('I live in a village', 'I live in a willage');
  const v = r.words.find((w) => w.word === 'village')!;
  assert.equal(v.status, 'close');
  assert.equal(v.heardAs, 'willage');
});

test('nothing heard → all missing, 0%, 1 star', () => {
  const r = scoreUtterance('Nice to meet you', '');
  assert.ok(r.words.every((w) => w.status === 'missing'));
  assert.equal(r.intelligible, 0);
  assert.equal(r.stars, 1);
});

test('word order slips still credit the word', () => {
  const r = scoreUtterance('how are you', 'you are how');
  assert.ok(r.words.every((w) => w.status === 'good'));
});

test('thresholds: ~half caught lands at 1–2 stars, not 3', () => {
  const r = scoreUtterance('one two three four', 'one two');
  assert.ok(r.stars < 3);
});
