export const REGIONS = [
  { id: 'sounds', he: 'מפרץ הצלילים', emoji: '🐚', unlockStars: 0, levels: 8 },
  { id: 'times', he: 'שונית הכפל', emoji: '🪸', unlockStars: 0, levels: 10 },
  { id: 'words', he: 'אי המילים', emoji: '🏝️', unlockStars: 6, levels: 8 },
  { id: 'vertical', he: 'מערת החיבור', emoji: '🐙', unlockStars: 10, levels: 8 },
];

export function starsForResult({ correct, total }) {
  if (correct === total) return 3;
  if (correct / total >= 0.7) return 2;
  return 1;
}

export function totalStars(progress) {
  return Object.values(progress).reduce(
    (sum, region) => sum + Object.values(region).reduce((s, l) => s + l.stars, 0),
    0,
  );
}

export function isRegionUnlocked(progress, regionId) {
  const region = REGIONS.find((r) => r.id === regionId);
  return Boolean(region) && totalStars(progress) >= region.unlockStars;
}

export function isLevelUnlocked(progress, regionId, levelIndex) {
  if (!isRegionUnlocked(progress, regionId)) return false;
  if (levelIndex === 0) return true;
  return (progress[regionId]?.[levelIndex - 1]?.stars ?? 0) >= 1;
}

export function recordLevelResult(progress, regionId, levelIndex, stars) {
  const prev = progress[regionId]?.[levelIndex] ?? { stars: 0, attempts: 0 };
  return {
    ...progress,
    [regionId]: {
      ...(progress[regionId] ?? {}),
      [levelIndex]: { stars: Math.max(prev.stars, stars), attempts: prev.attempts + 1 },
    },
  };
}

const dayAfter = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return next.toISOString().slice(0, 10);
};

export function updateStreak(streak, todayISO) {
  if (streak.lastPracticeDate === todayISO) return streak;
  const current = streak.lastPracticeDate && dayAfter(streak.lastPracticeDate) === todayISO
    ? streak.current + 1
    : 1;
  return { current, best: Math.max(streak.best, current), lastPracticeDate: todayISO };
}
