import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildLevel, exerciseFromKey } from '../js/levels.js';
import { REGIONS } from '../js/engine/progression.js';

const content = JSON.parse(await readFile(new URL('../data/english.json', import.meta.url), 'utf8'));
const lcg = (seed) => () => {
  seed = (seed * 48271) % 2147483647;
  return seed / 2147483647;
};

test('every region/level builds 10 exercises with kind and srsKey', () => {
  for (const region of REGIONS) {
    for (let level = 0; level < region.levels; level++) {
      const exercises = buildLevel(region.id, level, content, lcg(level + 1));
      assert.equal(exercises.length, 10, `${region.id}/${level}`);
      for (const ex of exercises) {
        assert.ok(ex.kind, `${region.id}/${level} missing kind`);
        assert.ok(ex.srsKey, `${region.id}/${level} missing srsKey`);
      }
    }
  }
});

test('times level 0 drills only table 2', () => {
  const exercises = buildLevel('times', 0, content, lcg(5));
  for (const ex of exercises) {
    assert.match(ex.srsKey, /^mul:2x\d+$/);
  }
});

test('wordbuild letters contain the whole word plus a distractor', () => {
  const exercises = buildLevel('words', 0, content, lcg(3));
  const wb = exercises.find((e) => e.kind === 'wordbuild');
  assert.ok(wb);
  assert.equal(wb.letters.length, wb.word.length + 1);
  for (const ch of wb.word) assert.ok(wb.letters.includes(ch));
});

test('listen options always include the answer', () => {
  const exercises = buildLevel('sounds', 0, content, lcg(9));
  for (const ex of exercises.filter((e) => e.kind === 'listen')) {
    assert.ok(ex.options.includes(ex.answer));
    assert.equal(ex.options.length, 4);
  }
});

test('exerciseFromKey reconstructs every key type', () => {
  const rng = lcg(11);
  const mul = exerciseFromKey('mul:7x8', content, rng);
  assert.equal(mul.answer, 56);
  assert.ok(mul.choices.includes(56));
  const vert = exerciseFromKey('vert:345-278', content, rng);
  assert.equal(vert.answer, 67);
  assert.equal(exerciseFromKey('phonics:S', content, rng).answer, 'S');
  assert.equal(exerciseFromKey('cvc:cat', content, rng).word, 'cat');
  assert.equal(exerciseFromKey('cvc:zzz', content, rng), null);
});
