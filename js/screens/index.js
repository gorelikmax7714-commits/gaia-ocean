import { registerScreen } from '../app.js';
import { renderOnboarding } from './onboarding.js';
import { renderLagoon } from './lagoon.js';

const stub = (title) => (root) => {
  root.innerHTML = `<section class="card"><h1>${title}</h1><p>בקרוב…</p></section>`;
};

registerScreen('onboarding', renderOnboarding);
registerScreen('lagoon', renderLagoon);
registerScreen('map', stub('מפת ההרפתקה'));
registerScreen('game', stub('משחק'));
registerScreen('reward', stub('כל הכבוד!'));
