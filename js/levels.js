import {
  mulExercise, mulMissingExercise, verticalExercise, shuffle, mulPair,
} from './engine/exercises/math.js';
import { phonicsItems, cvcWords, vocab } from './engine/content.js';
import { EXERCISES_PER_LEVEL } from './config.js';

const TIMES_LEVELS = [
  [2], [5], [10], [2, 5, 10], [3], [4], [3, 4], [6, 7], [8, 9],
  [2, 3, 4, 5, 6, 7, 8, 9],
];
const VERTICAL_LEVELS = [
  { digits: 2, op: '+' }, { digits: 2, op: '-' },
  { digits: 3, op: '+' }, { digits: 3, op: '-' }, { digits: 3, op: 'mixed' },
  { digits: 4, op: '+' }, { digits: 4, op: '-' }, { digits: 4, op: 'mixed' },
];
const PHONICS_ORDER = 'SATPINMDGOCKEURHBFLJVWXYZQ'.split('');
const WORDS_LEVELS = ['a', 'o', 'u', 'e', 'i', 'mixed', 'sea', 'colors'];

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

function timesLevel(levelIndex, rng) {
  const tables = TIMES_LEVELS[levelIndex];
  const useMissing = levelIndex >= 8;
  return Array.from({ length: EXERCISES_PER_LEVEL }, (_, i) => {
    const gen = useMissing && i % 3 === 2 ? mulMissingExercise : mulExercise;
    const ex = gen({ tables }, rng);
    const [a, b] = ex.question.includes('?')
      ? [Number(ex.question.match(/× (\d+)/)[1]), ex.answer]
      : ex.question.split(' × ').map(Number);
    return { ...ex, srsKey: `mul:${a}x${b}` };
  });
}

function verticalLevel(levelIndex, rng) {
  const cfg = VERTICAL_LEVELS[levelIndex];
  return Array.from({ length: EXERCISES_PER_LEVEL }, () => {
    const op = cfg.op === 'mixed' ? (rng() < 0.5 ? '+' : '-') : cfg.op;
    const ex = verticalExercise({ digits: cfg.digits, op }, rng);
    return { ...ex, srsKey: `vert:${ex.a}${ex.op}${ex.b}` };
  });
}

function listenExercise(item, pool, rng) {
  const wrong = shuffle(pool.filter((p) => p.letter !== item.letter), rng).slice(0, 3);
  return {
    kind: 'listen',
    say: item.sound,
    prompt: 'איזו אות עושה את הצליל?',
    options: shuffle([item.letter, ...wrong.map((w) => w.letter)], rng),
    answer: item.letter,
    srsKey: `phonics:${item.letter}`,
  };
}

function matchExercise(item, pool, rng, srsPrefix) {
  const wrong = shuffle(pool.filter((p) => p.word !== item.word), rng).slice(0, 3);
  return {
    kind: 'match',
    word: item.word,
    emoji: item.emoji,
    he: item.he,
    options: shuffle([item, ...wrong], rng).map(({ word, emoji }) => ({ word, emoji })),
    srsKey: `${srsPrefix}:${item.word}`,
  };
}

function wordbuildExercise(item, rng) {
  const distractor = pick('bcdfghjklmnprstw'.split('').filter((c) => !item.word.includes(c)), rng);
  return {
    kind: 'wordbuild',
    word: item.word,
    he: item.he,
    emoji: item.emoji,
    letters: shuffle([...item.word, distractor], rng),
    srsKey: `cvc:${item.word}`,
  };
}

function soundsLevel(levelIndex, content, rng) {
  const total = PHONICS_ORDER.length;
  const startIdx = Math.floor(levelIndex * total / 8);
  const endIdx = Math.floor((levelIndex + 1) * total / 8);
  const letters = PHONICS_ORDER.slice(startIdx, endIdx);
  const all = phonicsItems(content);
  const items = all.filter((p) => letters.includes(p.letter));
  return Array.from({ length: EXERCISES_PER_LEVEL }, (_, i) => {
    const item = items[i % items.length];
    return i % 2 === 0
      ? listenExercise(item, all, rng)
      : { ...matchExercise(item, all, rng, 'phonics'), srsKey: `phonics:${item.letter}` };
  });
}

function wordsLevel(levelIndex, content, rng) {
  const group = WORDS_LEVELS[levelIndex];
  const vowels = ['a', 'o', 'u', 'e', 'i'];
  const items = group === 'mixed'
    ? vowels.flatMap((v) => cvcWords(content, v))
    : vowels.includes(group) ? cvcWords(content, group) : vocab(content, group);
  const srsPrefix = vowels.includes(group) || group === 'mixed' ? 'cvc' : 'vocab';
  return Array.from({ length: EXERCISES_PER_LEVEL }, (_, i) => {
    const item = items[i % items.length];
    if (srsPrefix === 'vocab' || i % 2 === 1) return matchExercise(item, items, rng, srsPrefix);
    return wordbuildExercise(item, rng);
  });
}

export function buildLevel(regionId, levelIndex, content, rng) {
  if (regionId === 'times') return timesLevel(levelIndex, rng);
  if (regionId === 'vertical') return verticalLevel(levelIndex, rng);
  if (regionId === 'sounds') return soundsLevel(levelIndex, content, rng);
  if (regionId === 'words') return wordsLevel(levelIndex, content, rng);
  throw new Error(`unknown region: ${regionId}`);
}

export function exerciseFromKey(key, content, rng) {
  const [prefix, value] = key.split(':');
  if (prefix === 'mul') {
    const [a, b] = value.split('x').map(Number);
    return { ...mulPair(a, b, rng), srsKey: key };
  }
  if (prefix === 'vert') {
    const m = value.match(/^(\d+)([+-])(\d+)$/);
    if (!m) return null;
    const a = Number(m[1]);
    const b = Number(m[3]);
    const op = m[2];
    return { kind: 'vertical', a, b, op, answer: op === '+' ? a + b : a - b, srsKey: key };
  }
  if (prefix === 'phonics') {
    const pool = phonicsItems(content);
    const item = pool.find((p) => p.letter === value);
    return item ? listenExercise(item, pool, rng) : null;
  }
  if (prefix === 'cvc' || prefix === 'vocab') {
    const groups = prefix === 'cvc' ? Object.values(content.cvc) : Object.values(content.vocab);
    for (const group of groups) {
      const item = group.find((w) => w.word === value);
      if (item) {
        return prefix === 'cvc' ? wordbuildExercise(item, rng) : matchExercise(item, group, rng, prefix);
      }
    }
    return null;
  }
  return null;
}
