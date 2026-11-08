// SVG / HTML drawings used inside exercises. Pure string builders (no DOM).
import { fmt } from './rng.js';

const INK = '#1d2b4f';
const SOFT = '#c9dcf0';
const ACCENT = '#ff6b6b';
const FILL = '#bfe9e3';

// ---------- grid rectangle (perimeter) ----------
export function gridRect({ cols, rows, w, h, x = 1, y = 1, showLegend = true, highlight = [] }) {
  const u = 30;
  const pad = 8;
  const W = cols * u + pad * 2;
  const H = rows * u + pad * 2;
  const lines = [];
  for (let c = 0; c <= cols; c++) lines.push(`<line x1="${pad + c * u}" y1="${pad}" x2="${pad + c * u}" y2="${pad + rows * u}" stroke="${SOFT}" stroke-dasharray="3 3"/>`);
  for (let r = 0; r <= rows; r++) lines.push(`<line x1="${pad}" y1="${pad + r * u}" x2="${pad + cols * u}" y2="${pad + r * u}" stroke="${SOFT}" stroke-dasharray="3 3"/>`);
  const rx = pad + x * u;
  const ry = pad + y * u;
  const sides = {
    top: [rx, ry, rx + w * u, ry],
    right: [rx + w * u, ry, rx + w * u, ry + h * u],
    bottom: [rx, ry + h * u, rx + w * u, ry + h * u],
    left: [rx, ry, rx, ry + h * u],
  };
  const hl = highlight.map((s) => {
    const [x1, y1, x2, y2] = sides[s];
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/>`;
  }).join('');
  const legend = showLegend
    ? `<rect x="${pad}" y="${pad}" width="${u}" height="${u}" fill="#fff4c2" stroke="${INK}" stroke-width="2"/>`
    : '';
  return `<svg class="viz" viewBox="0 0 ${W} ${H}" role="img" aria-label="מלבן על משבצות">
    ${lines.join('')}
    ${legend}
    <rect x="${rx}" y="${ry}" width="${w * u}" height="${h * u}" fill="${FILL}" stroke="${INK}" stroke-width="3"/>
    ${hl}
  </svg>${showLegend ? '<p class="viz-note">🟨 כל משבצת: 1 ס״מ על 1 ס״מ</p>' : ''}`;
}

// ---------- bar chart ----------
export function barChart({ bars, max, step, unit = 'ס״מ', highlight = null, guideAt = null }) {
  const left = 52;
  const top = 14;
  const plotH = 200;
  const barW = 44;
  const gap = 26;
  const W = left + bars.length * (barW + gap) + 10;
  const H = top + plotH + 40;
  const yOf = (v) => top + plotH - (v / max) * plotH;
  const grid = [];
  for (let v = 0; v <= max; v += step) {
    grid.push(`<line x1="${left}" y1="${yOf(v)}" x2="${W - 6}" y2="${yOf(v)}" stroke="${SOFT}"/>`);
    grid.push(`<text x="${left - 8}" y="${yOf(v) + 5}" font-size="13" text-anchor="end" fill="${INK}">${v}</text>`);
  }
  const palette = ['#7cc6fe', '#ffd166', '#9b8cff', '#2ec4b6', '#ff9f80'];
  const rects = bars.map((b, i) => {
    const x = left + gap / 2 + i * (barW + gap);
    const isHl = highlight === b.name;
    return `<rect x="${x}" y="${yOf(b.value)}" width="${barW}" height="${plotH + top - yOf(b.value)}" rx="6"
        fill="${palette[i % palette.length]}" stroke="${isHl ? ACCENT : 'none'}" stroke-width="4"/>
      <text x="${x + barW / 2}" y="${top + plotH + 22}" font-size="15" text-anchor="middle" fill="${INK}" font-weight="700">${b.name}</text>`;
  }).join('');
  const guide = guideAt == null ? '' : (() => {
    const i = bars.findIndex((b) => b.name === guideAt);
    const b = bars[i];
    const x = left + gap / 2 + i * (barW + gap);
    return `<line x1="${x}" y1="${yOf(b.value)}" x2="${left}" y2="${yOf(b.value)}" stroke="${ACCENT}" stroke-width="3" stroke-dasharray="6 4"/>`;
  })();
  return `<svg class="viz" viewBox="0 0 ${W} ${H}" role="img" aria-label="דיאגרמת עמודות">
    <text x="30" y="10" font-size="11" text-anchor="middle" fill="${INK}">${unit}</text>
    ${grid.join('')}
    <line x1="${left}" y1="${top}" x2="${left}" y2="${top + plotH}" stroke="${INK}" stroke-width="2"/>
    ${rects}${guide}
  </svg>`;
}

// ---------- number line ----------
export function numberLine({ from, to, ticks = 10, labels = 'ends', segment = null, points = [], mark = null }) {
  const W = 340;
  const x0 = 24;
  const x1 = W - 24;
  const y = 44;
  const xOf = (v) => x0 + ((v - from) / (to - from)) * (x1 - x0);
  const parts = [`<line x1="6" y1="${y}" x2="${W - 6}" y2="${y}" stroke="${INK}" stroke-width="2.5"/>`,
    `<polygon points="${W - 4},${y} ${W - 14},${y - 6} ${W - 14},${y + 6}" fill="${INK}"/>`,
    `<polygon points="4,${y} 14,${y - 6} 14,${y + 6}" fill="${INK}"/>`];
  for (let i = 0; i <= ticks; i++) {
    const v = from + ((to - from) * i) / ticks;
    const x = xOf(v);
    parts.push(`<line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 8}" stroke="${INK}" stroke-width="2"/>`);
    if (labels === 'all' || i === 0 || i === ticks) {
      parts.push(`<text x="${x}" y="${y + 28}" font-size="${labels === 'all' ? 10 : 14}" text-anchor="middle" fill="${INK}" font-weight="700">${fmt(v)}</text>`);
    }
  }
  if (segment) {
    parts.push(`<line x1="${xOf(segment[0])}" y1="${y}" x2="${xOf(segment[1])}" y2="${y}" stroke="${INK}" stroke-width="8"/>`);
  }
  if (mark != null) {
    const x = xOf(mark);
    parts.push(`<path d="M ${x} ${y - 12} l -8 -14 h 16 z" fill="${ACCENT}"/>`);
  }
  for (const p of points) {
    parts.push(`<circle cx="${xOf(p.value)}" cy="${y}" r="7" fill="${p.color || ACCENT}" stroke="#fff" stroke-width="2"/>`);
    if (p.label) parts.push(`<text x="${xOf(p.value)}" y="${y - 16}" font-size="12" text-anchor="middle" fill="${p.color || ACCENT}" font-weight="700">${p.label}</text>`);
  }
  return `<svg class="viz ltr" viewBox="0 0 ${W} 84" role="img" aria-label="ישר המספרים">${parts.join('')}</svg>`;
}

