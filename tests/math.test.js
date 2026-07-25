import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mulExercise, mulMissingExercise, mulPair, verticalExercise, shuffle,
} from '../js/engine/exercises/math.js';

// Deterministic LCG so tests are reproducible without Math.random.
const lcg = (seed) => () => {
  seed = (seed * 48271) % 2147483647;
  return seed / 2147483647;
};

test('mulExercise: factors from tables, correct answer among 4 unique choices', () => {
  const rng = lcg(42);
  for (let i = 0; i < 200; i++) {
    const ex = mulExercise({ tables: [3, 7] }, rng);
    const [a, b] = ex.question.split(' × ').map(Number);
    assert.ok([3, 7].includes(a));
    assert.ok(b >= 1 && b <= 10);
    assert.equal(ex.answer, a * b);
    assert.equal(ex.choices.length, 4);
    assert.equal(new Set(ex.choices).size, 4);
    assert.ok(ex.choices.includes(ex.answer));
    assert.ok(ex.choices.every((c) => c >= 0));
  }
});

test('mulMissingExercise: hidden factor is the answer', () => {
  const rng = lcg(7);
  for (let i = 0; i < 200; i++) {
    const ex = mulMissingExercise({ tables: [4] }, rng);
    const m = ex.question.match(/^\? × (\d+) = (\d+)$/);
    assert.ok(m, `bad question: ${ex.question}`);
    assert.equal(ex.answer * Number(m[1]), Number(m[2]));
    assert.ok(ex.choices.includes(ex.answer));
  }
});

test('verticalExercise: subtraction never goes negative, answers correct', () => {
  const rng = lcg(99);
  for (let i = 0; i < 200; i++) {
    const ex = verticalExercise({ digits: 3, op: '-' }, rng);
    assert.ok(ex.a >= ex.b);
    assert.equal(ex.answer, ex.a - ex.b);
    assert.ok(ex.a <= 999);
  }
  const add = verticalExercise({ digits: 4, op: '+' }, rng);
  assert.equal(add.answer, add.a + add.b);
});

test('shuffle returns new array with same members', () => {
  const rng = lcg(1);
  const src = [1, 2, 3, 4, 5];
  const out = shuffle(src, rng);
  assert.notEqual(out, src);
  assert.deepEqual([...out].sort(), [1, 2, 3, 4, 5]);
  assert.deepEqual(src, [1, 2, 3, 4, 5]); // immutability
});

test('mulPair builds the exact requested exercise', () => {
  const ex = mulPair(7, 8, lcg(2));
  assert.equal(ex.question, '7 × 8');
  assert.equal(ex.answer, 56);
  assert.ok(ex.choices.includes(56));
});

test('verticalExercise rejects digits < 2', () => {
  const rng = lcg(3);
  assert.throws(() => verticalExercise({ digits: 1, op: '+' }, rng), /digits must be >= 2/);
});
