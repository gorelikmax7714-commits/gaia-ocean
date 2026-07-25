import { navigate } from '../app.js';
import { sfx } from '../audio.js';

const COLORS = [
  { id: 'pink', he: 'ורוד', value: '#ff8fc7' },
  { id: 'turquoise', he: 'טורקיז', value: '#40d4c4' },
  { id: 'purple', he: 'סגול', value: '#b28ff5' },
  { id: 'gold', he: 'זהב', value: '#ffd23f' },
];

export function renderOnboarding(root, ctx) {
  let pin = '';
  let petName = '';
  let petColor = COLORS[0];

  const showPin = () => {
    root.innerHTML = `
      <section class="card onboard">
        <h1>GAYA</h1>
        <p class="subtitle">ברוכה הבאה לאוקיינוס הקסום 🌊</p>
        <p>בחרי קוד סודי בן 4 ספרות — המפתח לממלכה שלך:</p>
        <div class="pin-dots row" aria-label="קוד"></div>
        <div class="keypad"></div>
      </section>`;
    const dots = root.querySelector('.pin-dots');
    const keypad = root.querySelector('.keypad');
    const drawDots = () => {
      dots.innerHTML = [0, 1, 2, 3]
        .map((i) => `<span class="dot ${i < pin.length ? 'dot--full' : ''}"></span>`)
        .join('');
    };
    drawDots();
    for (const digit of [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0]) {
      const btn = document.createElement('button');
      btn.className = 'key';
      btn.textContent = digit;
      btn.addEventListener('click', () => {
        if (digit === '⌫') pin = pin.slice(0, -1);
        else if (pin.length < 4) pin += String(digit);
        drawDots();
        if (pin.length === 4) { sfx('correct'); showHatch(); }
      });
      keypad.appendChild(btn);
    }
  };

  const showHatch = () => {
    root.innerHTML = `
      <section class="card onboard center">
        <h1>מצאת ביצה קסומה!</h1>
        <div class="egg" role="button" aria-label="ביצה">🥚</div>
        <p>לחצי על הביצה כדי לבקוע אותה…</p>
      </section>`;
    let taps = 0;
    root.querySelector('.egg').addEventListener('click', (e) => {
      taps += 1;
      e.target.classList.add('egg--shake');
      setTimeout(() => e.target.classList.remove('egg--shake'), 300);
      if (taps >= 3) { sfx('star'); showName(); }
    });
  };

  const showName = () => {
    root.innerHTML = `
      <section class="card onboard center">
        <h1>נולד חד־קרן ים! 🦄</h1>
        <div class="pet-preview">🦄</div>
        <p>איך נקרא לו?</p>
        <input class="name-input" maxlength="12" placeholder="שם החד־קרן" />
        <p>באיזה צבע?</p>
        <div class="row color-row"></div>
        <button class="btn btn--big btn--coral" disabled>יאללה, לאוקיינוס! 🌊</button>
      </section>`;
    const input = root.querySelector('.name-input');
    const go = root.querySelector('.btn');
    const colorRow = root.querySelector('.color-row');
    for (const c of COLORS) {
      const b = document.createElement('button');
      b.className = 'color-chip';
      b.style.background = c.value;
      b.setAttribute('aria-label', c.he);
      b.addEventListener('click', () => {
        petColor = c;
        colorRow.querySelectorAll('.color-chip').forEach((el) => el.classList.remove('color-chip--on'));
        b.classList.add('color-chip--on');
      });
      colorRow.appendChild(b);
    }
    colorRow.firstChild.classList.add('color-chip--on');
    input.addEventListener('input', () => { go.disabled = input.value.trim().length === 0; });
    go.addEventListener('click', () => {
      petName = input.value.trim();
      ctx.update({
        ...ctx.state,
        profile: { name: 'גאיה', pin, petName, petColor: petColor.id },
      });
      navigate('#lagoon');
    });
  };

  showPin();
}
