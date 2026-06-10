import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phonemeDrills, getPhonemeDrill } from '../src/domain/phonemes.js';
import { SKILL_IDS, skillsByFamily } from '../src/science/skills.js';

test('every drill targets a real phoneme skill', () => {
  for (const d of phonemeDrills) {
    assert.ok(SKILL_IDS.has(d.skillId), `drill ${d.skillId} not in taxonomy`);
    assert.ok(d.skillId.startsWith('ph.'), `${d.skillId} is not a phoneme skill`);
  }
});

test('drills are unique, well-formed, and have tips + examples', () => {
  const seen = new Set<string>();
  for (const d of phonemeDrills) {
    assert.ok(!seen.has(d.skillId), `duplicate drill ${d.skillId}`);
    seen.add(d.skillId);
    assert.ok(d.label.length > 0 && d.sound.length > 0, `${d.skillId} missing label/sound`);
    assert.ok(d.examples.length > 0, `${d.skillId} has no examples`);
    assert.ok(d.tip.length > 10, `${d.skillId} tip too short`);
  }
});

test('drills cover a good share of the phoneme family', () => {
  const phonemeCount = skillsByFamily('phoneme').length;
  assert.ok(phonemeDrills.length >= 10, `only ${phonemeDrills.length} drills`);
  assert.ok(phonemeDrills.length <= phonemeCount, 'more drills than phoneme skills');
});

test('getPhonemeDrill looks up by skill id', () => {
  assert.equal(getPhonemeDrill('ph.v_w_distinction')?.label, 'V vs W');
  assert.equal(getPhonemeDrill('nope'), undefined);
});
