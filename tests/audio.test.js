import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canSpeak, speak } from '../js/audio.js';

test('canSpeak false when synth missing or broken', () => {
  assert.equal(canSpeak(undefined), false);
  assert.equal(canSpeak({}), false);
  assert.equal(canSpeak({ speak: () => {} }), true);
});

test('speak returns false instead of throwing without synth', () => {
  assert.equal(speak(undefined, 'cat'), false);
});

test('speak calls synth.speak with an utterance-like payload', () => {
  const calls = [];
  const fakeSynth = { speak: (u) => calls.push(u), cancel: () => {} };
  const ok = speak(fakeSynth, 'cat', 'en-US', (text) => ({ text, lang: '' }));
  assert.equal(ok, true);
  assert.equal(calls[0].text, 'cat');
  assert.equal(calls[0].lang, 'en-US');
});
