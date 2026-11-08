import { navigate } from '../app.js';
import { topicById, makeExercise } from '../engine/topics.js';
import { isLevelUnlocked } from '../engine/progression.js';

// A worked example: the rule, then the solution revealed one step at a time.
const LESSON_SEEDS = {
  order: 11, column: 7, mult: 5, remainder: 3, numberline: 9, word: 2, perimeter: 4, shapes: 8, bars: 6,
};

export function renderLesson(root, ctx, { topic }) {
  const def = topicById(topic);
  if (!def) { navigate('#map'); return; }
  const ex = makeExercise(topic, 0, LESSON_SEEDS[topic] ?? 1);
  const nextLevel = [2, 1, 0].find((l) => isLevelUnlocked(ctx.state.progress, topic, l)) ?? 0;

  root.innerHTML = `
    <header class="hud">
      <button class="pill pill--glass" id="back">→ לכל הנושאים</button>
    </header>
    <main class="lesson">
      <section class="lesson-hero">
        <span class="blob">${def.emoji}</span>
        <h1>${def.he}</h1>
        <p>${def.blurb}</p>
      </section>
      <article class="paper rules">
        <h2>📌 הכללים</h2>
        <ul>${def.rule.map((r) => `<li>${r}</li>`).join('')}</ul>
      </article>
      <article class="paper problem">
        <div class="paper-top"><span class="chip">👩‍🏫 דוגמה פתורה</span></div>
        <p class="prompt">${ex.prompt}</p>
        ${ex.expr ? `<div class="expr ltr">${ex.expr}</div>` : ''}
        ${ex.visual ? `<div class="visual">${ex.visual}</div>` : ''}
      </article>
      <ol class="timeline timeline--lesson"></ol>
      <div class="lesson-actions">
        <button class="btn" id="step">הצעד הראשון ←</button>
      </div>
    </main>`;

  root.querySelector('#back').addEventListener('click', () => navigate('#map'));
  const list = root.querySelector('.timeline');
  const btn = root.querySelector('#step');
  let i = 0;
  btn.addEventListener('click', () => {
    if (i >= ex.steps.length) {
      navigate(`#practice/${topic}/${nextLevel}`);
      return;
    }
    const s = ex.steps[i];
    const li = document.createElement('li');
    li.className = 'tl-step tl-step--done tl-step--enter';
    li.innerHTML = `
      <span class="tl-num">${i + 1}</span>
      <div class="tl-body">
        <p class="tl-say">${s.say}</p>
        ${s.visual ? `<div class="visual visual--step">${s.visual}</div>` : ''}
        ${s.ask ? `<p class="tl-q">${s.q} <b class="answer-badge ltr-i">${s.ask.value}</b></p>` : ''}
        ${s.after ? `<p class="tl-after">${s.after}</p>` : ''}
      </div>`;
    list.appendChild(li);
    i += 1;
    if (i >= ex.steps.length) {
      const fin = document.createElement('li');
      fin.className = 'tl-step tl-step--final tl-step--enter';
      fin.innerHTML = `<span class="tl-num">⭐</span><div class="tl-body"><p class="tl-say">התשובה: <b class="answer-badge ltr-i">${ex.answer.value}</b></p></div>`;
      list.appendChild(fin);
      btn.textContent = 'הבנתי! יאללה לתרגל 🚀';
      btn.classList.add('btn--coral');
    } else {
      btn.textContent = 'הצעד הבא ←';
    }
    btn.scrollIntoView({ behavior: 'smooth', block: 'end' });
  });
}
