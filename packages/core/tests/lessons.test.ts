import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS, getLesson, lessonsForTrack, bestLessonForSkill } from '../src/domain/lessons.js';
import { SKILL_IDS } from '../src/science/skills.js';

test('lesson ids are unique', () => {
  const seen = new Set<string>();
  for (const l of LESSONS) {
    assert.ok(!seen.has(l.id), `duplicate lesson id: ${l.id}`);
    seen.add(l.id);
  }
});

test('every target skill id exists in the taxonomy', () => {
  for (const l of LESSONS) {
    assert.ok(l.targetSkillIds.length > 0, `${l.id} has no target skills`);
    for (const sid of l.targetSkillIds) {
      assert.ok(SKILL_IDS.has(sid), `lesson ${l.id} → unknown skill ${sid}`);
    }
  }
});

test('every track has at least one lesson', () => {
  assert.ok(lessonsForTrack('basic').length > 0);
  assert.ok(lessonsForTrack('intermediate').length > 0);
  assert.ok(lessonsForTrack('advanced').length > 0);
});

test('getLesson looks up by id', () => {
  assert.equal(getLesson('inter.interview_intro')?.track, 'intermediate');
  assert.equal(getLesson('nope'), undefined);
});

test('bestLessonForSkill finds a lesson that targets the skill', () => {
  const lesson = bestLessonForSkill('gr.articles');
  assert.ok(lesson);
  assert.ok(lesson!.targetSkillIds.includes('gr.articles'));
});

test('bestLessonForSkill prefers the learner\'s track when possible', () => {
  // gr.present_perfect is targeted by an intermediate lesson.
  const lesson = bestLessonForSkill('gr.present_perfect', 'intermediate');
  assert.equal(lesson?.track, 'intermediate');
});

test('every lesson maps to an existing track and cefr', () => {
  const tracks = new Set(['basic', 'intermediate', 'advanced']);
  for (const l of LESSONS) {
    assert.ok(tracks.has(l.track), `${l.id} bad track`);
    assert.ok(/^[ABC][12]$/.test(l.cefr), `${l.id} bad cefr ${l.cefr}`);
    assert.ok(l.scenario.length > 10, `${l.id} scenario too short`);
  }
});
