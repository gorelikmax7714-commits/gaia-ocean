import { loadState, saveState } from './storage.js';
import { flush, postToSheet } from './sync.js';

const screens = new Map();

export function registerScreen(name, renderFn) {
  screens.set(name, renderFn);
}

const KNOWN_SCREENS = ['onboarding', 'lagoon', 'map', 'reward'];

export function resolveRoute(hash, hasProfile) {
  if (!hasProfile) return { screen: 'onboarding', params: {} };
  const parts = (hash || '').replace(/^#/, '').split('/').filter(Boolean);
  if (parts[0] === 'game' && parts.length === 3) {
    return { screen: 'game', params: { region: parts[1], level: Number(parts[2]) } };
  }
  if (KNOWN_SCREENS.includes(parts[0])) return { screen: parts[0], params: {} };
  return { screen: 'lagoon', params: {} };
}

export function navigate(hash) {
  window.location.hash = hash;
}

function renderCurrent(ctx) {
  const route = resolveRoute(window.location.hash, Boolean(ctx.state.profile));
  const render = screens.get(route.screen);
  const root = document.getElementById('app');
  root.innerHTML = '';
  render(root, ctx, route.params);
}

export async function boot() {
  const ctx = {
    state: loadState(window.localStorage),
    update(next) {
      ctx.state = next;
      saveState(window.localStorage, next);
    },
  };
  ctx.content = await fetch('data/english.json').then((r) => r.json()).catch(() => ({ phonics: [], cvc: {}, vocab: {} }));
  const trySync = async () => {
    const { remaining } = await flush(ctx.state.syncQueue, postToSheet);
    if (remaining.length !== ctx.state.syncQueue.length) {
      ctx.update({ ...ctx.state, syncQueue: remaining });
    }
  };
  trySync();
  window.addEventListener('online', trySync);
  window.addEventListener('hashchange', () => renderCurrent(ctx));
  renderCurrent(ctx);
}
