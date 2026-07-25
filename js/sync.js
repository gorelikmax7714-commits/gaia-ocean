import { SYNC_URL, SYNC_TOKEN } from './config.js';

export const enqueue = (state, event) => ({ ...state, syncQueue: [...state.syncQueue, event] });

export async function flush(queue, postFn) {
  if (queue.length === 0) return { sent: 0, remaining: [] };
  try {
    const ok = await postFn(queue);
    return ok ? { sent: queue.length, remaining: [] } : { sent: 0, remaining: queue };
  } catch {
    return { sent: 0, remaining: queue };
  }
}

// Browser-side poster. text/plain avoids a CORS preflight, which GAS web apps
// do not answer; GAS still receives the body via e.postData.contents.
export async function postToSheet(events) {
  if (!SYNC_URL) return false;
  const res = await fetch(SYNC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ token: SYNC_TOKEN, events }),
  });
  const body = await res.json().catch(() => ({}));
  return res.ok && body.ok === true;
}
