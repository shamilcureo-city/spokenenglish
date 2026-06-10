import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fluentMapScore,
  cefrCoverage,
  countMastered,
  dueCount,
  retentionPercent,
  weakestSkills,
  clusterSummary,
  CEFR_BANDS,
} from '../src/science/metrics.js';
import { SKILLS } from '../src/science/skills.js';
import { newSkillState, applyReview } from '../src/science/mastery.js';
import type { SkillState } from '../src/science/types.js';

const NOW = new Date('2026-01-01T00:00:00.000Z');

function master(skillId: string): { state: SkillState; at: Date } {
  let s = newSkillState('u1', skillId, NOW);
  let clock = NOW;
  for (let i = 0; i < 6; i++) {
    s = applyReview(s, 3, clock);
    clock = new Date(s.dueAt!);
  }
  return { state: s, at: new Date(s.updatedAt) };
}

test('fluentMapScore is 0 for an empty learner and within [0,100]', () => {
  assert.equal(fluentMapScore([], SKILLS, NOW), 0);
  const { state, at } = master('gr.present_simple');
  const score = fluentMapScore([state], SKILLS, at);
  assert.ok(score > 0 && score <= 100, `score=${score}`);
});

test('cefrCoverage totals cover the whole taxonomy', () => {
  const cov = cefrCoverage([], SKILLS, NOW);
  assert.equal(cov.length, CEFR_BANDS.length);
  const totalSkills = cov.reduce((a, b) => a + b.total, 0);
  assert.equal(totalSkills, SKILLS.length);
  for (const b of cov) {
    assert.equal(b.mastered, 0);
    assert.ok(b.pct >= 0 && b.pct <= 100);
  }
});

test('mastering an A1 skill shows up in A1 coverage and the mastered count', () => {
  const { state, at } = master('gr.present_simple'); // A1
  assert.equal(countMastered([state], at), 1);
  const a1 = cefrCoverage([state], SKILLS, at).find((b) => b.band === 'A1')!;
  assert.ok(a1.mastered >= 1, `A1 mastered=${a1.mastered}`);
});

test('retentionPercent is 0 for empty and ~100 right after a review', () => {
  assert.equal(retentionPercent([], NOW), 0);
  const s = applyReview(newSkillState('u1', 'gr.articles', NOW), 3, NOW);
  assert.equal(retentionPercent([s], new Date(s.updatedAt)), 100);
});

test('weakestSkills returns lowest live mastery first, capped at n', () => {
  const weak = applyReview(newSkillState('u1', 'gr.articles', NOW), 1, NOW);
  const strong = applyReview(newSkillState('u1', 'gr.present_simple', NOW), 4, NOW);
  const ranked = weakestSkills([strong, weak], SKILLS, 1, NOW);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0]!.skill.id, 'gr.articles');
});

test('dueCount counts only touched skills that are due now or overdue', () => {
  const overdue: SkillState = {
    ...newSkillState('u1', 'gr.articles', NOW),
    reps: 2,
    dueAt: new Date(NOW.getTime() - 86_400_000).toISOString(),
  };
  const future: SkillState = {
    ...newSkillState('u1', 'gr.past_simple', NOW),
    reps: 2,
    dueAt: new Date(NOW.getTime() + 86_400_000).toISOString(),
  };
  assert.equal(dueCount([overdue, future], NOW), 1);
});

test('clusterSummary partitions the whole taxonomy', () => {
  const summary = clusterSummary([], SKILLS, NOW);
  const total = summary.reduce((a, b) => a + b.total, 0);
  assert.equal(total, SKILLS.length);
  for (const c of summary) {
    assert.ok(c.total > 0);
    assert.ok(c.avgMastery >= 0 && c.avgMastery <= 1);
  }
});
