import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordMistake, recordSuccess, dueMistakes } from '../js/engine/srs.js';

test('mistake lifecycle: record → due → 2 successes → removed', () => {
  const m0 = [];
  const m1 = recordMistake(m0, 'mul:7x8', '2026-07-25');
  assert.equal(m0.length, 0); // immutable
  assert.deepEqual(dueMistakes(m1, '2026-07-25'), ['mul:7x8']);

  const m2 = recordSuccess(m1, 'mul:7x8', '2026-07-25');
  assert.deepEqual(dueMistakes(m2, '2026-07-25'), []); // pushed to tomorrow
  assert.deepEqual(dueMistakes(m2, '2026-07-26'), ['mul:7x8']);

  const m3 = recordSuccess(m2, 'mul:7x8', '2026-07-26');
  assert.equal(m3.length, 0); // 2 consecutive successes → gone
});

test('a new mistake on a tracked key resets its success streak', () => {
  let m = recordMistake([], 'cvc:cat', '2026-07-25');
  m = recordSuccess(m, 'cvc:cat', '2026-07-25');
  m = recordMistake(m, 'cvc:cat', '2026-07-26');
  m = recordSuccess(m, 'cvc:cat', '2026-07-26');
  assert.equal(m.length, 1); // streak was reset, so still tracked
});

test('recordSuccess on untracked key is a no-op', () => {
  assert.deepEqual(recordSuccess([], 'mul:2x2', '2026-07-25'), []);
});
