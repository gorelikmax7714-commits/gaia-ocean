import { navigate } from '../app.js';
import { TOPICS, LEVEL_NAMES } from '../engine/topics.js';
import { isLevelUnlocked, topicStars } from '../engine/progression.js';

const TEST_BADGE = {
  need: '<span class="badge badge--need">מהמבחן: צריך תרגול</span>',
  onway: '<span class="badge badge--onway">מהמבחן: בדרך לשליטה</span>',
};

export function renderMap(root, ctx) {
  const { progress } = ctx.state;

  const cards = TOPICS.map((t, idx) => {
    const got = topicStars(progress, t.id);
    const levels = [0, 1, 2].map((i) => {
      const s = progress[t.id]?.[i]?.stars ?? 0;
      const open = isLevelUnlocked(progress, t.id, i);
      return `<button class="lvl ${open ? '' : 'lvl--locked'} ${s ? 'lvl--done' : ''}" data-topic="${t.id}" data-level="${i}" ${open ? '' : 'disabled'}>
        <span class="lvl-name">${open ? LEVEL_NAMES[i] : '🔒'}</span>
        <span class="lvl-stars">${open ? '★'.repeat(s) + '☆'.repeat(3 - s) : ''}</span>
      </button>`;
    }).join('');
    return `<article class="topic" style="--i:${idx}">
      <div class="topic-head">
        <span class="blob blob--${idx % 5}">${t.emoji}</span>
        <div class="topic-title">
          <h2>${t.he}</h2>
          <p>${t.blurb}</p>
        </div>
        <span class="topic-score">${got}/9 ★</span>
      </div>
      ${TEST_BADGE[t.test] ?? ''}
      <div class="lvls">${levels}</div>
      <button class="link-btn" data-lesson="${t.id}">📖 איך פותרים? שיעור קצר</button>
    </article>`;
  }).join('');

  root.innerHTML = `
    <header class="hud">
      <button class="pill pill--glass" id="back-home">🏠 הבית</button>
      <span class="pill pill--glass">⭐ ${ctx.state.wallet.stars}</span>
    </header>
    <section class="map-hero">
      <h1>הנושאים שלי</h1>
      <p>כל הנושאים נבחרו מהמבחן בחשבון של תחילת השנה. בכל נושא — שיעור קצר ו-3 שלבים.</p>
    </section>
    <section class="topics">${cards}</section>`;

  root.querySelector('#back-home').addEventListener('click', () => navigate('#lagoon'));
  root.querySelectorAll('.lvl:not([disabled])').forEach((b) => {
    b.addEventListener('click', () => navigate(`#practice/${b.dataset.topic}/${b.dataset.level}`));
  });
  root.querySelectorAll('[data-lesson]').forEach((b) => {
    b.addEventListener('click', () => navigate(`#lesson/${b.dataset.lesson}`));
  });
}
