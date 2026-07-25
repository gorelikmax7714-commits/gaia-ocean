// Pure exercise generators. rng: () => number in [0,1), injected by caller.

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
const int = (min, max, rng) => min + Math.floor(rng() * (max - min + 1));

export function shuffle(arr, rng) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function withChoices(ex, rng) {
  const choices = new Set([ex.answer]);
  let guard = 0;
  while (choices.size < 4 && guard < 100) {
    guard += 1;
    const delta = int(1, 10, rng) * (rng() < 0.5 ? -1 : 1);
    const candidate = ex.answer + delta;
    if (candidate >= 0) choices.add(candidate);
  }
  return { ...ex, choices: shuffle([...choices], rng) };
}

export function mulExercise({ tables }, rng) {
  const a = pick(tables, rng);
  const b = int(1, 10, rng);
  return withChoices({ kind: 'bubbles', question: `${a} × ${b}`, answer: a * b }, rng);
}

export function mulMissingExercise({ tables }, rng) {
  const a = pick(tables, rng);
  const b = int(1, 10, rng);
  return withChoices({ kind: 'bubbles', question: `? × ${a} = ${a * b}`, answer: b }, rng);
}

export function mulPair(a, b, rng) {
  return withChoices({ kind: 'bubbles', question: `${a} × ${b}`, answer: a * b }, rng);
}

export function verticalExercise({ digits, op }, rng) {
  const max = 10 ** digits - 1;
  let a = int(10, max, rng);
  let b = int(10, max, rng);
  if (op === '-' && b > a) [a, b] = [b, a];
  return { kind: 'vertical', a, b, op, answer: op === '+' ? a + b : a - b };
}
