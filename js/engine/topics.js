// Topics built from Gaia's start-of-year math assessment (כיתה ד׳).
// Every generator returns an exercise with a final question AND the guided
// steps that teach the way to solve it.
import {
  lcg, int, pick, shuffle, fmt,
} from './rng.js';
import {
  gridRect, barChart, numberLine, angleSvg, angleAt, quadSvg, sidesSvg, dotsGroups, columnHtml,
} from './visuals.js';

export const LEVEL_NAMES = ['צעד ראשון', 'מתקדמת', 'אלופה'];

export const TOPICS = [
  {
    id: 'order', he: 'סדר פעולות', emoji: '🧮', test: 'need',
    blurb: 'קודם סוגריים, אחר כך כפל וחילוק, ובסוף חיבור וחיסור',
    rule: ['<b>1.</b> קודם פותרים את מה שבתוך <b>הסוגריים ( )</b>.',
      '<b>2.</b> אחר כך <b>כפל ×</b> ו<b>חילוק :</b>.',
      '<b>3.</b> בסוף <b>חיבור +</b> ו<b>חיסור −</b>, משמאל לימין כמו שקוראים תרגיל.'],
  },
  {
    id: 'column', he: 'חיבור וחיסור במאונך', emoji: '✏️', test: 'need',
    blurb: 'עמודה אחרי עמודה, עם העברה ופריטה',
    rule: ['כותבים יחידות מתחת ליחידות, עשרות מתחת לעשרות.',
      'מתחילים תמיד מ<b>הימין</b> — עמודת היחידות.',
      'בחיבור: אם יצא 10 או יותר — כותבים את היחידות ו<b>מעבירים 1</b> שמאלה.',
      'בחיסור: אם הספרה למעלה קטנה מדי — <b>פורטים</b>: לוקחים 1 מהעמודה שמשמאל.'],
  },
  {
    id: 'mult', he: 'כפל ומשמעות הכפל', emoji: '✖️', test: 'need',
    blurb: 'מפרקים מספרים, משווים תרגילים, ו"פי כמה"',
    rule: ['כפל = חיבור חוזר: <span class="ltr-i">3 × 4</span> זה 3 קבוצות של 4.',
      'מספר גדול? <b>מפרקים</b>: <span class="ltr-i">25 × 8 = 20 × 8 + 5 × 8</span>.',
      'חילוק הוא <b>ההפך</b> מכפל: <span class="ltr-i">63 : 7</span> שואל "מה כפול 7 נותן 63?".'],
  },
  {
    id: 'remainder', he: 'חילוק עם שארית', emoji: '🍬', test: 'need',
    blurb: 'כמה פעמים נכנס, וכמה נשאר',
    rule: ['מחפשים את המספר <b>הכי גדול</b> בלוח הכפל <b>שלא עובר</b> את המספר.',
      'מחסירים — ומה שנשאר זו <b>השארית</b>.',
      'השארית תמיד <b>קטנה</b> מהמספר שמחלקים בו.'],
  },
  {
    id: 'numberline', he: 'ישר המספרים', emoji: '📏', test: 'need',
    blurb: 'מי בתוך הקטע, ואיפה נמצא החץ',
    rule: ['משווים מספרים <b>ספרה אחרי ספרה משמאל</b>: אלפים, מאות, עשרות, יחידות.',
      'מספר נמצא בקטע אם הוא <b>גדול</b> מההתחלה ו<b>קטן</b> מהסוף.',
      'כדי לקרוא ישר: בודקים <b>כמה שווה כל קפיצה</b>.'],
  },
  {
    id: 'word', he: 'בעיות מילוליות', emoji: '📖', test: 'need',
    blurb: 'מה ידוע, מה שואלים, ואיזו פעולה',
    rule: ['קוראים לאט. מסמנים <b>מה ידוע</b> ו<b>מה שואלים</b>.',
      'בוחרים פעולה: מחלקים לקבוצות שוות → <b>חילוק</b>. כמה פעמים אותו דבר → <b>כפל</b>.',
      'פותרים צעד אחרי צעד, ובסוף בודקים שהתשובה הגיונית.'],
  },
  {
    id: 'perimeter', he: 'היקף', emoji: '🔲', test: 'need',
    blurb: 'הדרך מסביב לצורה',
    rule: ['<b>היקף</b> = כל הדרך <b>מסביב</b> לצורה, כמו נמלה שהולכת על הקווים 🐜.',
      '<b>לא</b> סופרים את המשבצות שבפנים — זה שטח, לא היקף!',
      'במלבן: צלעות מול צלעות שוות. היקף = צלע + צלע + צלע + צלע.'],
  },
  {
    id: 'shapes', he: 'זוויות ומקבילות', emoji: '📐', test: 'need',
    blurb: 'חדה, ישרה, קהה — ופסי רכבת',
    rule: ['<b>זווית ישרה</b> = בדיוק כמו פינה של דף.',
      '<b>חדה</b> = קטנה מפינת דף. <b>קהה</b> = גדולה מפינת דף.',
      '<b>קווים מקבילים</b> הולכים באותו כיוון ולעולם לא נפגשים — כמו פסי רכבת 🛤️.'],
  },
  {
    id: 'bars', he: 'דיאגרמת עמודות', emoji: '📊', test: 'onway',
    blurb: 'לקרוא נתונים מהגרף',
    rule: ['מוצאים את העמודה, והולכים איתה <b>בקו ישר</b> אל הציר שבצד.',
      'עמודה ארוכה יותר = מספר גדול יותר.',
      '"בכמה יותר?" → מחסירים את הקטן מהגדול.'],
  },
];

export const topicById = (id) => TOPICS.find((t) => t.id === id);

// ---------- ask helpers ----------
const num = (value) => ({ kind: 'number', value });
const choice = (value, options, rng, keepOrder = false) => ({
  kind: 'choice', value: String(value), options: keepOrder ? options.map(String) : shuffle(options.map(String), rng),
});
const ex = (s) => `<span class="ltr-i">${s}</span>`;
const PLACES = ['יחידות', 'עשרות', 'מאות', 'אלפים'];

