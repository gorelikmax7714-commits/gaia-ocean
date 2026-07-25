export const STAGES = [
  { id: 'egg', he: 'ביצה', minStars: 0 },
  { id: 'baby', he: 'תינוק', minStars: 1 },
  { id: 'child', he: 'ילדות', minStars: 25 },
  { id: 'royal', he: 'מלכותי', minStars: 70 },
];

export const FEED_COST = 2;

export function petStage(lifetimeStars) {
  return [...STAGES].reverse().find((s) => lifetimeStars >= s.minStars);
}

const daysBetween = (fromISO, toISO) => {
  const toUTC = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUTC(toISO) - toUTC(fromISO)) / 86400000);
};

export function petMood(lastPracticeDate, todayISO) {
  if (!lastPracticeDate) return 'sad';
  const days = daysBetween(lastPracticeDate, todayISO);
  if (days <= 1) return 'happy';
  if (days === 2) return 'ok';
  return 'sad';
}

export function feedPet(wallet, pet, todayISO) {
  if (wallet.stars < FEED_COST || pet.lastFed === todayISO) return null;
  return {
    wallet: { ...wallet, stars: wallet.stars - FEED_COST },
    pet: { ...pet, lastFed: todayISO },
  };
}
