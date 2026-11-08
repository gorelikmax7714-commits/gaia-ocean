import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  REGIONS, starsForResult, totalStars, isRegionUnlocked,
  isLevelUnlocked, recordLevelResult, updateStreak, topicStars,
} from '../js/engine/progression.js';

test('starsForResult thresholds', () => {
  assert.equal(starsForResult({ correct: 10, total: 10 }), 3);
  assert.equal(starsForResult({ correct: 7, total: 10 }), 2);
  assert.equal(starsForResult({ correct: 3, total: 10 }), 1);
});

test('all math topics are open; unknown ones are not', () => {
  const progress = { order: { 0: { stars: 3, attempts: 1 }, 1: { stars: 3, attempts: 2 } } };
  assert.equal(totalStars(progress), 6);
  assert.equal(topicStars(progress, 'order'), 6);
  assert.equal(topicStars(progress, 'bars'), 0);
  for (const r of REGIONS) assert.equal(isRegionUnlocked({}, r.id), true);
  assert.equal(isRegionUnlocked({}, 'sounds'), false);
  assert.equal(REGIONS.length, 9);
});

test('levels unlock sequentially', () => {
  const progress = { order: { 0: { stars: 1, attempts: 1 } } };
  assert.equal(isLevelUnlocked(progress, 'order', 0), true);
  assert.equal(isLevelUnlocked(progress, 'order', 1), true);
  assert.equal(isLevelUnlocked(progress, 'order', 2), false);
});

test('recordLevelResult keeps best stars and is immutable', () => {
  const before = { order: { 0: { stars: 3, attempts: 1 } } };
  const after = recordLevelResult(before, 'order', 0, 2);
  assert.equal(after.order[0].stars, 3);
  assert.equal(after.order[0].attempts, 2);
  assert.equal(before.order[0].attempts, 1);
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