// =====================================================================
// 1. סדר פעולות
// =====================================================================
function genOrder(level, rng) {
  if (level === 0) {
    const t = int(0, 2, rng);
    const b = int(2, 9, rng);
    const c = int(2, 9, rng);
    const p = b * c;
    if (t === 0 || t === 1) {
      const isMinus = t === 1;
      const a = isMinus ? p + int(1, 30, rng) : int(2, 30, rng);
      const sym = isMinus ? '−' : '+';
      const res = isMinus ? a - p : a + p;
      return {
        expr: `${a} ${sym} ${b} × ${c}`,
        prompt: 'פתרי את התרגיל:',
        answer: num(res),
        tip: 'כפל לפני חיבור וחיסור',
        steps: [
          { say: `יש בתרגיל גם ${isMinus ? 'חיסור' : 'חיבור'} וגם כפל. הכלל: <b>כפל וחילוק קודם</b>!`, ask: choice(`${b} × ${c}`, [`${b} × ${c}`, `${a} ${sym} ${b}`], rng), q: 'מה פותרים קודם?' },
          { say: 'פותרים את הכפל:', q: `${ex(`${b} × ${c} = ?`)}`, ask: num(p), after: ex(`${b} × ${c} = ${p}`) },
          { say: `עכשיו התרגיל קצר יותר: ${ex(`${a} ${sym} ${p}`)}`, q: `${ex(`${a} ${sym} ${p} = ?`)}`, ask: num(res), after: ex(`${a} ${sym} ${b} × ${c} = ${res}`) },
        ],
      };
    }
    const a = int(2, 9, rng);
    const c2 = int(2, 40, rng);
    const pr = a * b;
    return {
      expr: `${c2} + ${a} × ${b}`,
      prompt: 'פתרי את התרגיל:',
      answer: num(c2 + pr),
      tip: 'כפל לפני חיבור — גם כשהוא בסוף',
      steps: [
        { say: 'שימי לב! החיבור כתוב ראשון, אבל <b>כפל תמיד קודם</b>.', q: 'מה פותרים קודם?', ask: choice(`${a} × ${b}`, [`${a} × ${b}`, `${c2} + ${a}`], rng) },
        { say: 'פותרים את הכפל:', q: `${ex(`${a} × ${b} = ?`)}`, ask: num(pr), after: ex(`${a} × ${b} = ${pr}`) },
        { say: `עכשיו: ${ex(`${c2} + ${pr}`)}`, q: `${ex(`${c2} + ${pr} = ?`)}`, ask: num(c2 + pr) },
      ],
    };
  }
  if (level === 1) {
    const t = int(0, 2, rng);
    if (t === 0) {
      const b = int(1, 6, rng);
      const c = int(2, 10 - b, rng);
      const s = b + c;
      const q = int(2, 9, rng);
      const a = s * q;
      const wrong = Number.isInteger(a / b) ? a / b + c : null;
      return {
        expr: `${a} : (${b} + ${c})`,
        prompt: 'פתרי את התרגיל:',
        answer: num(q),
        tip: 'קודם סוגריים',
        steps: [
          { say: 'יש <b>סוגריים</b>! מה שבתוך הסוגריים פותרים ראשון — גם לפני חילוק.', q: 'מה פותרים קודם?', ask: choice(`${b} + ${c}`, [`${b} + ${c}`, `${a} : ${b}`], rng) },
          { say: 'פותרים את הסוגריים:', q: `${ex(`${b} + ${c} = ?`)}`, ask: num(s), after: ex(`(${b} + ${c}) = ${s}`) },
          { say: `עכשיו התרגיל: ${ex(`${a} : ${s}`)}. איזה מספר כפול ${s} נותן ${a}?`, q: `${ex(`${a} : ${s} = ?`)}`, ask: num(q), after: wrong ? `שימי לב: בלי סוגריים היה יוצא ${wrong} — לכן הסוגריים כל כך חשובים!` : '' },
        ],
      };
    }
    if (t === 1) {
      const d = int(2, 8, rng);
      const b = int(5, 60, rng);
      const a = b + d;
      const c = int(2, 9, rng);
      return {
        expr: `(${a} − ${b}) × ${c}`,
        prompt: 'פתרי את התרגיל:',
        answer: num(d * c),
        tip: 'קודם סוגריים',
        steps: [
          { say: 'קודם מה שבתוך <b>הסוגריים</b>:', q: `${ex(`${a} − ${b} = ?`)}`, ask: num(d), after: ex(`(${a} − ${b}) = ${d}`) },
          { say: `עכשיו התרגיל: ${ex(`${d} × ${c}`)}`, q: `${ex(`${d} × ${c} = ?`)}`, ask: num(d * c) },
        ],
      };
    }
    const b = int(10, 40, rng);
    const c = int(5, 30, rng);
    const a = b + c + int(5, 50, rng);
    return {
      expr: `${a} − (${b} + ${c})`,
      prompt: 'פתרי את התרגיל:',
      answer: num(a - b - c),
      tip: 'קודם סוגריים',
      steps: [
        { say: 'קודם מה שבתוך <b>הסוגריים</b>:', q: `${ex(`${b} + ${c} = ?`)}`, ask: num(b + c) },
        { say: `עכשיו: ${ex(`${a} − ${b + c}`)}`, q: `${ex(`${a} − ${b + c} = ?`)}`, ask: num(a - b - c) },
      ],
    };
  }
  // level 2: two "strong" operations
  const t = int(0, 1, rng);
  if (t === 0) {
    const a = int(3, 9, rng);
    const b = int(3, 9, rng);
    const d = int(2, 9, rng);
    let k = int(2, 9, rng);
    while (k >= a * b) k = int(1, a * b - 1, rng);
    const c = d * k;
    const res = a * b - k;
    return {
      expr: `${a} × ${b} − ${c} : ${d}`,
      prompt: 'פתרי את התרגיל:',
      answer: num(res),
      tip: 'כפל וחילוק קודם, חיסור בסוף',
      steps: [
        { say: 'יש כאן <b>שתי</b> פעולות שקודמות: כפל וחילוק. פותרים את שתיהן לפני החיסור.', q: `${ex(`${a} × ${b} = ?`)}`, ask: num(a * b) },
        { say: 'עכשיו את החילוק:', q: `${ex(`${c} : ${d} = ?`)}`, ask: num(k) },
        { say: `נשאר רק חיסור: ${ex(`${a * b} − ${k}`)}`, q: `${ex(`${a * b} − ${k} = ?`)}`, ask: num(res) },
      ],
    };
  }
  const a = int(2, 9, rng);
  const b = int(1, 9, rng);
  const c = int(2, 6, rng);
  const d = int(1, (a + b) * c - 1, rng);
  const res = (a + b) * c - d;
  return {
    expr: `(${a} + ${b}) × ${c} − ${d}`,
    prompt: 'פתרי את התרגיל:',
    answer: num(res),
    tip: 'סוגריים → כפל → חיסור',
    steps: [
      { say: '<b>שלב 1</b>: סוגריים.', q: `${ex(`${a} + ${b} = ?`)}`, ask: num(a + b) },
      { say: '<b>שלב 2</b>: כפל.', q: `${ex(`${a + b} × ${c} = ?`)}`, ask: num((a + b) * c) },
      { say: '<b>שלב 3</b>: חיסור.', q: `${ex(`${(a + b) * c} − ${d} = ?`)}`, ask: num(res) },
    ],
  };
}

// =====================================================================
// 2. חיבור וחיסור במאונך
// =====================================================================
const digitsOf = (n) => String(n).split('').reverse().map(Number); // units first