// ---------- a single angle ----------
export function angleSvg(deg, { showRight = false } = {}) {
  const cx = 60;
  const cy = 130;
  const r = 110;
  const rad = (deg * Math.PI) / 180;
  const ex = cx + r * Math.cos(rad);
  const ey = cy - r * Math.sin(rad);
  const arcR = 26;
  const ax = cx + arcR * Math.cos(rad);
  const ay = cy - arcR * Math.sin(rad);
  const large = deg > 180 ? 1 : 0;
  const right = showRight
    ? `<g opacity=".55"><rect x="${cx}" y="${cy - 70}" width="70" height="70" fill="#ffe9a8" stroke="#e0b100" stroke-dasharray="5 4"/>
       <text x="${cx + 35}" y="${cy - 30}" font-size="11" text-anchor="middle" fill="#8a6d00">פינת דף</text></g>`
    : '';
  const marker = deg === 90
    ? `<path d="M ${cx + 18} ${cy} V ${cy - 18} H ${cx}" fill="none" stroke="${ACCENT}" stroke-width="3"/>`
    : `<path d="M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${large} 0 ${ax} ${ay}" fill="none" stroke="${ACCENT}" stroke-width="3"/>`;
  return `<svg class="viz" viewBox="0 0 220 150" role="img" aria-label="זווית">
    ${right}
    <line x1="${cx}" y1="${cy}" x2="${cx + r + 30}" y2="${cy}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    ${marker}
  </svg>`;
}

