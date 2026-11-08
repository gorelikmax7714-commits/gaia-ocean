import { navigate } from '../app.js';
import { petStage, petMood, feedPet, FEED_COST } from '../engine/pet.js';
import { totalStars, topicStars, isLevelUnlocked } from '../engine/progression.js';
import { TOPICS, LEVEL_NAMES } from '../engine/topics.js';
import { dueMistakes } from '../engine/srs.js';
import { localDateISO } from '../storage.js';
import { petSvg } from '../../assets/pet.js';
import { sfx } from '../audio.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const COLOR_VALUES = { pink: '#ff8fc7', turquoise: '#40d4c4', purple: '#b28ff5', gold: '#ffd23f' };

const MOOD_LINES = {
  happy: (pet) => `${pet} שמח לראות אותך! 🥰`,
  ok: (pet) => `${pet} מחכה לתרגל איתך 🙂`,
  sad: (pet) => `${pet} מתגעגע אלייך… בואי נתרגל! 🥺`,
};

// The weakest topic from the test that still has an open, not-yet-mastered level.
export function recommendTopic(progress) {
  const scored = TOPICS.map((t, i) => ({ t, i, s: topicStars(progress, t.id) }))
    .filter(({ s }) => s < 9)
    .sort((a, b) => (a.t.test === b.t.test ? 0 : a.t.test === 'need' ? -1 : 1) || a.s - b.s || a.i - b.i);
  const pick = scored[0];
  if (!pick) return null;
  const level = [0, 1, 2].find((l) => isLevelUnlocked(progress, pick.t.id, l) && (progress[pick.t.id]?.[l]?.stars ?? 0) < 3) ?? 0;
  return { topic: pick.t, level, fresh: pick.s === 0 };
}

export function renderLagoon(root, ctx) {
  const { state } = ctx;
  const today = localDateISO(new Date());
  const stars = totalStars(state.progress);
  const stage = petStage(Math.max(stars, 1)); // onboarding already hatched the egg
  const mood = petMood(state.streak.lastPracticeDate, today);
  const color = COLOR_VALUES[state.profile.petColor] ?? COLOR_VALUES.pink;
  const rec = recommendTopic(state.progress);
  const due = dueMistakes(state.mistakes, today).length;

  root.innerHTML = `
    <header class="hud">
      <span class="pill pill--glass">⭐ ${state.wallet.stars}</span>
      <span class="pill pill--glass">🔥 ${state.streak.current} ימים ברצף</span>
    </header>
    <section class="home">
      <div class="pet-stage">
        <div class="pet-holder">${petSvg(stage.id, color, mood)}</div>
        <p class="mood-line">${MOOD_LINES[mood](esc(state.profile.petName))}</p>
      </div>
      ${rec ? `<article class="mission">
        <span class="mission-tag">🎯 המשימה של היום</span>
        <div class="mission-row">
          <span class="blob">${rec.topic.emoji}</span>
          <div><h2>${rec.topic.he}</h2><p>${rec.fresh ? 'מתחילים בשיעור קצר, ואז מתרגלים' : `שלב: ${LEVEL_NAMES[rec.level]}`}</p></div>
        </div>
        <button class="btn btn--coral btn--big" id="go-mission">${rec.fresh ? '📖 לשיעור' : 'בואי נתרגל ←'}</button>
      </article>` : '<article class="mission"><h2>סיימת את כל הנושאים! 👑</h2></article>'}
      ${due ? `<button class="btn btn--sun" id="review">🔁 חזרה על טעויות (${due})</button>` : ''}
      <button class="btn" id="go-map">🗺️ כל הנושאים</button>
      <button class="btn btn--ghost-light" id="feed">🍤 להאכיל את ${esc(state.profile.petName)} (⭐${FEED_COST})</button>
      <p class="feed-msg" aria-live="polite"></p>
    </section>`;

  root.querySelector('#go-map').addEventListener('click', () => navigate('#map'));
  root.querySelector('#go-mission')?.addEventListener('click', () => {
    navigate(rec.fresh ? `#lesson/${rec.topic.id}` : `#practice/${rec.topic.id}/${rec.level}`);
  });
  root.querySelector('#review')?.addEventListener('click', () => navigate('#practice/review'));
  root.querySelector('#feed').addEventListener('click', () => {
    const fed = feedPet(state.wallet, state.pet, today);
    const msg = root.querySelector('.feed-msg');
    if (!fed) {
      msg.textContent = state.pet.lastFed === today
        ? `${state.profile.petName} כבר אכל היום 😋`
        : 'צריך עוד כוכבים — בואי נתרגל! ⭐';
      return;
    }
    sfx('correct');
    ctx.update({ ...state, wallet: fed.wallet, pet: fed.pet });
    renderLagoon(root, ctx);
  });
}
