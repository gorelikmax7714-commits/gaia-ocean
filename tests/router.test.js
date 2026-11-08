import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoute } from '../js/app.js';

test('no profile always routes to onboarding', () => {
  assert.deepEqual(resolveRoute('#map', false), { screen: 'onboarding', params: {} });
});

test('empty hash with profile routes to lagoon', () => {
  assert.deepEqual(resolveRoute('', true), { screen: 'lagoon', params: {} });
});

test('practice route carries topic and level params', () => {
  assert.deepEqual(resolveRoute('#practice/order/2', true), {
    screen: 'practice',
    params: { topic: 'order', level: 2 },
  });
});

test('review and lesson routes', () => {
  assert.deepEqual(resolveRoute('#practice/review', true), { screen: 'practice', params: { topic: 'review', level: 0 } });
  assert.deepEqual(resolveRoute('#lesson/perimeter', true), { screen: 'lesson', params: { topic: 'perimeter' } });
});

test('unknown hash falls back to lagoon', () => {
  assert.deepEqual(resolveRoute('#nope', true), { screen: 'lagoon', params: {} });
});
