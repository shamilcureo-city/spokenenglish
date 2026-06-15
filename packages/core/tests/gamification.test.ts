import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  scoreLesson,
  usedMoves,
  levelForXp,
  xpIntoLevel,
  humaneStreak,
  type Lesson,
  type Recap,
} from '../src/conversation/index.js';

const LESSON: Lesson = {
  id: 'i2-disagree',
  unitId: 'i2',
  levelId: 'intermediate',
  title: 'Disagree politely',
  fn: 'Disagree without rudeness',
  canDo: 'I can disagree politely.',
  phrases: ["That's a good point, but…", "I'm not so sure about that"],
  scenario: '...',
};

const recap = (n: number): Recap => ({
  summary: 's',
  wins: [],
  fixes: [],
  strongerAnswers: [],
  dimensions: { clarity: n, concision: n, confidence: n, structure: n, filler: n },
});

test('usedMoves matches the distinctive core of a phrase the learner said', () => {
  const t = [
    { speaker: 'ai' as const, text: 'WFH is best, right?' },
    { speaker: 'learner' as const, text: "Well, I'm not so sure about that, honestly." },
  ];
  const moves = usedMoves(LESSON, t);
  assert.equal(moves.length, 1);
  assert.equal(moves[0], "I'm not so sure about that");
});

test('usedMoves returns nothing when the learner said nothing matching', () => {
  assert.deepEqual(usedMoves(LESSON, [{ speaker: 'learner', text: 'yes ok sure' }]), []);
});

test('scoreLesson blends delivery + moves into 1–3 stars and positive XP', () => {
  const good = scoreLesson(recap(90), LESSON, [
    { speaker: 'learner', text: "That's a good point, but I disagree. I'm not so sure about that." },
  ]);
  assert.equal(good.stars, 3);
  assert.equal(good.usedMoves.length, 2);
  assert.ok(good.xp >= 20);

  const weak = scoreLesson(recap(30), LESSON, [{ speaker: 'learner', text: 'no.' }]);
  assert.equal(weak.stars, 1);
  assert.ok(weak.xp > 0 && weak.xp < good.xp);
});

test('levelForXp and xpIntoLevel (100 XP per level)', () => {
  assert.equal(levelForXp(0), 1);
  assert.equal(levelForXp(99), 1);
  assert.equal(levelForXp(100), 2);
  assert.equal(levelForXp(250), 3);
  const into = xpIntoLevel(150);
  assert.equal(into.level, 2);
  assert.equal(into.into, 50);
  assert.equal(into.pct, 50);
});

test('humaneStreak counts consecutive days and bridges ONE missed day', () => {
  const shift = (n: number) => String(n); // "0" = today, "1" = yesterday, ...
  assert.equal(humaneStreak(['0', '1', '2'], shift), 3);
  assert.equal(humaneStreak([], shift), 0);
  assert.equal(humaneStreak(['0', '2'], shift), 2); // gap at day 1 bridged
  assert.equal(humaneStreak(['0', '3'], shift), 1); // two-day gap is NOT bridged
  assert.equal(humaneStreak(['1', '2'], shift), 2); // counts from yesterday
});
