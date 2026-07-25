const MOUTHS = {
  happy: 'M 44 60 Q 50 66 56 60',
  ok: 'M 44 62 L 56 62',
  sad: 'M 44 64 Q 50 58 56 64',
};

export function petSvg(stageId, colorValue, mood) {
  if (stageId === 'egg') {
    return `<svg viewBox="0 0 100 100" class="pet-svg">
      <ellipse cx="50" cy="55" rx="26" ry="34" fill="#fdf6ec" stroke="${colorValue}" stroke-width="4"/>
      <circle cx="42" cy="45" r="3" fill="${colorValue}"/>
      <circle cx="58" cy="60" r="4" fill="${colorValue}"/>
    </svg>`;
  }
  const scale = { baby: 0.7, child: 0.85, royal: 1 }[stageId] ?? 0.7;
  const horn = stageId === 'royal'
    ? `<polygon points="50,2 45,20 55,20" fill="#ffd23f"/>`
    : `<polygon points="50,8 46,20 54,20" fill="#ffe9b3"/>`;
  const crown = stageId === 'royal' ? `<text x="50" y="12" font-size="10" text-anchor="middle">👑</text>` : '';
  return `<svg viewBox="0 0 100 100" class="pet-svg" style="transform:scale(${scale})">
    ${horn}${crown}
    <ellipse cx="50" cy="48" rx="24" ry="22" fill="${colorValue}"/>
    <path d="M 50 68 Q 46 84 38 92 Q 52 88 54 74 Q 60 86 70 88 Q 60 78 58 68 Z" fill="${colorValue}" opacity="0.85"/>
    <circle cx="42" cy="44" r="4" fill="#123"/>
    <circle cx="58" cy="44" r="4" fill="#123"/>
    <circle cx="43.5" cy="42.5" r="1.5" fill="#fff"/>
    <circle cx="59.5" cy="42.5" r="1.5" fill="#fff"/>
    <path d="${MOUTHS[mood]}" stroke="#123" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}
