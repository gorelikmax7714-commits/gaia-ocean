import { navigate } from '../app.js';
import { buildLevel, exerciseFromKey } from '../levels.js';
import { EXERCISES_PER_LEVEL } from '../config.js';
import { starsForResult, recordLevelResult, updateStreak } from '../engine/progression.js';
import { recordMistake, recordSuccess, dueMistakes } from '../engine/srs.js';
import { localDateISO } from '../storage.js';
import { speak, canSpeak, sfx } from '../audio.js';
import { enqueue } from '../sync.js';

// ---------- pure logic (unit-tested) ----------

export function applyAnswer(session, isCorrect, srsKey) {
  return {
    index: session.index + 1,
    correct: session.correct + (isCorrect ? 1 : 0),
    wrongKeys: isCorrect || session.wrongKeys.includes(srsKey)
      ? session.wrongKeys
      : [...session.wrongKeys, srsKey],
  };
}

export function finishLevel(state, { regionId, levelIndex, correct, total, wrongKeys, todayISO }) {
  const stars = starsForResult({ correct, total });
  let mistakes = state.mistakes;
  for (const key of wrongKeys) mistakes = recordMistake(mistakes, key, todayISO);
  const withQueue = enqueue(state, {
    type: 'session', date: todayISO, region: regionId, level: levelIndex,
    correct, total, stars, wrongKeys,
  });
  return {
    ...withQueue,
    progress: recordLevelResult(state.progress, regionId, levelIndex, stars),
    wallet: { ...state.wallet, stars: state.wallet.stars + stars },
    streak: updateStreak(state.streak, todayISO),
    mistakes,
    lastReward: { stars, regionId, levelIndex },
  };
}

// ---------- DOM shell ----------

export function renderGame(root, ctx, { region, level }) {
  const rng = Math.random;
  const today = localDateISO(new Date());
  // Replay up to 2 due mistakes inside every level (spec §4.6).
  const replays = dueMistakes(ctx.state.mistakes, today)
    .slice(0, 2)
    .map((key) => exerciseFromKey(key, ctx.content, rng))
    .filter(Boolean);
  const fresh = buildLevel(region, level, ctx.content, rng)
    .slice(0, EXERCISES_PER_LEVEL - replays.length);
  const exercises = [...fresh, ...replays];
  let session = { index: 0, correct: 0, wrongKeys: [] };
  let firstTry = true;

  const showExercise = () => {
    if (session.index >= exercises.length) return finish();
    const ex = exercises[session.index];
    firstTry = true;
    root.innerHTML = `
      <header class="row hud">
        <button class="badge" id="quit">✖</button>
        <div class="progress-bar"><div class="progress-fill" style="width:${(session.index / exercises.length) * 100}%"></div></div>
      </header>
      <section class="card game-card" id="stage"></section>
      <p class="feedback" aria-live="polite"></p>`;
    root.querySelector('#quit').addEventListener('click', () => navigate('#map'));
    RENDERERS[ex.kind](root.querySelector('#stage'), ex, handleAnswer(ex));
  };

  const handleAnswer = (ex) => (isCorrect) => {
    const feedback = root.querySelector('.feedback');
    if (isCorrect) {
      sfx('correct');
      // A first-try success on a tracked mistake counts toward graduation.
      if (firstTry) {
        ctx.update({
          ...ctx.state,
          mistakes: recordSuccess(ctx.state.mistakes, ex.srsKey, localDateISO(new Date())),
        });
      }
      session = applyAnswer(session, firstTry, ex.srsKey);
      setTimeout(showExercise, 500);
    } else {
      sfx('wrong');
      if (firstTry) session = { ...session, wrongKeys: applyAnswer(session, false, ex.srsKey).wrongKeys };
      firstTry = false;
      feedback.textContent = 'כמעט! נסי שוב 💪';
    }
  };

  const finish = () => {
    const next = finishLevel(ctx.state, {
      regionId: region, levelIndex: level,
      correct: session.correct, total: exercises.length,
      wrongKeys: session.wrongKeys, todayISO: localDateISO(new Date()),
    });
    ctx.update(next);
    navigate('#reward');
  };

  showExercise();
}

