export function canSpeak(synth) {
  return Boolean(synth && typeof synth.speak === 'function');
}

// makeUtterance is injectable for tests; browser default uses SpeechSynthesisUtterance.
export function speak(synth, text, lang = 'en-US', makeUtterance) {
  if (!canSpeak(synth)) return false;
  const make = makeUtterance
    ?? ((t) => new SpeechSynthesisUtterance(t));
  const utterance = make(text);
  utterance.lang = lang;
  utterance.rate = 0.85;
  if (typeof synth.cancel === 'function') synth.cancel();
  synth.speak(utterance);
  return true;
}

const TONES = {
  correct: [[523, 0.12], [784, 0.18]],
  wrong: [[220, 0.2]],
  star: [[659, 0.1], [784, 0.1], [1047, 0.25]],
};

let audioCtx = null;

export function sfx(name) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx ?? new Ctx();
    let at = audioCtx.currentTime;
    for (const [freq, dur] of TONES[name] ?? []) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, at);
      gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(at);
      osc.stop(at + dur);
      at += dur;
    }
  } catch { /* sound is optional — never break the game */ }
}