export function columnSteps(a, b, op) {
  const A = digitsOf(a);
  const B = digitsOf(b);
  const width = Math.max(A.length, B.length);
  const steps = [];
  const result = [];
  const carries = [];
  if (op === '+') {
    let carry = 0;
    for (let i = 0; i < width; i++) {
      const da = A[i] ?? 0;
      const db = B[i] ?? 0;
      const sum = da + db + carry;
      const parts = [da, db].concat(carry ? [carry] : []);
      const visual = columnHtml({ a, b, op, result: [...result], carries: [...carries], active: i });
      const carryNote = carry ? ` (+${carry} שהעברנו)` : '';
      result[i] = sum % 10;
      const nextCarry = sum >= 10 ? 1 : 0;
      if (nextCarry) carries[i + 1] = 1;
      steps.push({
        say: `עמודת ה<b>${PLACES[i]}</b>: ${ex(parts.join(' + '))}${carryNote}`,
        q: ex(`${parts.join(' + ')} = ?`),
        ask: num(sum),
        visual,
        after: nextCarry
          ? `יצא ${sum}: כותבים <b>${sum % 10}</b> ומעבירים <b>1</b> לעמודת ה${PLACES[i + 1] ?? 'הבאה'}.`
          : `כותבים <b>${sum}</b>.`,
      });
      carry = nextCarry;
    }
    if (carry) {
      result[width] = 1;
      steps.push({
        say: 'נשאר ה-1 שהעברנו — כותבים אותו בעמודה החדשה משמאל.',
        visual: columnHtml({ a, b, op, result: [...result], carries: [...carries], active: width }),
      });
    }
    steps.push({ say: 'סיימנו את כל העמודות! 🎉', visual: columnHtml({ a, b, op, result: [...result], carries: [...carries] }) });
    return steps;
  }
  // subtraction with borrowing (zeros turn into 9)
  const tops = [...A];
  for (let i = 0; i < A.length; i++) {
    const db = B[i] ?? 0;
    const before = tops[i];
    let say;
    if (tops[i] < db) {
      let j = i + 1;
      while (tops[j] === 0) j++;
      const zeros = j - i - 1;
      tops[j] -= 1;
      for (let k = i + 1; k < j; k++) tops[k] = 9;
      tops[i] += 10;
      say = `עמודת ה<b>${PLACES[i]}</b>: ${ex(`${before} − ${db}?`)} אי אפשר, כי ${before} קטן מ-${db}. אז <b>פורטים</b>: לוקחים 1 מה${PLACES[j]}`
        + `${zeros ? ` (ה-0 שבדרך הופך ל-9)` : ''}. עכשיו יש לנו <b>${tops[i]}</b>.`;
    } else {
      say = `עמודת ה<b>${PLACES[i]}</b>:`;
    }
    const isLeadingZero = i === A.length - 1 && tops[i] === 0 && db === 0;
    if (isLeadingZero) break;
    const visual = columnHtml({ a, b, op, result: [...result], tops: [...tops], active: i });
    result[i] = tops[i] - db;
    steps.push({ say, q: `${ex(`${tops[i]} − ${db} = ?`)}`, ask: num(tops[i] - db), visual });
  }
  steps.push({ say: 'סיימנו את כל העמודות! 🎉', visual: columnHtml({ a, b, op, result: [...result], tops: [...tops] }) });
  return steps;
}

function hasBorrow(a, b) {
  const A = digitsOf(a);
  const B = digitsOf(b);
  return B.some((d, i) => d > A[i]);
}

function genColumn(level, rng) {
  let a;
  let b;
  let op;
  if (level === 0) {
    op = '+';
    do {
      a = int(120, 899, rng);
      b = int(15, 199, rng);
    } while ((a % 10) + (b % 10) < 10);
  } else if (level === 1) {
    op = '-';
    do {
      a = int(300, 999, rng);
      b = int(101, a - 50, rng);
    } while (!hasBorrow(a, b));
  } else {
    op = '-';
    if (rng() < 0.6) {
      a = int(2, 9, rng) * 1000;
      b = int(110, 980, rng);
      if (b % 10 === 0 && rng() < 0.5) b += int(1, 9, rng);
    } else {
      a = int(2, 9, rng) * 1000 + int(1, 9, rng) * (rng() < 0.5 ? 1 : 10);
      do { b = int(120, 990, rng); } while (!hasBorrow(a, b));
    }
  }
  const res = op === '+' ? a + b : a - b;
  const sym = op === '+' ? '+' : '−';
  return {
    expr: `${fmt(a)} ${sym} ${fmt(b)}`,
    prompt: 'פתרי במאונך:',
    visual: columnHtml({ a, b, op }),
    answer: num(res),
    tip: op === '+' ? 'מימין לשמאל, עם העברה' : 'מימין לשמאל, עם פריטה',
    steps: columnSteps(a, b, op),
  };
}

