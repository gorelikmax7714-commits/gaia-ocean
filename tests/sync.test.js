import { test } from 'node:test';
import assert from 'node:assert/strict';
import { enqueue, flush } from '../js/sync.js';
import { defaultState } from '../js/storage.js';

const event = { type: 'session', date: '2026-07-25', region: 'order', level: 0, correct: 9, total: 10, stars: 2, wrongKeys: ['order:0:1'] };

test('enqueue appends immutably', () => {
  const s0 = defaultState();
  const s1 = enqueue(s0, event);
  assert.equal(s1.syncQueue.length, 1);
  assert.equal(s0.syncQueue.length, 0);
});

test('flush sends batch and empties queue on success', async () => {
  const posted = [];
  const res = await flush([event, event], async (events) => { posted.push(events); return true; });
  assert.equal(res.sent, 2);
  assert.deepEqual(res.remaining, []);
  assert.equal(posted[0].length, 2);
});

test('flush keeps queue when post fails or throws', async () => {
  const failed = await flush([event], async () => false);
  assert.equal(failed.sent, 0);
  assert.equal(failed.remaining.length, 1);
  const threw = await flush([event], async () => { throw new Error('offline'); });
  assert.equal(threw.remaining.length, 1);
});

test('flush of empty queue is a no-op without posting', async () => {
  let called = false;
  const res = await flush([], async () => { called = true; return true; });
  assert.equal(called, false);
  assert.deepEqual(res, { sent: 0, remaining: [] });
});
