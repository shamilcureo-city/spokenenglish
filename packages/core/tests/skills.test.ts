import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, SKILL_IDS, getSkill, skillsByFamily } from '../src/science/skills.js';
import { L1_TRANSFER_RULES } from '../src/science/l1-rules.js';
import type { Cefr } from '../src/science/types.js';

const CEFR_ORDER: Record<Cefr, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4 };

test('skill ids are unique', () => {
  const seen = new Set<string>();
  for (const sk of SKILLS) {
    assert.ok(!seen.has(sk.id), `duplicate skill id: ${sk.id}`);
    seen.add(sk.id);
  }
  assert.equal(seen.size, SKILLS.length);
});

test('family ids match their prefix', () => {
  const prefix: Record<string, string> = { grammar: 'gr', function: 'fn', lexis: 'lex', phoneme: 'ph' };
  for (const sk of SKILLS) {
    assert.equal(sk.id.split('.')[0], prefix[sk.family], `${sk.id} has family ${sk.family}`);
  }
});

test('difficulty is within [0, 1] and cefr is valid', () => {
  for (const sk of SKILLS) {
    assert.ok(sk.difficulty >= 0 && sk.difficulty <= 1, `${sk.id} difficulty ${sk.difficulty}`);
    assert.ok(sk.cefr in CEFR_ORDER, `${sk.id} cefr ${sk.cefr}`);
    assert.ok(sk.label.length > 0 && sk.cluster.length > 0, `${sk.id} missing label/cluster`);
  }
});

test('every prerequisite references a real skill', () => {
  for (const sk of SKILLS) {
    for (const p of sk.prerequisites) {
      assert.ok(SKILL_IDS.has(p), `${sk.id} has unknown prerequisite ${p}`);
    }
  }
});

test('a prerequisite never has a higher CEFR than the skill that needs it', () => {
  for (const sk of SKILLS) {
    for (const p of sk.prerequisites) {
      const pre = getSkill(p)!;
      assert.ok(
        CEFR_ORDER[pre.cefr] <= CEFR_ORDER[sk.cefr],
        `${sk.id} (${sk.cefr}) requires ${p} (${pre.cefr}) which is harder`,
      );
    }
  }
});

test('the prerequisite graph is acyclic', () => {
  const prereqs = new Map(SKILLS.map((sk) => [sk.id, sk.prerequisites]));
  const state = new Map<string, 'visiting' | 'done'>();
  const dfs = (id: string, path: string[]): void => {
    if (state.get(id) === 'done') return;
    assert.ok(state.get(id) !== 'visiting', `cycle detected: ${[...path, id].join(' → ')}`);
    state.set(id, 'visiting');
    for (const p of prereqs.get(id) ?? []) dfs(p, [...path, id]);
    state.set(id, 'done');
  };
  for (const sk of SKILLS) dfs(sk.id, []);
});

test('family counts match the designed taxonomy (~120 total)', () => {
  assert.equal(skillsByFamily('grammar').length, 45, 'grammar');
  assert.equal(skillsByFamily('function').length, 31, 'function');
  assert.equal(skillsByFamily('lexis').length, 25, 'lexis');
  assert.equal(skillsByFamily('phoneme').length, 20, 'phoneme');
  assert.equal(SKILLS.length, 121, 'total');
});

test('every L1 transfer rule points at a real skill in the taxonomy', () => {
  for (const rule of L1_TRANSFER_RULES) {
    assert.ok(SKILL_IDS.has(rule.skillId), `rule ${rule.id} → unknown skill ${rule.skillId}`);
  }
});
