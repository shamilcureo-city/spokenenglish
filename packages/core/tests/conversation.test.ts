import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPartnerPrompt,
  buildRecapPrompt,
  parseRecap,
  warmupForDay,
  WARMUPS,
  type Lesson,
  type Turn,
} from '../src/conversation/index.js';

const LESSON: Lesson = {
  id: 'i2-disagree',
  unitId: 'i2',
  levelId: 'intermediate',
  title: 'Agreeing & disagreeing politely',
  fn: 'Disagree without rudeness',
  canDo: 'I can disagree politely.',
  phrases: ["That's a good point, but…", "I'm not so sure about that"],
  scenario: 'Take a mild opposing view and get them to disagree politely.',
};

test('parseRecap coerces, clamps dimensions, and drops fixes without a better version', () => {
  const r = parseRecap({
    summary: 'Clear answers.',
    wins: ['Good opening', '', 42],
    fixes: [
      { said: 'No you are wrong', better: "I'm not so sure about that", why: 'softer' },
      { said: 'no better field' }, // dropped
    ],
    dimensions: { clarity: 150, concision: -5, confidence: 80, structure: 'x', filler: 70 },
  });
  assert.equal(r.wins.length, 1);
  assert.equal(r.fixes.length, 1);
  assert.equal(r.fixes[0]!.better, "I'm not so sure about that");
  assert.equal(r.dimensions.clarity, 100); // clamped
  assert.equal(r.dimensions.concision, 0); // clamped
  assert.equal(r.dimensions.structure, 60); // fallback for non-number
});

test('parseRecap returns a usable default for empty input', () => {
  const r = parseRecap(undefined);
  assert.ok(r.summary.length > 0);
  assert.deepEqual(r.fixes, []);
  assert.deepEqual(r.strongerAnswers, []);
  assert.equal(r.delivery, undefined);
});

test('parseRecap keeps a delivery tip when present and drops an empty one', () => {
  assert.equal(parseRecap({ delivery: '  Slow down a touch on long sentences.  ' }).delivery, 'Slow down a touch on long sentences.');
  assert.equal(parseRecap({ delivery: '' }).delivery, undefined);
  assert.equal(parseRecap({ delivery: 123 }).delivery, undefined);
});

test('warm-up persona includes the topic and forbids mid-conversation correction', () => {
  const p = buildPartnerPrompt({
    mode: 'warmup',
    supportLanguage: 'Hindi',
    userName: 'Ravi',
    warmupPrompt: 'Explain your day',
  });
  assert.match(p, /Ravi/);
  assert.match(p, /Explain your day/);
  assert.match(p, /do not correct/i);
});

test('lesson persona runs the scenario and draws out the target moves', () => {
  const p = buildPartnerPrompt({ mode: 'lesson', supportLanguage: 'Tamil', userName: 'Asha', lesson: LESSON });
  assert.match(p, /Disagree without rudeness/);
  assert.match(p, /I'm not so sure about that/);
  assert.match(p, /do not correct/i);
});

test('buildRecapPrompt names the lesson target moves and labels the transcript', () => {
  const transcript: Turn[] = [
    { speaker: 'ai', text: 'Working from home is always better, right?' },
    { speaker: 'learner', text: 'No you are wrong.' },
  ];
  const p = buildRecapPrompt({ transcript, mode: 'lesson', supportLanguage: 'Hindi', lesson: LESSON });
  assert.match(p, /Disagree without rudeness/);
  assert.match(p, /USER: No you are wrong\./);
  assert.match(p, /PARTNER: Working from home/);
});

test('warmupForDay is deterministic and wraps around', () => {
  assert.equal(warmupForDay(0).id, WARMUPS[0]!.id);
  assert.equal(warmupForDay(WARMUPS.length).id, WARMUPS[0]!.id);
  assert.equal(warmupForDay(-1).id, WARMUPS[WARMUPS.length - 1]!.id);
});
