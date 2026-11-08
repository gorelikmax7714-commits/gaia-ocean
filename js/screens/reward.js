import { navigate } from '../app.js';
import { petStage } from '../engine/pet.js';
import { totalStars, isLevelUnlocked } from '../engine/progression.js';
import { topicById } from '../engine/topics.js';
import { petSvg } from '../../assets/pet.js';
import { sfx } from '../audio.js';
import { confetti } from '../ui/widgets.js';

const PRAISE = ['כל הכבוד גאיה! 🎉', 'וואו גאיה, את אלופה! 🌟', 'מדהים! החד־קרן גאה בך! 🦄'];
const COLOR_VALUES = { pink: '#ff8fc7', turquoise: '#40d4c4', purple: '#b28ff5', gold: '#ffd23f' };

export function renderReward(root, ctx) {
  const reward = ctx.state.lastReward;
  if (!reward) return navigate('#map');
  sfx('star');
  const stars = totalStars(ctx.state.progress);
  const stage = petStage(Math.max(stars, 1)); // onboarding already hatched the egg
  const color = COLOR_VALUES[ctx.state.profile.petColor] ?? COLOR_VALUES.pink;
  const praise = PRAISE[stars % PRAISE.length];
  const def = topicById(reward.regionId);
  const nextOpen = def && reward.levelIndex < 2 && isLevelUnlocked(ctx.state.progress, def.id, reward.levelIndex + 1);
  const total = reward.total ?? 0;
  const correct = reward.correct ?? 0;
  const guided = reward.guided ?? Math.max(0, total - correct);

  root.innerHTML = `
    <section class="reward">
      <article class="paper center">
        <h1>${praise}</h1>
        <div class="stars-earned">${[1, 2, 3].map((i) => `<span class="star ${i <= reward.stars ? 'star--on' : ''}" style="--d:${i * 0.18}s">★</span>`).join('')}</div>
        <div class="pet-holder small">${petSvg(stage.id, color, 'happy')}</div>
        <div class="stats">
          <div><b>${correct}</b><span>לבד מהניסיון הראשון</span></div>
          <div><b>${guided}</b><span>למדתי את הדרך 🧭</span></div>
          <div><b>${ctx.state.streak.current}</b><span>ימים ברצף 🔥</span></div>
        </div>
        ${guided ? '<p class="note">התרגילים שלמדנו בדרך יחזרו בחזרה על טעויות — ככה הם נהיים קלים 💙</p>' : ''}
        ${nextOpen ? `<button class="btn btn--coral" id="next">לשלב הבא 🚀</button>` : ''}
        ${def ? `<button class="btn ${nextOpen ? '' : 'btn--coral'}" id="again">עוד סיבוב באותו שלב 🔁</button>` : ''}
        <button class="btn" id="map">🗺️ כל הנושאים</button>
        <button class="btn btn--ghost" id="home">🏠 הבית</button>
      </article>
    </section>`;
  confetti(root);
  root.querySelector('#next')?.addEventListener('click', () => navigate(`#practice/${def.id}/${reward.levelIndex + 1}`));
  root.querySelector('#again')?.addEventListener('click', () => {
    // force a re-render even though the hash may be identical
    window.location.hash = `#practice/${def.id}/${reward.levelIndex}`;
  });
  root.querySelector('#map').addEventListener('click', () => navigate('#map'));
  root.querySelector('#home').addEventListener('click', () => navigate('#lagoon'));
}
