// Small deterministic helpers. Every exercise is built from an integer seed so a
// mistake can be replayed later from its srsKey alone.

export function lcg(seed) {
  let s = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
  return () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const int = (min, max, rng) => min + Math.floor(rng() * (max - min + 1));
export const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

export function shuffle(arr, rng) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// 2220 → "2,220" (the way numbers are printed in the school test)
export const fmt = (n) => (Math.abs(n) >= 1000 ? n.toLocaleString('en-US') : String(n));

export const newSeed = () => Math.floor(Math.random() * 2147483000) + 1;
