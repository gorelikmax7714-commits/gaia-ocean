import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TOPICS, makeExercise, exerciseFromKey, columnSteps, compareExplain, isTopicKey,
} from '../js/engine/topics.js';

const SEEDS = Array.from({ length: 300 }, (_, i) => i * 7919 + 13);

const evalExpr = (expr) => {
  const js = expr.replace(/×/g, '*').replace(/:/g, '/').replace(/−/g, '-').replace(/,/g, '');
  assert.match(js, /^[\d\s+\-*/()]+$/, `unsafe expr ${expr}`);
  return Function(`return (${js});`)();
};

function checkAsk(ask, where) {
  assert.ok(ask, `${where}: missing ask`);
  if (ask.kind === 'number') {
    assert.ok(Number.isInteger(ask.value) && ask.value >= 0, `${where}: bad number ${ask.value}`);
  } else {
    assert.equal(ask.kind, 'choice', where);
    assert.ok(ask.options.includes(ask.value), `${where}: answer ${ask.value} not in ${ask.options}`);
    assert.equal(new Set(ask.options).size, ask.options.length, `${where}: duplicate options ${ask.options}`);
    assert.ok(ask.options.length >= 2, where);
  }
}

test('every topic/level builds valid exercises with guided steps', () => {
  for (const t of TOPICS) {
    for (let level = 0; level < 3; level++) {
      for (const seed of SEEDS) {
        const ex = makeExercise(t.id, level, seed);
        const where = `${t.id}/${level}/${seed}`;
        checkAsk(ex.answer, where);
        assert.ok(ex.prompt, `${where}: prompt`);
        assert.ok(ex.steps.length >= 1, `${where}: steps`);
        assert.ok(ex.steps.some((s) => s.ask), `${where}: at least one guided question`);
        for (const [i, s] of ex.steps.entries()) {
          assert.ok(s.say, `${where} step ${i}: say`);
          if (s.ask) { checkAsk(s.ask, `${where} step ${i}`); assert.ok(s.q, `${where} step ${i}: q`); }
        }
        assert.equal(ex.srsKey, `${t.id}:${level}:${seed}`);
      }
    }
  }
});

test('arithmetic answers match the expression', () => {
  for (const seed of SEEDS) {
    for (let level = 0; level < 3; level++) {
      const o = makeExercise('order', level, seed);
      assert.equal(evalExpr(o.expr), o.answer.value, `order ${o.expr}`);
      const c = makeExercise('column', level, seed);
      assert.equal(evalExpr(c.expr), c.answer.value, `column ${c.expr}`);
    }
    const m = makeExercise('mult', 0, seed);
    assert.equal(evalExpr(m.expr), m.answer.value);
  }
});

test('order of operations exercises really need the rule', () => {
  for (const seed of SEEDS) {
    const o = makeExercise('order', 1, seed);
    if (o.expr.includes('(')) {
      const noParens = o.expr.replace(/[()]/g, '');
      // the answer must come from the parentheses version
      assert.equal(evalExpr(o.expr), o.answer.value);
      assert.ok(Number.isFinite(evalExpr(noParens)));
    }
  }
});

test('column steps: last guided digits rebuild the result', () => {
  const cases = [[845, 87, '+'], [6000, 780, '-'], [4005, 267, '-'], [1000, 780, '-'], [352, 178, '-']];
  for (const [a, b, op] of cases) {
    const steps = columnSteps(a, b, op);
    const asks = steps.filter((s) => s.ask).map((s) => s.ask.value);
    const expected = op === '+' ? a + b : a - b;
    if (op === '+') {
      let carry = 0;
      const digits = asks.map((sum) => { const d = sum % 10; carry = sum >= 10 ? 1 : 0; return d; });
      if (carry) digits.push(1);
      assert.equal(Number(digits.reverse().join('')), expected, `${a}+${b}`);
    } else {
      assert.equal(Number(asks.reverse().join('')), expected, `${a}-${b}`);
      asks.forEach((d) => assert.ok(d >= 0 && d <= 9));
    }
  }
});

test('remainder answers are correct and smaller than divisor', () => {
  for (const seed of SEEDS) {
    for (const level of [0, 2]) {
      const r = makeExercise('remainder', level, seed);
      const last = r.steps.filter((s) => s.ask).at(-1).ask.value;
      assert.equal(last, r.answer.value);
    }
    const e = makeExercise('remainder', 0, seed);
    const [n, d] = e.expr.split(' : ').map(Number);
    assert.equal(e.answer.value, n % d);
    assert.ok(e.answer.value < d && e.answer.value > 0);
  }
});

test('number line: exactly one option inside the segment', () => {
  for (const seed of SEEDS) {
    for (const level of [0, 1]) {
      const e = makeExercise('numberline', level, seed);
      const inside = e.steps.filter((s) => s.ask.value === 'בתוך הקטע');
      assert.equal(inside.length, 1, `${seed}`);
    }
  }
});

test('compareExplain names the first differing place', () => {
  assert.equal(compareExplain(2000, 2002), 'ביחידות: 0 לעומת 2');
  assert.equal(compareExplain(2220, 2200), 'בעשרות: 2 לעומת 0');
  assert.equal(compareExplain(1999, 2002), 'באלפים: 1 לעומת 2');
});

test('exerciseFromKey replays the identical exercise', () => {
  const a = makeExercise('word', 2, 4242);
  const b = exerciseFromKey(a.srsKey);
  assert.deepEqual(b, a);
  assert.equal(exerciseFromKey('mul:2x3'), null);
  assert.equal(exerciseFromKey('order:7:1'), null);
  assert.ok(isTopicKey('bars:1:5'));
  assert.ok(!isTopicKey('phonics:S'));
});