// ---------- per-kind renderers ----------

function choiceButtons(stage, labels, isRight, onAnswer) {
  const grid = document.createElement('div');
  grid.className = 'choice-grid';
  for (const label of labels) {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.innerHTML = label;
    btn.addEventListener('click', () => {
      const correct = isRight(label);
      btn.classList.add(correct ? 'choice--right' : 'choice--wrong');
      onAnswer(correct);
    });
    grid.appendChild(btn);
  }
  stage.appendChild(grid);
}

function renderBubbles(stage, ex, onAnswer) {
  stage.innerHTML = `<h1 class="question ltr">${ex.question} = ?</h1>`;
  choiceButtons(stage, ex.choices.map(String), (l) => Number(l) === ex.answer, onAnswer);
  stage.querySelectorAll('.choice').forEach((b) => b.classList.add('choice--bubble'));
}

function renderVertical(stage, ex, onAnswer) {
  stage.innerHTML = `
    <div class="vertical ltr">
      <div>${ex.a}</div>
      <div>${ex.op} ${ex.b}</div>
      <div class="vertical-line"></div>
      <input class="vertical-input" inputmode="numeric" pattern="[0-9]*" autofocus />
    </div>
    <button class="btn btn--coral" id="check">בדיקה ✔</button>`;
  const input = stage.querySelector('.vertical-input');
  stage.querySelector('#check').addEventListener('click', () => {
    if (input.value.trim() === '') return;
    onAnswer(Number(input.value) === ex.answer);
    if (Number(input.value) !== ex.answer) input.value = '';
  });
}

function renderWordbuild(stage, ex, onAnswer) {
  stage.innerHTML = `
    <div class="big-emoji">${ex.emoji}</div>
    <p class="he-hint">${ex.he}</p>
    <button class="badge" id="hear">🔊 להשמיע</button>
    <div class="slots ltr"></div>
    <div class="letter-bank ltr"></div>`;
  const slots = stage.querySelector('.slots');
  const bank = stage.querySelector('.letter-bank');
  let built = '';
  const draw = () => {
    slots.innerHTML = ex.word.split('').map((_, i) =>
      `<span class="slot">${built[i] ?? ''}</span>`).join('');
  };
  draw();
  stage.querySelector('#hear').addEventListener('click', () => speakWord(ex.word));
  for (const letter of ex.letters) {
    const b = document.createElement('button');
    b.className = 'choice choice--letter';
    b.textContent = letter;
    b.addEventListener('click', () => {
      if (b.disabled) return;
      if (letter === ex.word[built.length]) {
        built += letter;
        b.disabled = true;
        draw();
        if (built === ex.word) { speakWord(ex.word); onAnswer(true); }
      } else {
        onAnswer(false);
      }
    });
    bank.appendChild(b);
  }
}

function renderMatch(stage, ex, onAnswer) {
  stage.innerHTML = `<h1 class="question ltr">${ex.word}</h1><button class="badge" id="hear">🔊</button>`;
  stage.querySelector('#hear').addEventListener('click', () => speakWord(ex.word));
  speakWord(ex.word);
  choiceButtons(
    stage,
    ex.options.map((o) => `<span class="big-emoji">${o.emoji}</span>`),
    (label) => label.includes(ex.emoji),
    onAnswer,
  );
}

function renderListen(stage, ex, onAnswer) {
  stage.innerHTML = `
    <p class="he-hint">${ex.prompt}</p>
    <button class="btn" id="hear">🔊 להשמיע שוב</button>`;
  const play = () => speakWord(ex.say);
  stage.querySelector('#hear').addEventListener('click', play);
  play();
  choiceButtons(stage, ex.options, (l) => l === ex.answer, onAnswer);
}

function speakWord(text) {
  if (!speak(window.speechSynthesis, text, 'en-US')) {
    // canSpeak false → visual-only mode; word stays visible, no crash.
  }
}

const RENDERERS = {
  bubbles: renderBubbles,
  vertical: renderVertical,
  wordbuild: renderWordbuild,
  match: renderMatch,
  listen: renderListen,
};
