const dayAfter = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
};

export function recordMistake(mistakes, key, todayISO) {
  const rest = mistakes.filter((m) => m.key !== key);
  return [...rest, { key, correctStreak: 0, dueDate: todayISO }];
}

export function recordSuccess(mistakes, key, todayISO) {
  const entry = mistakes.find((m) => m.key === key);
  if (!entry) return mistakes;
  const rest = mistakes.filter((m) => m.key !== key);
  if (entry.correctStreak + 1 >= 2) return rest;
  return [...rest, { ...entry, correctStreak: entry.correctStreak + 1, dueDate: dayAfter(todayISO) }];
}

export function dueMistakes(mistakes, todayISO) {
  return mistakes.filter((m) => m.dueDate <= todayISO).map((m) => m.key);
}
