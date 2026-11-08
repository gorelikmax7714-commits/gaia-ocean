// Measures real practice time: counts seconds only while the app is visible
// AND Gaia touched it recently (an app left open on the table doesn't count).

export const IDLE_MS = 120_000; // no touch for 2 minutes → idle
export const MAX_TICK_MS = 20_000; // never credit more than one tick gap

// Pure step: how many ms to credit between lastTick and now.
export function activeDelta({ lastTick, now, visible, lastInteraction }) {
  if (!visible || lastTick == null) return 0;
  if (now - lastInteraction > IDLE_MS) return 0;
  return Math.max(0, Math.min(now - lastTick, MAX_TICK_MS));
}

export function startUsageTracker({ onFlush, flushEveryMs = 60_000, tickMs = 10_000 }) {
  let pendingMs = 0;
  let lastTick = Date.now();
  let lastInteraction = Date.now();
  let sinceFlush = 0;
  const visible = () => document.visibilityState === 'visible';

  const tick = () => {
    const now = Date.now();
    const d = activeDelta({ lastTick, now, visible: visible(), lastInteraction });
    pendingMs += d;
    sinceFlush += now - lastTick;
    lastTick = now;
    if (sinceFlush >= flushEveryMs) flush();
  };
  const flush = () => {
    sinceFlush = 0;
    const seconds = Math.round(pendingMs / 1000);
    if (seconds < 1) return;
    pendingMs -= seconds * 1000;
    onFlush(seconds);
  };
  const touch = () => { lastInteraction = Date.now(); };
  for (const ev of ['pointerdown', 'keydown', 'touchstart']) window.addEventListener(ev, touch, { passive: true });
  document.addEventListener('visibilitychange', () => {
    tick();
    if (!visible()) flush();
    else { lastTick = Date.now(); touch(); }
  });
  window.addEventListener('pagehide', () => { tick(); flush(); });
  setInterval(tick, tickMs);
  return { flush: () => { tick(); flush(); } };
}
