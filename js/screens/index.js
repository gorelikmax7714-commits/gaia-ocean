import { registerScreen } from '../app.js';
import { renderOnboarding } from './onboarding.js';
import { renderLagoon } from './lagoon.js';
import { renderMap } from './map.js';

const stub = (title) => (root) => {
  root.innerHTML = `<section class="card"><h1>${title}</h1><p>בקרוב…</p></section>`;
};

registerScreen('onboarding', renderOnboarding);
registerScreen('lagoon', renderLagoon);
registerScreen('map', renderMap);
registerScreen('game', stub('משחק'));
registerScreen('reward', stub('כל הכבוד!'));
