import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STAGES, petStage, petMood, feedPet, FEED_COST } from '../js/engine/pet.js';

test('petStage picks highest reached stage', () => {
  assert.equal(petStage(0).id, 'egg');
  assert.equal(petStage(1).id, 'baby');
  assert.equal(petStage(24).id, 'baby');
  assert.equal(petStage(25).id, 'child');
  assert.equal(petStage(200).id, 'royal');
});

test('petMood by days since practice', () => {
  assert.equal(petMood('2026-07-25', '2026-07-25'), 'happy');
  assert.equal(petMood('2026-07-24', '2026-07-25'), 'happy');
  assert.equal(petMood('2026-07-23', '2026-07-25'), 'ok');
  assert.equal(petMood('2026-07-20', '2026-07-25'), 'sad');
  assert.equal(petMood(null, '2026-07-25'), 'sad');
});

test('feedPet spends stars once per day, immutably', () => {
  const wallet = { stars: 5 };
  const pet = { lastFed: null };
  const fed = feedPet(wallet, pet, '2026-07-25');
  assert.equal(fed.wallet.stars, 5 - FEED_COST);
  assert.equal(fed.pet.lastFed, '2026-07-25');
  assert.equal(wallet.stars, 5); // immutable
  assert.equal(feedPet(fed.wallet, fed.pet, '2026-07-25'), null); // already fed
  assert.equal(feedPet({ stars: 1 }, pet, '2026-07-25'), null);   // too poor
});