// =====================================================================
// 3. כפל ומשמעות הכפל
// =====================================================================
function genMult(level, rng) {
  if (level === 0) {
    let a;
    do { a = int(12, 49, rng); } while (a % 10 === 0);
    const b = int(3, 9, rng);
    const t = Math.floor(a / 10) * 10;
    const u = a % 10;
    return {
      expr: `${a} × ${b}`,
      prompt: 'פתרי בעזרת פירוק:',
      answer: num(a * b),
      tip: `מפרקים: ${a} = ${t} + ${u}`,
      steps: [
        { say: `מפרקים את ${a} לעשרות ויחידות: ${ex(`${a} = ${t} + ${u}`)}. קודם העשרות.<br><small>טריק: ${ex(`${t} × ${b}`)} זה ${ex(`${t / 10} × ${b}`)} ועוד אפס בסוף.</small>`, q: `${ex(`${t} × ${b} = ?`)}`, ask: num(t * b) },
        { say: 'עכשיו היחידות:', q: `${ex(`${u} × ${b} = ?`)}`, ask: num(u * b) },
        { say: 'מחברים את שני החלקים:', q: `${ex(`${t * b} + ${u * b} = ?`)}`, ask: num(a * b), after: ex(`${a} × ${b} = ${t * b} + ${u * b} = ${a * b}`) },
      ],
    };
  }
  if (level === 1) {
    if (rng() < 0.5) {
      const n = int(11, 32, rng);
      const q = int(2, 4, rng);
      const k = int(2, 3, rng);
      const p = q * k;
      return {
        expr: `${n} × ${p}   ?   ${n} × ${q}`,
        prompt: `פי כמה ${ex(`${n} × ${p}`)} גדול מ-${ex(`${n} × ${q}`)}?`,
        answer: num(k),
        tip: 'משווים רק את מה שמשתנה',
        steps: [
          { say: `בשני התרגילים יש <b>${n}</b>. מה שונה? רק המספר השני: ${p} לעומת ${q}.`, q: `פי כמה ${p} גדול מ-${q}? (${ex(`${p} : ${q}`)})`, ask: num(k) },
          { say: `בדיקה: ${ex(`${n} × ${q} = ${n * q}`)} ו-${ex(`${n} × ${p} = ${n * p}`)}. ואכן ${ex(`${n * q} × ${k} = ${n * p}`)} ✔<br>אז גם התרגיל כולו גדול <b>פי ${k}</b>.` },
        ],
      };
    }
    const t = int(0, 2, rng);
    let left;
    let right;
    let L;
    let R;
    let hintL = '';
    let hintR = '';
    if (t === 0) {
      const a = int(2, 9, rng);
      const b = int(2, 9, rng);
      L = a * 10 * b * 10;
      left = `${a * 10} × ${b * 10}`;
      if (rng() < 0.6) { right = `${a} × ${b * 100}`; R = a * b * 100; } else { right = `${a} × ${b * 10}`; R = a * b * 10; }
      hintL = `${ex(`${a} × ${b} = ${a * b}`)}, ויש שני אפסים → ${fmt(L)}`;
      hintR = `שוב ${ex(`${a} × ${b} = ${a * b}`)}, וסופרים אפסים → ${fmt(R)}`;
    } else if (t === 1) {
      const a = int(2, 9, rng);
      const b = int(2, 9, rng);
      left = `${a} × ${b} × 1 × 1`;
      L = a * b;
      right = `${a} × ${b} × 2`;
      R = a * b * 2;
      hintL = 'כפל ב-1 לא משנה כלום!';
    } else {
      const a = int(3, 9, rng);
      const b = int(3, 9, rng);
      left = `${a} × ${b}`;
      L = a * b;
      right = `${b} × ${a}`;
      R = a * b;
      hintL = 'זה אותו כפל בסדר הפוך';
    }
    const sign = L === R ? '=' : L > R ? '>' : '<';
    return {
      expr: `${left}  ☐  ${right}`,
      prompt: 'איזה סימן מתאים במשבצת?',
      answer: choice(sign, ['<', '=', '>'], rng, true),
      tip: 'פותרים כל צד, ואז משווים',
      steps: [
        { say: `פותרים את הצד השמאלי:${hintL ? `<br><small>${hintL}</small>` : ''}`, q: ex(`${left} = ?`), ask: num(L) },
        { say: `עכשיו הצד הימני:${hintR ? `<br><small>${hintR}</small>` : ''}`, q: ex(`${right} = ?`), ask: num(R) },
        { say: `משווים: ${ex(`${fmt(L)} ☐ ${fmt(R)}`)}. הפה של הסימן פתוח אל המספר הגדול 🐊` },
      ],
    };
  }
  // level 2: division as the inverse of multiplication
  const d = int(3, 9, rng);
  const q = int(3, 9, rng);
  const n = d * q;
  const jumps = Array.from({ length: q }, (_, i) => d * (i + 1)).join(', ');
  if (rng() < 0.5) {
    return {
      expr: `${n} : ${d}`,
      prompt: 'פתרי:',
      answer: num(q),
      tip: 'חילוק = ההפך מכפל',
      steps: [
        { say: `${ex(`${n} : ${d}`)} שואל: <b>איזה מספר כפול ${d} נותן ${n}?</b><br>קופצים בקפיצות של ${d} עד שמגיעים ל-${n}.`, q: `${ex(`? × ${d} = ${n}`)}`, ask: num(q), after: `קפיצות: ${ex(jumps)} — ${q} קפיצות.` },
      ],
    };
  }
  return {
    expr: `? × ${d} = ${n}`,
    prompt: 'איזה מספר חסר?',
    answer: num(q),
    tip: 'קפיצות בלוח הכפל',
    steps: [
      { say: `נספור בקפיצות של ${d} עד ${n}, ונספור כמה קפיצות היו.`, q: `כמה קפיצות של ${d} עד ${n}?`, ask: num(q), after: `${ex(jumps)}` },
      { say: `בדיקה: ${ex(`${q} × ${d} = ${n}`)} ✔ וגם ${ex(`${n} : ${d} = ${q}`)}.` },
    ],
  };
}

// =====================================================================
// 4. חילוק עם שארית
// =====================================================================
function genRemainder(level, rng) {
  const d = level === 0 ? int(2, 5, rng) : int(4, 9, rng);
  const q = int(2, level === 0 ? 9 : 8, rng);
  const exact = level === 1 && rng() < 0.25;
  const r = exact ? 0 : int(1, d - 1, rng);
  const n = d * q + r;
  const multiples = [d * (q - 1), d * q, d * (q + 1)].filter((m) => m > 0);
  const core = [
    { say: `מחפשים את המספר <b>הכי גדול</b> בלוח הכפל של ${d} <b>שלא עובר</b> את ${n}.`, q: 'איזה מספר?', ask: choice(d * q, multiples, rng), after: `${ex(`${d} × ${q} = ${d * q}`)}${d * (q + 1) > n ? ` (ו-${d * (q + 1)} כבר גדול מ-${n})` : ''}` },
    { say: `אז ${d} נכנס ב-${n} בדיוק <b>${q}</b> פעמים. כמה נשאר?`, q: `${ex(`${n} − ${d * q} = ?`)}`, ask: num(r), visual: dotsGroups(n, d, { grouped: true }) },
    { say: r === 0 ? 'לא נשאר כלום — <b>אין שארית</b>! 🎯' : `השארית היא <b>${r}</b>. בדיקה: ${r} קטן מ-${d} ✔`, visual: dotsGroups(n, d, { grouped: true }) },
  ];
  if (level === 2) {
    const things = pick([['סוכריות', 'שקית', 'שקיות'], ['מדבקות', 'דף', 'דפים'], ['עפרונות', 'קופסה', 'קופסאות'], ['צדפים', 'צנצנת', 'צנצנות']], rng);
    return {
      prompt: `לגאיה יש <b>${n}</b> ${things[0]}. היא שמה <b>${d}</b> בכל ${things[1]}.<br>כמה ${things[0]} יישארו בחוץ?`,
      visual: dotsGroups(n, d),
      answer: num(r),
      tip: 'חילוק → מה שנשאר זו השארית',
      steps: [
        { say: 'מחלקים לקבוצות שוות — איזו פעולה זו?', q: 'איזו פעולה?', ask: choice('חילוק :', ['חילוק :', 'כפל ×', 'חיבור +', 'חיסור −'], rng, true), after: ex(`${n} : ${d}`) },
        ...core,
      ],
    };
  }
  if (level === 1) {
    const opts = new Set([r === 0 ? 'אין שארית' : String(r), 'אין שארית']);
    while (opts.size < 4) {
      const c = int(1, d + 2, rng);
      if (c !== r) opts.add(String(c));
    }
    return {
      expr: `${n} : ${d}`,
      prompt: 'מהי השארית?',
      visual: dotsGroups(n, d),
      answer: choice(r === 0 ? 'אין שארית' : String(r), [...opts], rng),
      tip: 'הכי קרוב בלוח הכפל — בלי לעבור',
      steps: core,
    };
  }
  return {
    expr: `${n} : ${d}`,
    prompt: 'מהי השארית?',
    visual: dotsGroups(n, d),
    answer: num(r),
    tip: 'הכי קרוב בלוח הכפל — בלי לעבור',
    steps: core,
  };
}

// =====================================================================
// 5. ישר המספרים
// =====================================================================
export function compareExplain(x, y) {
  const len = Math.max(String(x).length, String(y).length);
  const X = String(x).padStart(len, '0');
  const Y = String(y).padStart(len, '0');
  for (let i = 0; i < len; i++) {
    if (X[i] !== Y[i]) {
      const place = PLACES[len - 1 - i];
      return `ב${place}: ${X[i]} לעומת ${Y[i]}`;
    }
  }
  return 'הם שווים';
}

