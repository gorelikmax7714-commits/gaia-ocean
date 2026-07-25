import { navigate } from '../app.js';
import {
  REGIONS, isRegionUnlocked, isLevelUnlocked, totalStars,
} from '../engine/progression.js';

export function renderMap(root, ctx) {
  const { progress } = ctx.state;
  const stars = totalStars(progress);

  const regionCards = REGIONS.map((region) => {
    const unlocked = isRegionUnlocked(progress, region.id);
    if (!unlocked) {
      return `<div class="region region--locked">
        <span class="region-emoji">🔒</span>
        <div><h2>${region.he}</h2><p>נפתח ב-⭐${region.unlockStars}</p></div>
      </div>`;
    }
    const levelDots = Array.from({ length: region.levels }, (_, i) => {
      const levelStars = progress[region.id]?.[i]?.stars ?? 0;
      const open = isLevelUnlocked(progress, region.id, i);
      const cls = open ? 'level' : 'level level--locked';
      const label = open ? (levelStars > 0 ? '⭐'.repeat(levelStars) : String(i + 1)) : '🔒';
      return `<button class="${cls}" data-region="${region.id}" data-level="${i}" ${open ? '' : 'disabled'}>${label}</button>`;
    }).join('');
    return `<div class="region">
      <span class="region-emoji">${region.emoji}</span>
      <div class="region-body"><h2>${region.he}</h2><div class="levels">${levelDots}</div></div>
    </div>`;
  }).join('');

  root.innerHTML = `
    <header class="row hud">
      <button class="badge" id="back-home">🏠 הלגונה</button>
      <span class="badge">⭐ ${stars}</span>
    </header>
    <section class="map-list">${regionCards}</section>`;

  root.querySelector('#back-home').addEventListener('click', () => navigate('#lagoon'));
  root.querySelectorAll('.level:not([disabled])').forEach((btn) => {
    btn.addEventListener('click', () => navigate(`#game/${btn.dataset.region}/${btn.dataset.level}`));
  });
}