// ---------- quadrilateral with numbered angles ----------
export function angleAt(points, i) {
  const p = points[i];
  const a = points[(i + points.length - 1) % points.length];
  const b = points[(i + 1) % points.length];
  const v1 = [a[0] - p[0], a[1] - p[1]];
  const v2 = [b[0] - p[0], b[1] - p[1]];
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const m = Math.hypot(...v1) * Math.hypot(...v2);
  return Math.round((Math.acos(dot / m) * 180) / Math.PI);
}

export function quadSvg(points, { labels = ['1', '2', '3', '4'], highlight = null } = {}) {
  const u = 22;
  const pad = 14;
  const cols = 12;
  const rows = 9;
  const W = cols * u + pad * 2;
  const H = rows * u + pad * 2;
  const px = (p) => [pad + p[0] * u, pad + (rows - p[1]) * u];
  const grid = [];
  for (let c = 0; c <= cols; c++) grid.push(`<line x1="${pad + c * u}" y1="${pad}" x2="${pad + c * u}" y2="${pad + rows * u}" stroke="${SOFT}"/>`);
  for (let r = 0; r <= rows; r++) grid.push(`<line x1="${pad}" y1="${pad + r * u}" x2="${pad + cols * u}" y2="${pad + r * u}" stroke="${SOFT}"/>`);
  const pts = points.map(px);
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const lbl = pts.map((p, i) => {
    const dx = cx - p[0];
    const dy = cy - p[1];
    const d = Math.hypot(dx, dy) || 1;
    const lx = p[0] + (dx / d) * 22;
    const ly = p[1] + (dy / d) * 22 + 5;
    const on = highlight === i;
    return `<circle cx="${lx}" cy="${ly - 5}" r="11" fill="${on ? ACCENT : '#fff'}" stroke="${on ? ACCENT : INK}" stroke-width="1.5"/>
      <text x="${lx}" y="${ly}" font-size="13" text-anchor="middle" font-weight="700" fill="${on ? '#fff' : INK}">${labels[i]}</text>`;
  }).join('');
  return `<svg class="viz" viewBox="0 0 ${W} ${H}" role="img" aria-label="מרובע">
    ${grid.join('')}
    <polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${FILL}" fill-opacity=".55" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    ${lbl}
  </svg>`;
}

// ---------- shape with named sides (parallel lines) ----------
// sides: [[x1,y1,x2,y2,label], ...] in grid units; bold: index of the given side.
export function sidesSvg(sides, { bold = 0, answer = null } = {}) {
  const u = 24;
  const pad = 22;
  const W = 12 * u + pad * 2;
  const H = 8 * u + pad * 2;
  const P = (x, y) => [pad + x * u, pad + (8 - y) * u];
  const segs = sides.map(([x1, y1, x2, y2, label], i) => {
    const [a, b] = P(x1, y1);
    const [c, d] = P(x2, y2);
    const mx = (a + c) / 2;
    const my = (b + d) / 2;
    const isBold = i === bold;
    const isAns = i === answer;
    const color = isAns ? '#2ec4b6' : isBold ? ACCENT : INK;
    const nx = -(d - b);
    const ny = c - a;
    const nl = Math.hypot(nx, ny) || 1;
    return `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${color}" stroke-width="${isBold || isAns ? 7 : 3}" stroke-linecap="round"/>
      <text x="${mx + (nx / nl) * 16}" y="${my + (ny / nl) * 16 + 5}" font-size="15" text-anchor="middle" font-weight="700" fill="${color}">${label}</text>`;
  }).join('');
  return `<svg class="viz" viewBox="0 0 ${W} ${H}" role="img" aria-label="צורה">${segs}</svg>`;
}

