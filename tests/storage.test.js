import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, loadState, saveState, localDateISO } from '../js/storage.js';

const fakeStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
  };
};

test('loadState returns defaults on empty storage', () => {
  const s = loadState(fakeStorage());
  assert.equal(s.profile, null);
  assert.deepEqual(s.wallet, { stars: 0 });
  assert.deepEqual(s.syncQueue, []);
});

test('loadState survives corrupt JSON', () => {
  const s = loadState(fakeStorage({ 'gaya-state': '{oops' }));
  assert.deepEqual(s, defaultState());
});

test('save then load round-trips and merges over defaults', () => {
  const storage = fakeStorage();
  const state = { ...defaultState(), wallet: { stars: 9 } };
  assert.equal(saveState(storage, state), true);
  const loaded = loadState(storage);
  assert.equal(loaded.wallet.stars, 9);
  assert.deepEqual(loaded.streak, defaultState().streak); // untouched fields intact
});

test('saveState returns false when storage throws', () => {
  const broken = { setItem: () => { throw new Error('quota'); } };
  assert.equal(saveState(broken, defaultState()), false);
});

test('localDateISO uses local time', () => {
  assert.equal(localDateISO(new Date(2026, 6, 25, 23, 30)), '2026-07-25');
  assert.equal(localDateISO(new Date(2026, 0, 5, 0, 10)), '2026-01-05');
});
