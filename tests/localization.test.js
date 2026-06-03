import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getCodeMixedExample,
  getLanguageProfile,
  getLocalizedCopy,
  getLocalizedScenarioPrompt,
  scenarioLibrary,
} from '../src/domain/localization.js';

test('returns language profile and localized copy with Hindi fallback', () => {
  assert.equal(getLanguageProfile('Tamil').nativeName, 'தமிழ்');
  assert.equal(getLanguageProfile('Unknown').nativeName, 'हिन्दी');
  assert.match(getLocalizedCopy('appPromise', 'Telugu'), /30/);
});

test('contains India-first scenario prompts and code-mixed examples', () => {
  const scenario = scenarioLibrary.find((item) => item.id === 'customer-call');
  assert.ok(scenario);
  assert.match(getLocalizedScenarioPrompt(scenario, 'Kannada'), /customer/i);
  assert.match(getCodeMixedExample('Hindi'), /Mujhe/);
});
