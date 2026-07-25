import { registerScreen } from '../app.js';
import { renderOnboarding } from './onboarding.js';
import { renderLagoon } from './lagoon.js';
import { renderMap } from './map.js';
import { renderGame } from './game.js';
import { renderReward } from './reward.js';

registerScreen('onboarding', renderOnboarding);
registerScreen('lagoon', renderLagoon);
registerScreen('map', renderMap);
registerScreen('game', renderGame);
registerScreen('reward', renderReward);
