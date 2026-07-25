import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoute } from '../js/app.js';

test('no profile always routes to onboarding', () => {
  assert.deepEqual(resolveRoute('#map', false), { screen: 'onboarding', params: {} });
});

test('empty hash with profile routes to lagoon', () => {
  assert.deepEqual(resolveRoute('', true), { screen: 'lagoon', params: {} });
});

test('game route carries region and level params', () => {
  assert.deepEqual(resolveRoute('#game/times/2', true), {
    screen: 'game',
    params: { region: 'times', level: 2 },
  });
});

test('unknown hash falls back to lagoon', () => {
  assert.deepEqual(resolveRoute('#nope', true), { screen: 'lagoon', params: {} });
});