function genNumberline(level, rng) {
  if (level < 2) {
    let A;
    let B;
    let inside;
    let outs;
    if (level === 0) {
      const H = int(1, 8, rng) * 100;
      const k = int(4, 8, rng);
      A = H + int(1, 9, rng);
      B = H + 10 * k;
      inside = H + 10 * int(1, k - 1, rng);
      outs = [H, H + 10 * k + int(1, 9, rng), H + 100 + 10 * int(0, 2, rng)];
    } else {
      const T = int(1, 8, rng) * 1000;
      const k = int(2, 5, rng);
      A = T + int(2, 9, rng);
      B = T + 100 * k;
      inside = T + 10 * int(1, 9, rng);
      outs = [T, T + 100 * k + 20, T + 100 * k + 22];
    }
    const options = shuffle([inside, ...outs], rng);
    const steps = options.map((x) => {
      const isIn = x > A && x < B;
      const why = x < A
        ? `${fmt(x)} <b>קטן</b> מ-${fmt(A)} (${compareExplain(x, A)}) → בחוץ`
        : x > B
          ? `${fmt(x)} <b>גדול</b> מ-${fmt(B)} (${compareExplain(x, B)}) → בחוץ`
          : `${fmt(x)} גדול מ-${fmt(A)} וקטן מ-${fmt(B)} → <b>בפנים</b> ✔`;
      return {
        say: `בודקים את <b>${fmt(x)}</b>. משווים ספרה-ספרה משמאל.`,
        q: `האם ${fmt(x)} בין ${fmt(A)} ל-${fmt(B)}?`,
        ask: choice(isIn ? 'בתוך הקטע' : 'מחוץ לקטע', ['בתוך הקטע', 'מחוץ לקטע'], rng, true),
        after: why,
        visual: numberLine({ from: A, to: B, ticks: 1, segment: [A, B], points: isIn ? [{ value: x, label: fmt(x) }] : [] }),
      };
    });
    return {
      prompt: `איזה מספר נמצא בקטע <b>המודגש</b>, בין ${fmt(A)} ל-${fmt(B)}?`,
      visual: numberLine({ from: A, to: B, ticks: 1, segment: [A, B] }),
      answer: choice(fmt(inside), options.map(fmt), rng, true),
      tip: 'גדול מההתחלה וקטן מהסוף',
      steps,
    };
  }
  const span = pick([100, 1000, 50], rng);
  const from = span === 1000 ? int(0, 8, rng) * 1000 : span === 100 ? int(1, 9, rng) * 100 : int(1, 9, rng) * 100;
  const to = from + span;
  const stepV = span / 10;
  const i = int(1, 9, rng);
  const v = from + stepV * i;
  return {
    prompt: 'איזה מספר מסמן החץ?',
    visual: numberLine({ from, to, ticks: 10, mark: v }),
    answer: num(v),
    tip: 'בודקים כמה שווה כל קפיצה',
    steps: [
      { say: `מ-${fmt(from)} עד ${fmt(to)} יש ${fmt(span)}. כמה קפיצות קטנות יש בדרך?`, q: 'כמה קפיצות?', ask: num(10) },
      { say: `${fmt(span)} מתחלק ל-10 קפיצות שוות.`, q: `${ex(`${fmt(span)} : 10 = ?`)}`, ask: num(stepV), after: `כל קפיצה שווה <b>${stepV}</b>.` },
      { say: `החץ נמצא אחרי <b>${i}</b> קפיצות.`, q: `${ex(`${i} × ${stepV} = ?`)}`, ask: num(i * stepV) },
      { say: 'מוסיפים להתחלה:', q: `${ex(`${fmt(from)} + ${i * stepV} = ?`)}`, ask: num(v), visual: numberLine({ from, to, ticks: 10, labels: 'all', mark: v }) },
    ],
  };
}

// =====================================================================
// 6. בעיות מילוליות
// =====================================================================
const SHOP = [
  { name: 'חולצה', one: 'אחת', each: 'כל אחת', plural: 'חולצות', emoji: '👕', price: 100 },
  { name: 'חגורה', one: 'אחת', each: 'כל אחת', plural: 'חגורות', emoji: '🪢', price: 20 },
  { name: 'חצאית', one: 'אחת', each: 'כל אחת', plural: 'חצאיות', emoji: '👗', price: 80 },
  { name: 'כובע', one: 'אחד', each: 'כל אחד', plural: 'כובעים', emoji: '🧢', price: 40 },
];

function shopTable(items) {
  return `<div class="shop">${items.map((it) => `<div class="shop-item"><span class="shop-emoji">${it.emoji}</span><b>${it.name}</b><span>${it.price} ש״ח</span></div>`).join('')}</div>`;
}

