import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateContent, phonicsItems, cvcWords, vocab } from '../js/engine/content.js';

const json = JSON.parse(await readFile(new URL('../data/english.json', import.meta.url), 'utf8'));

test('bundled english.json is valid', () => {
  const res = validateContent(json);
  assert.deepEqual(res.errors, []);
  assert.equal(res.ok, true);
});

test('validator rejects item missing emoji', () => {
  const bad = { ...json, phonics: [{ letter: 'S', sound: 's', word: 'sun', he: 'שמש' }] };
  const res = validateContent(bad);
  assert.equal(res.ok, false);
  assert.match(res.errors[0], /phonics\[0\]/);
});

test('validator rejects empty letter or sound', () => {
  const bad = { ...json, phonics: [{ letter: '', sound: '', word: 'sun', he: 'שמש', emoji: '☀️' }] };
  const res = validateContent(bad);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some((e) => e.includes('letter')));
  assert.ok(res.errors.some((e) => e.includes('sound')));
});

test('selectors return expected shapes', () => {
  assert.ok(phonicsItems(json).length >= 20);
  assert.ok(cvcWords(json, 'a').every((w) => w.word.includes('a')));
  assert.ok(vocab(json, 'sea').length >= 8);
});
