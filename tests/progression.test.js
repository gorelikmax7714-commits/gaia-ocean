import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  REGIONS, starsForResult, totalStars, isRegionUnlocked,
  isLevelUnlocked, recordLevelResult, updateStreak,
} from '../js/engine/progression.js';

test('starsForResult thresholds', () => {
  assert.equal(starsForResult({ correct: 10, total: 10 }), 3);
  assert.equal(starsForResult({ correct: 7, total: 10 }), 2);
  assert.equal(starsForResult({ correct: 3, total: 10 }), 1);
});

test('region unlock by total stars', () => {
  const progress = { times: { 0: { stars: 3, attempts: 1 }, 1: { stars: 3, attempts: 2 } } };
  assert.equal(totalStars(progress), 6);
  assert.equal(isRegionUnlocked(progress, 'sounds'), true);
  assert.equal(isRegionUnlocked(progress, 'words'), true);   // needs 6
  assert.equal(isRegionUnlocked(progress, 'vertical'), false); // needs 10
});

test('levels unlock sequentially', () => {
  const progress = { times: { 0: { stars: 1, attempts: 1 } } };
  assert.equal(isLevelUnlocked(progress, 'times', 0), true);
  assert.equal(isLevelUnlocked(progress, 'times', 1), true);
  assert.equal(isLevelUnlocked(progress, 'times', 2), false);
});

test('recordLevelResult keeps best stars and is immutable', () => {
  const before = { times: { 0: { stars: 3, attempts: 1 } } };
  const after = recordLevelResult(before, 'times', 0, 2);
  assert.equal(after.times[0].stars, 3);
  assert.equal(after.times[0].attempts, 2);
  assert.equal(before.times[0].attempts, 1);
  assert.notEqual(after, before);
});

test('updateStreak: same-day, consecutive, gap, best', () => {
  const s0 = { current: 0, best: 0, lastPracticeDate: null };
  const s1 = updateStreak(s0, '2026-07-25');
  assert.deepEqual(s1, { current: 1, best: 1, lastPracticeDate: '2026-07-25' });
  assert.deepEqual(updateStreak(s1, '2026-07-25'), s1);
  const s2 = updateStreak(s1, '2026-07-26');
  assert.equal(s2.current, 2);
  const s3 = updateStreak(s2, '2026-07-30');
  assert.equal(s3.current, 1);
  assert.equal(s3.best, 2);
});
