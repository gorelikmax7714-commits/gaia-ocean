import { TOPICS } from './topics.js';

// Every math topic is open from day one (remedial practice — Gaia picks freely);
// inside a topic, levels unlock one after another.
export const REGIONS = TOPICS.map((t) => ({ id: t.id, he: t.he, emoji: t.emoji, unlockStars: 0, levels: 3 }));

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

export const topicStars = (progress, topicId) => Object.values(progress[topicId] ?? {})
  .reduce((sum, l) => sum + (l.stars ?? 0), 0);
