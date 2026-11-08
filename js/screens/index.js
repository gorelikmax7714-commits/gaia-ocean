import { registerScreen } from '../app.js';
import { renderOnboarding } from './onboarding.js';
import { renderLagoon } from './lagoon.js';
import { renderMap } from './map.js';
import { renderPractice } from './practice.js';
import { renderLesson } from './lesson.js';
import { renderReward } from './reward.js';

registerScreen('onboarding', renderOnboarding);
registerScreen('lagoon', renderLagoon);
registerScreen('map', renderMap);
registerScreen('practice', renderPractice);
registerScreen('lesson', renderLesson);
registerScreen('reward', renderReward);
