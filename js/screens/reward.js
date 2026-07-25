import { navigate } from '../app.js';
import { petStage } from '../engine/pet.js';
import { totalStars } from '../engine/progression.js';
import { petSvg } from '../../assets/pet.js';
import { sfx } from '../audio.js';

const PRAISE = ['כל הכבוד גאיה! 🎉', 'וואו גאיה, את אלופה! 🌟', 'מדהים! החד־קרן גאה בך! 🦄'];
const COLOR_VALUES = { pink: '#ff8fc7', turquoise: '#40d4c4', purple: '#b28ff5', gold: '#ffd23f' };

export function renderReward(root, ctx) {
  const reward = ctx.state.lastReward;
  if (!reward) return navigate('#map');
  sfx('star');
  const stars = totalStars(ctx.state.progress);
  const stage = petStage(stars);
  const color = COLOR_VALUES[ctx.state.profile.petColor] ?? COLOR_VALUES.pink;
  const praise = PRAISE[stars % PRAISE.length];
  root.innerHTML = `
    <section class="card center reward">
      <h1>${praise}</h1>
      <div class="stars-earned">${'⭐'.repeat(reward.stars)}</div>
      <div class="pet-holder small">${petSvg(stage.id, color, 'happy')}</div>
      <p>📿 רצף: ${ctx.state.streak.current} ימים</p>
      <button class="btn btn--coral" id="again">עוד שלב! 🗺️</button>
      <button class="btn" id="home">🏠 הלגונה</button>
    </section>`;
  root.querySelector('#again').addEventListener('click', () => navigate('#map'));
  root.querySelector('#home').addEventListener('click', () => navigate('#lagoon'));
}