function genWord(level, rng) {
  const t = level === 0 ? int(0, 1, rng) : level === 1 ? int(2, 3, rng) : int(4, 5, rng);
  if (t === 0) {
    const N = pick([90, 100, 110, 120], rng);
    const c1 = int(26, 36, rng);
    const c2 = int(26, 36, rng);
    const c3 = N - c1 - c2;
    return {
      prompt: `בבית הספר לומדים <b>${N}</b> תלמידים בכיתות ד׳.<br>בכיתה ד1 לומדים <b>${c1}</b>, בכיתה ד2 לומדים <b>${c2}</b>,<br>והשאר בכיתה ד3. כמה תלמידים בכיתה ד3?`,
      answer: num(c3),
      tip: 'מה ידוע? מה שואלים?',
      steps: [
        { say: `<b>מה ידוע?</b> כולם ביחד ${N}. ד1 = ${c1}, ד2 = ${c2}.<br><b>מה שואלים?</b> כמה נשארו לד3.`, q: 'מה התוכנית?', ask: choice(`${N} − ${c1} − ${c2}`, [`${N} − ${c1} − ${c2}`, `${N} + ${c1} + ${c2}`, `${c1} + ${c2}`], rng) },
        { say: 'קודם נחשב כמה תלמידים בד1 ובד2 ביחד:', q: `${ex(`${c1} + ${c2} = ?`)}`, ask: num(c1 + c2) },
        { say: 'עכשיו מורידים אותם מכל התלמידים:', q: `${ex(`${N} − ${c1 + c2} = ?`)}`, ask: num(c3), after: `בדיקה: ${ex(`${c1} + ${c2} + ${c3} = ${N}`)} ✔` },
      ],
    };
  }
  if (t === 1) {
    const items = shuffle(SHOP, rng).slice(0, 3);
    const [X, Y] = items;
    const n = int(2, 3, rng);
    const total = n * X.price + Y.price;
    return {
      prompt: `בחנות "הבגד" קנתה נועה <b>${n} ${X.plural}</b> ו<b>${Y.name} ${Y.one}</b>. כמה שילמה?`,
      visual: shopTable(items),
      answer: num(total),
      tip: 'כמה פעמים אותו מחיר → כפל',
      steps: [
        { say: `${n} ${X.plural}, ${X.each} ${X.price} ש״ח. כמה פעמים אותו מחיר → <b>כפל</b>.`, q: `${ex(`${n} × ${X.price} = ?`)}`, ask: num(n * X.price) },
        { say: `ועוד ${Y.name} ${Y.one} ב-${Y.price} ש״ח:`, q: `${ex(`${n * X.price} + ${Y.price} = ?`)}`, ask: num(total) },
      ],
    };
  }
  if (t === 2) {
    const k = pick([4, 5, 6, 10], rng);
    const m = int(3, 9, rng);
    const N = k * m;
    return {
      prompt: `<b>${N}</b> תלמידים יצאו לטיול. הם התחלקו לקבוצות, ובכל קבוצה <b>${k}</b> תלמידים.<br>לכמה קבוצות התחלקו?`,
      answer: num(m),
      tip: 'מחלקים לקבוצות שוות → חילוק',
      steps: [
        { say: 'מחלקים את כולם לקבוצות <b>שוות</b>. איזו פעולה?', q: 'איזו פעולה?', ask: choice('חילוק :', ['חילוק :', 'כפל ×', 'חיבור +', 'חיסור −'], rng, true) },
        { say: `כמה קבוצות של ${k} יש ב-${N}?`, q: `${ex(`${N} : ${k} = ?`)}`, ask: num(m), after: `בדיקה: ${ex(`${m} × ${k} = ${N}`)} ✔` },
      ],
    };
  }
  if (t === 3) {
    const b = pick([3, 4, 5, 6], rng);
    const q = int(4, 9, rng);
    const a = b * q;
    const stories = {
      div: `${a} ילדים התחלקו לקבוצות של ${b}. כמה קבוצות יש?`,
      sub: `במגרש היו ${a} ילדים. ${b} ילדים הלכו הביתה. כמה נשארו?`,
      mul: `יש ${b} קבוצות, ובכל קבוצה ${a} ילדים. כמה ילדים יש?`,
    };
    return {
      expr: `${a} : ${b}`,
      prompt: 'איזה סיפור מתאים לתרגיל?',
      answer: choice(stories.div, Object.values(stories), rng),
      tip: 'חילוק = חלוקה לקבוצות שוות',
      steps: [
        { say: `${ex(`${a} : ${b}`)} פירושו: יש <b>${a}</b> דברים, ומחלקים אותם <b>לקבוצות שוות</b> של ${b}.`, q: 'באיזה סיפור מחלקים לקבוצות שוות?', ask: choice('מחלקים לקבוצות', ['מחלקים לקבוצות', 'מישהו הולך', 'מוסיפים קבוצות'], rng) },
        { say: `"הלכו הביתה" זה <b>חיסור</b>, ו"בכל קבוצה... כמה יש" זה <b>כפל</b>. אז נשאר רק סיפור אחד!` },
      ],
    };
  }
  if (t === 4) {
    const N = 100;
    const k = pick([5, 10], rng);
    const c1 = int(23, 28, rng);
    const c2 = int(23, 28, rng);
    let c3;
    do { c3 = int(20, 30, rng); } while ((N - c1 - c2 - c3) % k !== 0 || N - c1 - c2 - c3 <= 0);
    const c4 = N - c1 - c2 - c3;
    return {
      prompt: `בשכבה יש <b>${N}</b> תלמידים. בד1 ${c1}, בד2 ${c2}, בד3 ${c3}, והשאר בד4.<br>תלמידי ד4 התחלקו לקבוצות של <b>${k}</b>. כמה קבוצות?`,
      answer: num(c4 / k),
      tip: 'בעיה בשני שלבים',
      steps: [
        { say: '<b>שלב 1</b>: כמה תלמידים בד1, ד2, ד3 ביחד?', q: `${ex(`${c1} + ${c2} + ${c3} = ?`)}`, ask: num(c1 + c2 + c3) },
        { say: 'כמה נשארו לד4?', q: `${ex(`${N} − ${c1 + c2 + c3} = ?`)}`, ask: num(c4) },
        { say: `<b>שלב 2</b>: מחלקים ${c4} תלמידים לקבוצות של ${k}.`, q: `${ex(`${c4} : ${k} = ?`)}`, ask: num(c4 / k) },
      ],
    };
  }
  const priceA = pick([100, 50], rng);
  const priceB = pick([20, 30], rng);
  const n = int(2, 4, rng);
  const S = n * priceA + priceB;
  return {
    prompt: `רונית שילמה בדיוק <b>${S}</b> ש״ח. היא קנתה כובע אחד ב-${priceB} ש״ח, ועוד חולצות ב-${priceA} ש״ח כל אחת.<br>כמה חולצות קנתה?`,
    answer: num(n),
    tip: 'מורידים את מה שידוע, ומחלקים',
    steps: [
      { say: `מתוך ${S} ש״ח, ${priceB} ש״ח הלכו על הכובע. כמה נשאר לחולצות?`, q: `${ex(`${S} − ${priceB} = ?`)}`, ask: num(S - priceB) },
      { say: `כל חולצה ${priceA} ש״ח. כמה פעמים ${priceA} נכנס ב-${S - priceB}?`, q: `${ex(`${S - priceB} : ${priceA} = ?`)}`, ask: num(n), after: `בדיקה: ${ex(`${n} × ${priceA} + ${priceB} = ${S}`)} ✔` },
    ],
  };
}