// ---------- dots in groups (division with remainder) ----------
export function dotsGroups(total, size, { grouped = false } = {}) {
  const groups = Math.floor(total / size);
  const rest = total % size;
  const r = 7;
  const gapIn = 18;
  const perRow = 5;
  const boxW = Math.min(size, perRow) * gapIn + 10;
  const boxH = Math.ceil(size / perRow) * gapIn + 10;
  const cols = Math.max(1, Math.floor(330 / (boxW + 8)));
  const items = [];
  let k = 0;
  const all = grouped ? groups + (rest ? 1 : 0) : 0;
  if (!grouped) {
    const per = 10;
    for (let i = 0; i < total; i++) {
      items.push(`<circle cx="${14 + (i % per) * 22}" cy="${14 + Math.floor(i / per) * 22}" r="${r}" fill="#7cc6fe"/>`);
    }
    const h = Math.ceil(total / per) * 22 + 6;
    return `<svg class="viz" viewBox="0 0 230 ${h}" role="img" aria-label="${total} נקודות">${items.join('')}</svg>`;
  }
  for (let g = 0; g < all; g++) {
    const isRest = g === groups;
    const n = isRest ? rest : size;
    const gx = 4 + (g % cols) * (boxW + 8);
    const gy = 4 + Math.floor(g / cols) * (boxH + 8);
    items.push(`<rect x="${gx}" y="${gy}" width="${boxW}" height="${boxH}" rx="10" fill="${isRest ? '#ffe3e3' : '#e6f6ff'}" stroke="${isRest ? ACCENT : '#7cc6fe'}" stroke-width="2" ${isRest ? 'stroke-dasharray="5 4"' : ''}/>`);
    for (let i = 0; i < n; i++) {
      items.push(`<circle cx="${gx + 14 + (i % perRow) * gapIn}" cy="${gy + 14 + Math.floor(i / perRow) * gapIn}" r="${r}" fill="${isRest ? ACCENT : '#3a86ff'}"/>`);
      k += 1;
    }
  }
  const rowsUsed = Math.ceil(all / cols);
  return `<svg class="viz" viewBox="0 0 340 ${rowsUsed * (boxH + 8) + 6}" role="img" aria-label="קבוצות">${items.join('')}</svg>`;
}

// ---------- column arithmetic (HTML, LTR) ----------
// state: { tops: digit[] (possibly rewritten after borrowing), origTops, bottoms, result: (digit|null)[], carries: (n|null)[], active: col index from right }
export function columnHtml({ a, b, op, result = [], carries = [], tops = null, active = -1 }) {
  const width = Math.max(String(a).length, String(b).length, String(op === '+' ? a + b : a).length);
  const pad = (n) => String(n).padStart(width, ' ').split('');
  const A = pad(a);
  const B = pad(b);
  const cell = (ch, i, cls = '') => {
    const col = width - 1 - i;
    return `<span class="col-cell ${col === active ? 'col-cell--active' : ''} ${cls}">${ch === ' ' ? '' : ch}</span>`;
  };
  const carryRow = Array.from({ length: width }, (_, i) => {
    const col = width - 1 - i;
    const c = carries[col];
    return cell(c == null ? '' : String(c), i, 'col-cell--carry');
  }).join('');
  const topRow = A.map((ch, i) => {
    const col = width - 1 - i;
    const t = tops ? tops[col] : null;
    if (t != null && ch !== ' ' && Number(ch) !== t) {
      return cell(`<s>${ch}</s><b class="new-top">${t}</b>`, i);
    }
    return cell(ch, i);
  }).join('');
  const botRow = B.map((ch, i) => cell(ch, i)).join('');
  const resRow = Array.from({ length: width }, (_, i) => {
    const col = width - 1 - i;
    const r = result[col];
    return cell(r == null ? '' : String(r), i, 'col-cell--res');
  }).join('');
  return `<div class="column-math ltr" style="--cols:${width}">
    <div class="col-row col-row--carry">${carryRow}</div>
    <div class="col-row">${topRow}</div>
    <div class="col-row col-row--op"><span class="col-op">${op === '-' ? '−' : '+'}</span>${botRow}</div>
    <div class="col-line"></div>
    <div class="col-row">${resRow}</div>
  </div>`;
}
