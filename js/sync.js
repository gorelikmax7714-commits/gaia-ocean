// Placeholder until Task 15. enqueue(state, event) → new state with event queued.
export const enqueue = (state, event) => ({ ...state, syncQueue: [...state.syncQueue, event] });
