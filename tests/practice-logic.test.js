import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyAnswer, finishLevel, buildSession } from '../js/screens/practice.js';
import { defaultState } from '../js/storage.js';
import { recordMistake } from '../js/engine/srs.js';

const profile = { name: 'גאיה', pin: '1111', petName: 'קסם', petColor: 'pink' };

test('applyAnswer advances and tracks wrong keys once', () => {
  const s0 = { index: 0, correct: 0, wrongKeys: [], guided: 0 };
  const s1 = applyAnswer(s0, true, 'order:0:1');
  assert.equal(s1.index, 1);
  assert.equal(s1.correct, 1);
  const s2 = applyAnswer(s1, false, 'order:0:2');
  assert.deepEqual(s2.wrongKeys, ['order:0:2']);
  assert.deepEqual(s0.wrongKeys, []);
});

test('finishLevel updates progress, wallet, streak, mistakes, queue', () => {
  const state = { ...defaultState(), profile };
  const next = finishLevel(state, {
    regionId: 'perimeter', levelIndex: 0, correct: 6, total: 6, wrongKeys: [], todayISO: '2026-11-08',
  });
  assert.equal(next.progress.perimeter[0].stars, 3);
  assert.equal(next.wallet.stars, 3);
  assert.equal(next.streak.current, 1);
  assert.equal(next.syncQueue[0].region, 'perimeter');
  assert.equal(state.wallet.stars, 0);
});

test('review sessions do not touch level progress', () => {
  const state = { ...defaultState(), profile };
  const next = finishLevel(state, {
    regionId: 'review', levelIndex: 0, correct: 2, total: 3, wrongKeys: ['bars:0:5'], todayISO: '2026-11-08',
  });
  assert.deepEqual(next.progress, {});
  assert.equal(next.mistakes.length, 1);
});

test('buildSession: 6 exercises, replays due mistakes of the same topic', () => {
  let seed = 100;
  const mistakes = recordMistake(recordMistake([], 'order:1:77', '2026-11-01'), 'bars:0:5', '2026-11-01');
  const ses = buildSession('order', 0, mistakes, '2026-11-08', () => seed++);
  assert.equal(ses.length, 6);
  assert.equal(ses.filter((e) => e.srsKey === 'order:1:77').length, 1);
  assert.ok(ses.every((e) => e.topic === 'order'));
  const review = buildSession('review', 0, mistakes, '2026-11-08');
  assert.equal(review.length, 2);
});
