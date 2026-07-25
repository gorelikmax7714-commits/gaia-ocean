import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyAnswer, finishLevel } from '../js/screens/game.js';
import { defaultState } from '../js/storage.js';

test('applyAnswer advances and tracks wrong keys once', () => {
  const s0 = { index: 0, correct: 0, wrongKeys: [] };
  const s1 = applyAnswer(s0, true, 'mul:2x3');
  assert.deepEqual(s1, { index: 1, correct: 1, wrongKeys: [] });
  const s2 = applyAnswer(s1, false, 'mul:2x4');
  assert.deepEqual(s2.wrongKeys, ['mul:2x4']);
  assert.equal(s2.correct, 1);
  assert.deepEqual(s0.wrongKeys, []); // immutable
});

test('finishLevel updates progress, wallet, streak, mistakes, queue', () => {
  const state = { ...defaultState(), profile: { name: 'גאיה', pin: '1111', petName: 'קסם', petColor: 'pink' } };
  const next = finishLevel(state, {
    regionId: 'times', levelIndex: 0, correct: 10, total: 10,
    wrongKeys: [], todayISO: '2026-07-25',
  });
  assert.equal(next.progress.times[0].stars, 3);
  assert.equal(next.wallet.stars, 3);
  assert.equal(next.streak.current, 1);
  assert.equal(next.lastReward.stars, 3);
  assert.equal(next.syncQueue.length, 1);
  assert.equal(state.wallet.stars, 0); // immutable
});

test('finishLevel records mistakes for wrong keys', () => {
  const state = { ...defaultState(), profile: { name: 'גאיה', pin: '1111', petName: 'קסם', petColor: 'pink' } };
  const next = finishLevel(state, {
    regionId: 'times', levelIndex: 0, correct: 7, total: 10,
    wrongKeys: ['mul:7x8', 'mul:6x9'], todayISO: '2026-07-25',
  });
  assert.equal(next.mistakes.length, 2);
  assert.equal(next.progress.times[0].stars, 2);
});
