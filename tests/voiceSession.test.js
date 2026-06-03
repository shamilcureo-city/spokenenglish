import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createVoiceSessionStatus,
  getSpeechRecognitionConstructor,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from '../src/services/voiceSession.js';

test('detects speech recognition constructors from browser runtimes', () => {
  function MockRecognition() {}
  const runtime = { webkitSpeechRecognition: MockRecognition };

  assert.equal(getSpeechRecognitionConstructor(runtime), MockRecognition);
  assert.equal(isSpeechRecognitionSupported(runtime), true);
});

test('reports typed fallback when voice APIs are unavailable', () => {
  const status = createVoiceSessionStatus({});

  assert.equal(status.speechRecognition, false);
  assert.equal(status.speechSynthesis, false);
  assert.equal(status.recommendedFallback, 'typed-practice');
});

test('detects speech synthesis support', () => {
  const runtime = {
    speechSynthesis: { speak() {}, cancel() {} },
    SpeechSynthesisUtterance: function Utterance() {},
  };

  assert.equal(isSpeechSynthesisSupported(runtime), true);
});
