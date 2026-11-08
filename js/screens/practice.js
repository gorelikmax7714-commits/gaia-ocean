import { navigate } from '../app.js';
import { EXERCISES_PER_LEVEL } from '../config.js';
import {
  topicById, makeExercise, exerciseFromKey, LEVEL_NAMES,
} from '../engine/topics.js';
import { newSeed } from '../engine/rng.js';
import {
  starsForResult, recordLevelResult, updateStreak, isLevelUnlocked,
} from '../engine/progression.js';
import { recordMistake, recordSuccess, dueMistakes } from '../engine/srs.js';
import { localDateISO } from '../storage.js';
import { sfx } from '../audio.js';
import { enqueue } from '../sync.js';
import { answerWidget, isRight, scratchPad } from '../ui/widgets.js';

// ---------- pure logic (unit-tested) ----------

export function applyAnswer(session, isCorrect, srsKey) {
  return {
    ...session,
    index: session.index + 1,
    correct: session.correct + (isCorrect ? 1 : 0),
    wrongKeys: isCorrect || session.wrongKeys.includes(srsKey)
      ? session.wrongKeys
      : [...session.wrongKeys, srsKey],
  };
}

export function finishLevel(state, {
  regionId, levelIndex, correct, total, wrongKeys, guided = 0, todayISO,
}) {
  const stars = starsForResult({ correct, total });
  let mistakes = state.mistakes;
  for (const key of wrongKeys) mistakes = recordMistake(mistakes, key, todayISO);
  const withQueue = enqueue(state, {
    type: 'session', date: todayISO, region: regionId, level: levelIndex,
    correct, total, stars, wrongKeys,
  });
  const isReview = regionId === 'review';
  return {
    ...withQueue,
    progress: isReview ? state.progress : recordLevelResult(state.progress, regionId, levelIndex, stars),
    wallet: { ...state.wallet, stars: state.wallet.stars + stars },
    streak: updateStreak(state.streak, todayISO),
    mistakes,
    lastReward: {
      stars, regionId, levelIndex, correct, total, guided,
    },
  };
}

export function buildSession(topic, level, mistakes, todayISO, seedFn = newSeed) {
  if (topic === 'review') {
    return dueMistakes(mistakes, todayISO).slice(0, EXERCISES_PER_LEVEL)
      .map((k) => exerciseFromKey(k)).filter(Boolean);
  }
  // Replay up to 2 due mistakes from this topic inside the level.
  const replays = dueMistakes(mistakes, todayISO)
    .filter((k) => k.startsWith(`${topic}:`))
    .slice(0, 2)
    .map((k) => exerciseFromKey(k))
    .filter(Boolean);
  const fresh = Array.from({ length: EXERCISES_PER_LEVEL - replays.length }, () => makeExercise(topic, level, seedFn()));
  return [...fresh, ...replays];
}

// ---------- DOM ----------

const PRAISE = ['נכון! 🎉', 'מעולה! 🌟', 'יופי של חשיבה! 🧠', 'בול! 🎯', 'אלופה! 🦄'];
const WRONG_TRY = ['לא נורא! בואי נלך יחד על הדרך 🧭', 'טעות זה חלק מהלמידה. בואי נפתור צעד אחרי צעד 💪'];