// =====================================================================
// 7. היקף
// =====================================================================
function genPerimeter(level, rng) {
  if (level === 0) {
    const w = int(2, 6, rng);
    const h = int(2, 4, rng);
    const P = 2 * (w + h);
    const base = { cols: w + 3, rows: h + 2, w, h, x: 2, y: 1 };
    return {
      prompt: 'לפניכם סרטוט. מהו <b>היקף</b> המלבן הצבוע (בס״מ)?',
      visual: gridRect(base),
      answer: num(P),
      tip: 'היקף = מסביב, לא בפנים!',
      steps: [
        { say: '<b>היקף</b> = כל הדרך <b>מסביב</b>, כמו נמלה שהולכת על הקווים 🐜.<br><b>לא</b> סופרים משבצות בפנים (זה שטח).<br>נתחיל מהצלע <b>העליונה</b> — כמה משבצות לאורכה?', q: 'אורך הצלע העליונה (ס״מ)', ask: num(w), visual: gridRect({ ...base, highlight: ['top'] }) },
        { say: 'עכשיו הצלע <b>הצדדית</b>:', q: 'אורך הצלע הצדדית (ס״מ)', ask: num(h), visual: gridRect({ ...base, highlight: ['right'] }) },
        { say: `במלבן: למטה שווה ללמעלה (${w}), ושמאל שווה לימין (${h}).<br>מחברים את <b>ארבע</b> הצלעות:`, q: `${ex(`${w} + ${h} + ${w} + ${h} = ?`)}`, ask: num(P), visual: gridRect({ ...base, highlight: ['top', 'right', 'bottom', 'left'] }) },
      ],
    };
  }
  if (level === 1) {
    const square = rng() < 0.35;
    const w = int(3, 15, rng);
    const h = square ? w : int(2, 12, rng);
    const P = 2 * (w + h);
    const name = square ? 'ריבוע' : 'מלבן';
    return {
      prompt: square
        ? `אורך צלע של <b>ריבוע</b> הוא <b>${w}</b> ס״מ. מהו ההיקף שלו?`
        : `ל<b>מלבן</b> יש צלע באורך <b>${w}</b> ס״מ וצלע באורך <b>${h}</b> ס״מ. מהו ההיקף שלו?`,
      visual: `<svg class="viz" viewBox="0 0 220 140"><rect x="30" y="20" width="${square ? 100 : 160}" height="100" fill="#bfe9e3" stroke="#1d2b4f" stroke-width="3"/><text x="${square ? 80 : 110}" y="14" text-anchor="middle" font-size="14" font-weight="700">${w}</text><text x="${square ? 150 : 205}" y="75" text-anchor="middle" font-size="14" font-weight="700">${h}</text><text x="${square ? 80 : 110}" y="136" text-anchor="middle" font-size="14" fill="#8aa">?</text><text x="18" y="75" text-anchor="middle" font-size="14" fill="#8aa">?</text></svg>`,
      answer: num(P),
      tip: `ל${name} 4 צלעות`,
      steps: square
        ? [
          { say: 'בריבוע <b>כל ארבע הצלעות שוות</b>.', q: `${ex(`${w} + ${w} + ${w} + ${w} = ?`)} (או ${ex(`4 × ${w}`)})`, ask: num(P) },
        ]
        : [
          { say: `צלע אחת ${w} ס״מ — והצלע <b>שמולה</b> גם ${w}.`, q: `${ex(`${w} + ${w} = ?`)}`, ask: num(2 * w) },
          { say: `צלע שנייה ${h} ס״מ — והצלע שמולה גם ${h}.`, q: `${ex(`${h} + ${h} = ?`)}`, ask: num(2 * h) },
          { say: 'מחברים הכול:', q: `${ex(`${2 * w} + ${2 * h} = ?`)}`, ask: num(P) },
        ],
    };
  }
  const w = int(2, 9, rng);
  const h = int(2, 12, rng);
  const P = 2 * (w + h);
  return {
    prompt: `היקף מלבן הוא <b>${P}</b> ס״מ. צלע אחת שלו <b>${w}</b> ס״מ. מה אורך הצלע השנייה?`,
    answer: num(h),
    tip: 'הפוך: מתחילים מההיקף',
    steps: [
      { say: `יש <b>שתי</b> צלעות של ${w} ס״מ (הצלע ומולה).`, q: `${ex(`${w} + ${w} = ?`)}`, ask: num(2 * w) },
      { say: 'מורידים אותן מההיקף — מה שנשאר זה שתי הצלעות האחרות ביחד:', q: `${ex(`${P} − ${2 * w} = ?`)}`, ask: num(2 * h) },
      { say: 'שתי צלעות שוות — מחלקים לשתיים:', q: `${ex(`${2 * h} : 2 = ?`)}`, ask: num(h), after: `בדיקה: ${ex(`${w} + ${h} + ${w} + ${h} = ${P}`)} ✔` },
    ],
  };
}

// =====================================================================
// 8. זוויות ומקבילות
// =====================================================================
const angleType = (deg) => (deg === 90 ? 'ישרה' : deg < 90 ? 'חדה' : 'קהה');

function genShapes(level, rng) {
  if (level === 0) {
    const kind = int(0, 2, rng);
    const deg = kind === 0 ? int(25, 70, rng) : kind === 1 ? 90 : int(110, 160, rng);
    const type = angleType(deg);
    const cmp = deg === 90 ? 'שווה לפינת הדף' : deg < 90 ? 'קטנה מפינת הדף' : 'גדולה מפינת הדף';
    return {
      prompt: 'איזו זווית זו?',
      visual: angleSvg(deg),
      answer: choice(type, ['חדה', 'ישרה', 'קהה'], rng, true),
      tip: 'משווים לפינה של דף',
      steps: [
        { say: 'מניחים "פינה של דף" (זווית ישרה) על הזווית ומשווים.', q: 'הזווית…', ask: choice(cmp, ['קטנה מפינת הדף', 'שווה לפינת הדף', 'גדולה מפינת הדף'], rng, true), visual: angleSvg(deg, { showRight: true }) },
        { say: 'קטנה מפינת דף = <b>חדה</b> 🔪 · שווה = <b>ישרה</b> 📄 · גדולה = <b>קהה</b> 🪭' },
      ],
    };
  }
  if (level === 1) {
    let pts;
    let angles;
    do {
      const bx = int(8, 10, rng);
      const ry = int(3, 6, rng);
      const ax = int(2, 5, rng);
      pts = [[1, 1], [bx, 1], [bx, ry], [ax, 8]];
      angles = pts.map((_, i) => angleAt(pts, i));
    } while (angles.some((a, i) => i !== 1 && Math.abs(a - 90) < 14) || new Set(angles).size < 4);
    const labels = ['1', '4', '3', '2'];
    const askRight = rng() < 0.5;
    const target = askRight ? 1 : angles.indexOf(Math.max(...angles));
    const opts = ['זווית 1', 'זווית 2', 'זווית 3', 'זווית 4'];
    const order = [0, 3, 2, 1]; // label 1,2,3,4 → point index
    return {
      prompt: askRight ? 'איזו מהזוויות של המרובע היא זווית <b>ישרה</b>?' : 'איזו מהזוויות של המרובע היא <b>הגדולה ביותר</b>?',
      visual: quadSvg(pts, { labels }),
      answer: choice(`זווית ${labels[target]}`, opts, rng, true),
      tip: 'בודקים כל זווית לבד',
      steps: [
        ...order.map((pi) => ({
          say: `בודקים את <b>זווית ${labels[pi]}</b> (מסומנת באדום). משווים לפינת דף.`,
          q: `זווית ${labels[pi]} היא…`,
          ask: choice(angleType(angles[pi]), ['חדה', 'ישרה', 'קהה'], rng, true),
          visual: quadSvg(pts, { labels, highlight: pi }),
        })),
        { say: askRight ? 'הזווית הישרה היא זו שנראית בדיוק כמו פינת דף.' : 'הזווית הגדולה ביותר היא הקהה ש"הכי פתוחה".' },
      ],
    };
  }
  // parallel sides
  const isTrap = rng() < 0.5;
  const L = ['א', 'ב', 'ג', 'ד'];
  const sides = isTrap
    ? [[3, 7, 8, 7], [8, 7, 11, 1], [11, 1, 1, 1], [1, 1, 3, 7]]
    : [[1, 7, 11, 7], [11, 7, 11, 1], [11, 1, 1, 1], [1, 1, 1, 7]];
  const bold = isTrap ? int(0, 1, rng) * 2 : int(0, 3, rng);
  const ans = (bold + 2) % 4;
  const labeled = sides.map((s, i) => [...s, L[i]]);
  const dir = (s) => (s[1] === s[3] ? 'שוכבת' : s[0] === s[2] ? 'עומדת' : 'באלכסון');
  return {
    prompt: `איזו צלע <b>מקבילה</b> לצלע המודגשת (${L[bold]})?`,
    visual: sidesSvg(labeled, { bold }),
    answer: choice(`צלע ${L[ans]}`, L.filter((_, i) => i !== bold).map((l) => `צלע ${l}`), rng, true),
    tip: 'מקבילות לא נפגשות לעולם 🛤️',
    steps: [
      { say: 'קווים מקבילים הולכים <b>באותו כיוון</b> ולעולם לא נפגשים — כמו פסי רכבת 🛤️.', q: `צלע ${L[bold]} היא…`, ask: choice(dir(sides[bold]), ['שוכבת', 'עומדת', 'באלכסון'], rng, true) },
      { say: `צלע שנוגעת בצלע ${L[bold]} <b>לא</b> יכולה להיות מקבילה לה — הן נפגשות! אילו צלעות נוגעות בה?`, q: 'הצלעות שנוגעות בה:', ask: choice(`${L[(bold + 1) % 4]} ו-${L[(bold + 3) % 4]}`, [`${L[(bold + 1) % 4]} ו-${L[(bold + 3) % 4]}`, `${L[(bold + 2) % 4]} ו-${L[(bold + 1) % 4]}`, `${L[(bold + 2) % 4]} ו-${L[(bold + 3) % 4]}`], rng) },
      { say: `נשארה רק צלע ${L[ans]} — היא ${dir(sides[ans])} בדיוק כמו ${L[bold]}, והן לא נפגשות.`, visual: sidesSvg(labeled, { bold, answer: ans }) },
    ],
  };
}

