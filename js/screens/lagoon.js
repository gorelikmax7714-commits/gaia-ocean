import { navigate } from '../app.js';
import { petStage, petMood, feedPet, FEED_COST } from '../engine/pet.js';
import { totalStars } from '../engine/progression.js';
import { localDateISO } from '../storage.js';
import { petSvg } from '../../assets/pet.js';
import { sfx } from '../audio.js';

const COLOR_VALUES = { pink: '#ff8fc7', turquoise: '#40d4c4', purple: '#b28ff5', gold: '#ffd23f' };

const MOOD_LINES = {
  happy: (pet) => `${pet} שמח לראות אותך! 🥰`,
  ok: (pet) => `${pet} מחכה לתרגל איתך 🙂`,
  sad: (pet) => `${pet} מתגעגע אלייך… בואי נתרגל! 🥺`,
};

export function renderLagoon(root, ctx) {
  const { state } = ctx;
  const today = localDateISO(new Date());
  const stars = totalStars(state.progress);
  const stage = petStage(stars);
  const mood = petMood(state.streak.lastPracticeDate, today);
  const color = COLOR_VALUES[state.profile.petColor] ?? COLOR_VALUES.pink;

  root.innerHTML = `
    <header class="row hud">
      <span class="badge">⭐ ${state.wallet.stars}</span>
      <span class="badge">📿 ${state.streak.current}</span>
    </header>
    <section class="lagoon center">
      <div class="pet-holder">${petSvg(stage.id, color, mood)}</div>
      <p class="mood-line">${MOOD_LINES[mood](state.profile.petName)}</p>
      <button class="btn btn--big btn--coral" id="go-adventure">🗺️ הרפתקה!</button>
      <button class="btn" id="feed">🍤 להאכיל את ${state.profile.petName} (⭐${FEED_COST})</button>
      <p class="feed-msg" aria-live="polite"></p>
    </section>`;

  root.querySelector('#go-adventure').addEventListener('click', () => navigate('#map'));
  root.querySelector('#feed').addEventListener('click', () => {
    const fed = feedPet(state.wallet, state.pet, today);
    const msg = root.querySelector('.feed-msg');
    if (!fed) {
      msg.textContent = state.pet.lastFed === today
        ? `${state.profile.petName} כבר אכל היום 😋`
        : 'צריך עוד כוכבים — בואי נשחק! ⭐';
      return;
    }
    sfx('correct');
    ctx.update({ ...state, wallet: fed.wallet, pet: fed.pet });
    renderLagoon(root, ctx);
  });
}