export function renderPractice(root, ctx, { topic, level }) {
  const isReview = topic === 'review';
  const def = topicById(topic);
  if (!isReview && (!def || !(level >= 0 && level <= 2) || !isLevelUnlocked(ctx.state.progress, topic, level))) {
    navigate('#map');
    return;
  }
  const today = localDateISO(new Date());
  const exercises = buildSession(topic, level, ctx.state.mistakes, today);
  if (exercises.length === 0) { navigate('#lagoon'); return; }

  let session = { index: 0, correct: 0, wrongKeys: [], guided: 0 };
  let quitting = false;

  root.innerHTML = `
    <header class="hud hud--practice">
      <button class="icon-btn" id="quit" aria-label="יציאה">✕</button>
      <div class="dots">${exercises.map((_, i) => `<span class="pdot" data-i="${i}"></span>`).join('')}</div>
      <span class="hud-tools"></span>
    </header>
    <main class="practice"></main>`;
  root.querySelector('#quit').addEventListener('click', () => { quitting = true; navigate(isReview ? '#lagoon' : '#map'); });
  const stage = root.querySelector('.practice');
  const pad = scratchPad(root, root.querySelector('.hud-tools'));

  const markDot = (i, cls) => root.querySelector(`.pdot[data-i="${i}"]`)?.classList.add(cls);

  const showExercise = () => {
    if (session.index >= exercises.length) return finish();
    pad.clear();
    const ex = exercises[session.index];
    const exDef = topicById(ex.topic);
    root.querySelectorAll('.pdot').forEach((d, i) => d.classList.toggle('pdot--now', i === session.index));
    let firstTry = true;
    let done = false;

    stage.innerHTML = `
      <article class="paper problem">
        <div class="paper-top">
          <span class="chip">${exDef.emoji} ${exDef.he}</span>
          <span class="chip chip--soft">${isReview ? 'חזרה על טעות' : LEVEL_NAMES[ex.level]} · ${session.index + 1}/${exercises.length}</span>
        </div>
        <p class="prompt">${ex.prompt}</p>
        ${ex.expr ? `<div class="expr ltr">${ex.expr}</div>` : ''}
        ${ex.visual ? `<div class="visual">${ex.visual}</div>` : ''}
        <div class="final-slot"></div>
        <p class="feedback" aria-live="polite"></p>
        <button class="btn btn--ghost" id="show-way">🧭 תראי לי את הדרך</button>
      </article>
      <section class="way" hidden></section>`;
    const feedback = stage.querySelector('.feedback');
    const wayBtn = stage.querySelector('#show-way');
    const way = stage.querySelector('.way');

    const advance = () => {
      if (quitting) return;
      showExercise();
    };

    const nextButton = (host, label = 'לתרגיל הבא ←') => {
      const b = document.createElement('button');
      b.className = 'btn btn--coral btn--next';
      b.textContent = session.index >= exercises.length ? 'לסיום 🏁' : label;
      b.addEventListener('click', advance);
      host.appendChild(b);
      b.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const succeed = (viaGuide) => {
      if (done) return;
      done = true;
      sfx('correct');
      if (!viaGuide && firstTry) {
        ctx.update({ ...ctx.state, mistakes: recordSuccess(ctx.state.mistakes, ex.srsKey, localDateISO(new Date())) });
      }
      const correct = !viaGuide && firstTry;
      markDot(session.index, correct ? 'pdot--ok' : 'pdot--learn');
      session = applyAnswer(session, correct, ex.srsKey);
      if (!correct) session = { ...session, guided: session.guided + 1 };
      wayBtn.remove();
      if (viaGuide) {
        feedback.innerHTML = viaGuide === 'revealed'
          ? 'הפעם ראינו את הדרך יחד. התרגיל הזה יחזור בקרוב לחזרה 💙'
          : '✔ פתרת לבד אחרי הדרך — ככה לומדים!';
        feedback.className = 'feedback feedback--ok';
        nextButton(way);
        return;
      }
      feedback.innerHTML = `${PRAISE[Math.floor(Math.random() * PRAISE.length)]} <span class="tip-inline">הכלל: ${ex.tip}</span>`;
      feedback.className = 'feedback feedback--ok';
      // Always show the path — the goal is the method, not only the answer.
      way.hidden = false;
      way.innerHTML = `<details class="recap"><summary>👀 איך פותרים? (הדרך המלאה)</summary><ol class="recap-list">${ex.steps.map((s) => `<li><div>${s.say}</div>${s.ask ? `<div class="recap-q">${s.q} <b class="ltr-i">${s.ask.value}</b></div>` : ''}${s.after ? `<div class="after">${s.after}</div>` : ''}</li>`).join('')}</ol></details>`;
      nextButton(way);
    };

    const startGuide = (reason) => {
      if (!way.hidden) return;
      firstTry = false;
      wayBtn.remove();
      finalWidget?.el.remove();
      feedback.innerHTML = reason;
      feedback.className = 'feedback feedback--learn';
      way.hidden = false;
      way.innerHTML = `
        <div class="way-head"><span class="way-flag">🧭</span><div><b>הדרך</b><small>הכלל: ${ex.tip}</small></div></div>
        <ol class="timeline"></ol>`;
      const list = way.querySelector('.timeline');
      let i = 0;
      const nextStep = () => {
        if (quitting) return;
        if (i >= ex.steps.length) return finalAsk();
        const s = ex.steps[i];
        const li = document.createElement('li');
        li.className = 'tl-step tl-step--now';
        li.innerHTML = `
          <span class="tl-num">${i + 1}</span>
          <div class="tl-body">
            <p class="tl-say">${s.say}</p>
            ${s.visual ? `<div class="visual visual--step">${s.visual}</div>` : ''}
            ${s.ask ? `<p class="tl-q">${s.q}</p>` : ''}
            <div class="tl-slot"></div>
            <p class="tl-after" hidden></p>
          </div>`;
        list.appendChild(li);
        li.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const slot = li.querySelector('.tl-slot');
        const afterEl = li.querySelector('.tl-after');
        const complete = (revealed) => {
          li.classList.remove('tl-step--now');
          li.classList.add(revealed ? 'tl-step--shown' : 'tl-step--done');
          if (s.after) { afterEl.innerHTML = s.after; afterEl.hidden = false; }
          i += 1;
          setTimeout(nextStep, s.after ? 900 : 450);
        };
        if (!s.ask) {
          const ok = document.createElement('button');
          ok.className = 'btn btn--small';
          ok.textContent = 'הבנתי ←';
          ok.addEventListener('click', () => { ok.remove(); complete(false); });
          slot.appendChild(ok);
          return;
        }
        let misses = 0;
        const w = answerWidget(slot, s.ask, (raw) => {
          if (isRight(s.ask, raw)) { sfx('correct'); complete(false); return true; }
          sfx('wrong');
          misses += 1;
          if (misses >= 2) {
            w.reveal();
            afterEl.hidden = false;
            afterEl.innerHTML = `התשובה היא <b class="ltr-i">${s.ask.value}</b>. ${s.after ?? ''}`;
            li.classList.remove('tl-step--now');
            li.classList.add('tl-step--shown');
            i += 1;
            const go = document.createElement('button');
            go.className = 'btn btn--small';
            go.textContent = 'הבנתי, ממשיכים ←';
            go.addEventListener('click', () => { go.remove(); nextStep(); });
            slot.appendChild(go);
            return false;
          }
          afterEl.hidden = false;
          afterEl.innerHTML = 'כמעט! בדקי שוב 🧐';
          return false;
        }, { compact: true });
      };
      const finalAsk = () => {
        const li = document.createElement('li');
        li.className = 'tl-step tl-step--final';
        li.innerHTML = `<span class="tl-num">⭐</span><div class="tl-body"><p class="tl-say"><b>עכשיו את!</b> מה התשובה לשאלה?</p><div class="tl-slot"></div><p class="tl-after" hidden></p></div>`;
        list.appendChild(li);
        li.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const afterEl = li.querySelector('.tl-after');
        let misses = 0;
        const w = answerWidget(li.querySelector('.tl-slot'), ex.answer, (raw) => {
          if (isRight(ex.answer, raw)) { li.classList.add('tl-step--done'); succeed('guide'); return true; }
          sfx('wrong');
          misses += 1;
          afterEl.hidden = false;
          if (misses >= 2) {
            w.reveal();
            afterEl.innerHTML = `התשובה: <b class="ltr-i">${ex.answer.value}</b>.`;
            succeed('revealed');
          } else {
            afterEl.innerHTML = 'הסתכלי על הצעדים למעלה — התשובה כבר שם 😉';
          }
          return false;
        });
      };
      nextStep();
    };

    const finalWidget = answerWidget(stage.querySelector('.final-slot'), ex.answer, (raw) => {
      if (isRight(ex.answer, raw)) { succeed(false); return true; }
      sfx('wrong');
      startGuide(WRONG_TRY[Math.floor(Math.random() * WRONG_TRY.length)]);
      return false;
    });
    wayBtn.addEventListener('click', () => startGuide('בואי נפתור יחד, צעד אחרי צעד 🧭'));
  };

  const finish = () => {
    const next = finishLevel(ctx.state, {
      regionId: isReview ? 'review' : topic,
      levelIndex: isReview ? 0 : level,
      correct: session.correct,
      total: exercises.length,
      wrongKeys: session.wrongKeys,
      guided: session.guided,
      todayISO: localDateISO(new Date()),
    });
    ctx.update(next);
    ctx.trySync?.();
    navigate('#reward');
  };

  showExercise();
}
