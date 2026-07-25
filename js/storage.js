const KEY = 'gaya-state';

export function defaultState() {
  return {
    profile: null,
    pet: { lastFed: null },
    wallet: { stars: 0 },
    streak: { current: 0, best: 0, lastPracticeDate: null },
    progress: {},
    mistakes: [],
    syncQueue: [],
  };
}

export function loadState(storage) {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base,
      ...saved,
      pet: { ...base.pet, ...saved.pet },
      wallet: { ...base.wallet, ...saved.wallet },
      streak: { ...base.streak, ...saved.streak },
    };
  } catch {
    return defaultState();
  }
}

export function saveState(storage, state) {
  try {
    storage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function localDateISO(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
