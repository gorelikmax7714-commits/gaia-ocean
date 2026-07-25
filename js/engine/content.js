const ITEM_KEYS = ['word', 'he', 'emoji'];

function checkItem(item, path, errors) {
  for (const key of ITEM_KEYS) {
    if (typeof item[key] !== 'string' || item[key].length === 0) {
      errors.push(`${path}: missing or empty "${key}"`);
    }
  }
}

export function validateContent(json) {
  const errors = [];
  if (!Array.isArray(json.phonics)) errors.push('phonics: must be an array');
  else json.phonics.forEach((p, i) => {
    if (typeof p.letter !== 'string' || p.letter.length === 0) errors.push(`phonics[${i}]: missing "letter"`);
    if (typeof p.sound !== 'string' || p.sound.length === 0) errors.push(`phonics[${i}]: missing "sound"`);
    checkItem(p, `phonics[${i}]`, errors);
  });
  for (const section of ['cvc', 'vocab']) {
    if (typeof json[section] !== 'object' || json[section] === null) {
      errors.push(`${section}: must be an object`);
      continue;
    }
    for (const [group, items] of Object.entries(json[section])) {
      if (!Array.isArray(items)) { errors.push(`${section}.${group}: must be an array`); continue; }
      items.forEach((item, i) => checkItem(item, `${section}.${group}[${i}]`, errors));
    }
  }
  return { ok: errors.length === 0, errors };
}

export const phonicsItems = (json) => json.phonics;
export const cvcWords = (json, group) => json.cvc[group] ?? [];
export const vocab = (json, topic) => json.vocab[topic] ?? [];
