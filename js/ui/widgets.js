// Reusable UI pieces: the answer widget (keypad / choices) and the scratch pad.

const norm = (s) => String(s).replace(/,/g, '').trim();

export function isRight(ask, raw) {
  if (ask.kind === 'number') return norm(raw) !== '' && Number(norm(raw)) === ask.value;
  return String(raw) === ask.value;
}

let activeKeyHandler = null;

/**
 * Renders an answer input for `ask` into `host`.
 * onSubmit(raw) must return true when the answer was accepted (to lock the widget).
 */
export function answerWidget(host, ask, onSubmit, { compact = false } = {}) {
  const box = document.createElement('div');
  box.className = `answer ${compact ? 'answer--compact' : ''}`;
  host.appendChild(box);
  let locked = false;

  if (ask.kind === 'choice') {
    const long = ask.options.some((o) => o.length > 14);
    box.innerHTML = `<div class="choices ${long ? 'choices--long' : ''} ${ask.options.length === 3 && !long ? 'choices--3' : ''}"></div>`;
    const grid = box.firstElementChild;
    for (const opt of ask.options) {
      const b = document.createElement('button');
      b.className = 'choice';
      b.type = 'button';
      b.textContent = opt;
      if (/^[\d,<>=\s+\-−×:()]+$/.test(opt)) b.classList.add('ltr');
      b.addEventListener('click', () => {
        if (locked || b.disabled) return;
        const ok = onSubmit(opt);
        if (ok) {
          locked = true;
          b.classList.add('choice--right');
          grid.querySelectorAll('.choice').forEach((x) => { x.disabled = true; });
        } else {
          b.classList.add('choice--wrong');
          b.disabled = true;
        }
      });
      grid.appendChild(b);
    }
    return {
      el: box,
      reveal() {
        locked = true;
        grid.querySelectorAll('.choice').forEach((x) => {
          x.disabled = true;
          if (x.textContent === ask.value) x.classList.add('choice--reveal');
        });
      },
    };
  }

  // number keypad
  let value = '';
  box.innerHTML = `
    <div class="num-display ltr" aria-live="polite"><span class="num-value"></span><span class="caret"></span></div>
    <div class="keypad ltr"></div>`;
  const display = box.querySelector('.num-value');
  const pad = box.querySelector('.keypad');
  const draw = () => {
    display.textContent = value;
    box.querySelector('.num-display').classList.toggle('num-display--empty', value === '');
  };
  const submit = () => {
    if (locked || value === '') return;
    const ok = onSubmit(value);
    const d = box.querySelector('.num-display');
    if (ok) {
      locked = true;
      d.classList.add('num-display--right');
      pad.querySelectorAll('button').forEach((x) => { x.disabled = true; });
      if (activeKeyHandler === keyHandler) activeKeyHandler = null;
    } else {
      d.classList.remove('num-display--wrong');
      void d.offsetWidth; // restart animation
      d.classList.add('num-display--wrong');
      value = '';
      setTimeout(draw, 350);
    }
  };
  const press = (k) => {
    if (locked) return;
    if (k === '⌫') value = value.slice(0, -1);
    else if (k === '✔') return submit();
    else if (value.length < 6) value = value === '0' ? String(k) : value + k;
    draw();
  };
  for (const k of [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✔']) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `key ${k === '✔' ? 'key--go' : ''} ${k === '⌫' ? 'key--back' : ''}`;
    b.textContent = k;
    b.addEventListener('click', () => press(String(k)));
    pad.appendChild(b);
  }
  const keyHandler = (e) => {
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('⌫');
    else if (e.key === 'Enter') press('✔');
  };
  activeKeyHandler = keyHandler;
  draw();
  return {
    el: box,
    reveal() {
      locked = true;
      value = String(ask.value);
      draw();
      box.querySelector('.num-display').classList.add('num-display--reveal');
      pad.querySelectorAll('button').forEach((x) => { x.disabled = true; });
    },
  };
}

// one global keyboard listener → routes keys to the newest keypad
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => { if (activeKeyHandler) activeKeyHandler(e); });
}

// ---------- scratch pad ("דף טיוטה") ----------
export function scratchPad(root, btnHost = root) {
  const btn = document.createElement('button');
  btn.className = 'pill pill--sun';
  btn.type = 'button';
  btn.innerHTML = '✏️ טיוטה';
  const sheet = document.createElement('div');
  sheet.className = 'scratch';
  sheet.innerHTML = `
    <div class="scratch-bar">
      <b>דף טיוטה ✏️</b>
      <div class="row">
        <button type="button" class="pill" data-act="clear">🧽 למחוק</button>
        <button type="button" class="pill pill--dark" data-act="close">סגירה ✖</button>
      </div>
    </div>
    <canvas class="scratch-canvas"></canvas>`;
  btnHost.appendChild(btn);
  root.appendChild(sheet);
  const canvas = sheet.querySelector('canvas');
  const g = canvas.getContext('2d');
  let drawing = false;
  let last = null;
  const fit = () => {
    const r = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const img = canvas.width ? g.getImageData(0, 0, canvas.width, canvas.height) : null;
    canvas.width = r.width * ratio;
    canvas.height = r.height * ratio;
    g.scale(ratio, ratio);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.lineWidth = 3.5;
    g.strokeStyle = '#1d3a8a';
    if (img) g.putImageData(img, 0, 0);
  };
  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  canvas.addEventListener('pointerdown', (e) => { drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    g.beginPath();
    g.moveTo(...last);
    g.lineTo(...p);
    g.stroke();
    last = p;
  });
  const stop = () => { drawing = false; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);
  btn.addEventListener('click', () => {
    sheet.classList.add('scratch--open');
    requestAnimationFrame(() => { if (!canvas.width) fit(); });
  });
  sheet.querySelector('[data-act="close"]').addEventListener('click', () => sheet.classList.remove('scratch--open'));
  sheet.querySelector('[data-act="clear"]').addEventListener('click', () => g.clearRect(0, 0, canvas.width, canvas.height));
  return {
    clear() { if (canvas.width) g.clearRect(0, 0, canvas.width, canvas.height); },
  };
}

export function confetti(host, n = 40) {
  const layer = document.createElement('div');
  layer.className = 'confetti';
  const colors = ['#ffd166', '#ff6b6b', '#2ec4b6', '#9b8cff', '#7cc6fe'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.style.left = `${Math.random() * 100}%`;
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = `${Math.random() * 0.6}s`;
    s.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
    s.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(s);
  }
  host.appendChild(layer);
  setTimeout(() => layer.remove(), 3500);
}