// =====================================================================
// 9. דיאגרמת עמודות
// =====================================================================
const KIDS = ['רמי', 'מתן', 'ערן', 'יובל', 'נועה', 'שירה', 'דנה', 'עומר', 'מאיה', 'תמר'];

function genBars(level, rng) {
  const names = shuffle(KIDS, rng).slice(0, 4);
  const values = shuffle([50, 75, 100, 125, 150, 175], rng).slice(0, 4);
  const bars = names.map((name, i) => ({ name, value: values[i] }));
  const chart = (opts = {}) => barChart({ bars, max: 200, step: 25, ...opts });
  if (level === 0) {
    const b = pick(bars, rng);
    return {
      prompt: `הדיאגרמה מראה את הגובה של ילדים (בס״מ). מה הגובה של <b>${b.name}</b>?`,
      visual: chart(),
      answer: num(b.value),
      tip: 'מהעמודה, בקו ישר, אל הציר',
      steps: [
        { say: `מוצאים את העמודה של ${b.name}. מהראש של העמודה הולכים <b>בקו ישר</b> שמאלה אל המספרים.`, q: 'לאיזה מספר מגיע הקו?', ask: num(b.value), visual: chart({ highlight: b.name, guideAt: b.name }) },
      ],
    };
  }
  if (level === 1) {
    const letters = ['א', 'ב', 'ג', 'ד'];
    const lettered = bars.map((b, i) => ({ ...b, name: letters[i], real: b.name }));
    const sorted = [...lettered].sort((x, y) => y.value - x.value);
    const tallest = sorted[0];
    const shortest = sorted[3];
    const mid = [sorted[1], sorted[2]];
    const clues = `<div class="clue-box"><b>${tallest.real}</b> הוא הגבוה ביותר.<br><b>${shortest.real}</b> הוא הנמוך ביותר.<br><b>${mid[0].real}</b> גבוה יותר מ<b>${mid[1].real}</b>.</div>`;
    const target = pick(lettered, rng);
    const chartL = (opts = {}) => barChart({ bars: lettered, max: 200, step: 25, ...opts });
    return {
      prompt: `${clues}מה השם של ילד <b>${target.name}</b>?`,
      visual: chartL(),
      answer: choice(target.real, names, rng),
      tip: 'משתמשים ברמזים אחד אחד',
      steps: [
        { say: `רמז 1: ${tallest.real} הוא הגבוה ביותר. איזו עמודה הכי גבוהה?`, q: 'העמודה הגבוהה ביותר:', ask: choice(tallest.name, letters, rng, true), after: `אז ${tallest.name} = ${tallest.real}`, visual: chartL({ highlight: tallest.name }) },
        { say: `רמז 2: ${shortest.real} הוא הנמוך ביותר. איזו עמודה הכי נמוכה?`, q: 'העמודה הנמוכה ביותר:', ask: choice(shortest.name, letters, rng, true), after: `אז ${shortest.name} = ${shortest.real}`, visual: chartL({ highlight: shortest.name }) },
        { say: `רמז 3: ${mid[0].real} גבוה יותר מ${mid[1].real}. מבין ${mid[0].name} ו-${mid[1].name}, מי גבוה יותר?`, q: 'הגבוה מבין השניים:', ask: choice(mid[0].name, [mid[0].name, mid[1].name].sort(), rng, true), after: `אז ${mid[0].name} = ${mid[0].real}, ו-${mid[1].name} = ${mid[1].real}` },
      ],
    };
  }
  const X = pick(bars.filter((b) => b.value > Math.min(...values)), rng);
  const lower = pick(bars.filter((b) => b.value < X.value), rng);
  return {
    prompt: `בכמה ס״מ <b>${X.name}</b> גבוה יותר מ<b>${lower.name}</b>?`,
    visual: chart(),
    answer: num(X.value - lower.value),
    tip: '"בכמה יותר" → חיסור',
    steps: [
      { say: `קודם קוראים את הגובה של ${X.name}:`, q: `הגובה של ${X.name}`, ask: num(X.value), visual: chart({ highlight: X.name, guideAt: X.name }) },
      { say: `עכשיו של ${lower.name}:`, q: `הגובה של ${lower.name}`, ask: num(lower.value), visual: chart({ highlight: lower.name, guideAt: lower.name }) },
      { say: '"בכמה יותר" → מחסירים את הקטן מהגדול:', q: `${ex(`${X.value} − ${lower.value} = ?`)}`, ask: num(X.value - lower.value) },
    ],
  };
}

// =====================================================================
const GENERATORS = {
  order: genOrder,
  column: genColumn,
  mult: genMult,
  remainder: genRemainder,
  numberline: genNumberline,
  word: genWord,
  perimeter: genPerimeter,
  shapes: genShapes,
  bars: genBars,
};

export function makeExercise(topic, level, seed) {
  const gen = GENERATORS[topic];
  if (!gen) throw new Error(`unknown topic: ${topic}`);
  const ex0 = gen(level, lcg(seed));
  return { ...ex0, topic, level, seed, srsKey: `${topic}:${level}:${seed}` };
}

export function exerciseFromKey(key) {
  const [topic, level, seed] = key.split(':');
  if (!GENERATORS[topic]) return null;
  const lv = Number(level);
  const sd = Number(seed);
  if (!(lv >= 0 && lv <= 2) || !Number.isFinite(sd)) return null;
  return makeExercise(topic, lv, sd);
}

export const isTopicKey = (key) => Boolean(GENERATORS[String(key).split(':')[0]]) && String(key).split(':').length === 3;
