import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activeDelta, IDLE_MS, MAX_TICK_MS } from '../js/usage.js';

test('counts time only when visible and recently touched', () => {
  const now = 1_000_000;
  assert.equal(activeDelta({ lastTick: now - 10_000, now, visible: true, lastInteraction: now - 5_000 }), 10_000);
  assert.equal(activeDelta({ lastTick: now - 10_000, now, visible: false, lastInteraction: now }), 0);
  assert.equal(activeDelta({ lastTick: now - 10_000, now, visible: true, lastInteraction: now - IDLE_MS - 1 }), 0);
  assert.equal(activeDelta({ lastTick: now - 600_000, now, visible: true, lastInteraction: now }), MAX_TICK_MS);
});
