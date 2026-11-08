import { loadState, saveState, localDateISO } from './storage.js';
import { flush, postToSheet, addUsage } from './sync.js';
import { startUsageTracker } from './usage.js';
import { isTopicKey } from './engine/topics.js';

const screens = new Map();

export function registerScreen(name, renderFn) {
  screens.set(name, renderFn);
}

const KNOWN_SCREENS = ['onboarding', 'lagoon', 'map', 'reward'];

export function resolveRoute(hash, hasProfile) {
  if (!hasProfile) return { screen: 'onboarding', params: {} };
  const parts = (hash || '').replace(/^#/, '').split('/').filter(Boolean);
  if (parts[0] === 'practice' && parts[1] === 'review') {
    return { screen: 'practice', params: { topic: 'review', level: 0 } };
  }
  if (parts[0] === 'practice' && parts.length === 3) {
    return { screen: 'practice', params: { topic: parts[1], level: Number(parts[2]) } };
  }
  if (parts[0] === 'lesson' && parts.length === 2) {
    return { screen: 'lesson', params: { topic: parts[1] } };
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
  root.dataset.screen = route.screen;
  window.scrollTo(0, 0);
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
  // Old English/times-table mistakes can't be replayed in the math-only app.
  const cleaned = ctx.state.mistakes.filter((m) => isTopicKey(m.key));
  if (cleaned.length !== ctx.state.mistakes.length) ctx.update({ ...ctx.state, mistakes: cleaned });

  let syncing = false;
  const trySync = async () => {
    if (syncing) return;
    syncing = true;
    try {
      const snapshot = ctx.state.syncQueue;
      const { remaining } = await flush(snapshot, postToSheet);
      if (remaining.length !== snapshot.length) {
        // Events enqueued during the network round-trip must survive the flush.
        const added = ctx.state.syncQueue.slice(snapshot.length);
        ctx.update({ ...ctx.state, syncQueue: [...remaining, ...added] });
      }
    } finally {
      syncing = false;
    }
  };
  ctx.trySync = trySync;
  trySync();
  // Usage minutes → parent's daily summary e-mail.
  startUsageTracker({
    onFlush(seconds) {
      if (!ctx.state.profile) return;
      ctx.update(addUsage(ctx.state, localDateISO(new Date()), seconds));
      trySync();
    },
  });
  window.addEventListener('online', trySync);
  window.addEventListener('hashchange', () => renderCurrent(ctx));
  renderCurrent(ctx);
}
