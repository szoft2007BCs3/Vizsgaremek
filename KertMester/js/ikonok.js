const STEM = '<path d="M16 29V14" stroke="#3E7B3A" stroke-width="2" stroke-linecap="round" fill="none"/>';
const LEAF = '<path d="M16 26c-6-1-9-5-9-8 5 0 9 3 9 8zM16 24c5-1 8-4 8-7-5 0-8 3-8 7z" fill="#4E9A47"/>';
const TRUNK = '<rect x="14.5" y="19" width="3" height="10" rx="1" fill="#7A5232"/>';

function dots(color, points, radius) {
  return points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}"/>`).join('');
}

function petals(color, count, cx, cy, reach, size) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return `<circle cx="${(cx + Math.cos(angle) * reach).toFixed(1)}" cy="${(cy + Math.sin(angle) * reach).toFixed(1)}" r="${size}" fill="${color}"/>`;
  }).join('');
}

const PRODUCT_SVG = {
  1: `${STEM}${LEAF}${dots('#8E6BC4', [[16, 5], [16, 9], [16, 13], [13, 8], [19, 8], [13, 12], [19, 12]], 2.4)}`,
  2: `${STEM}${LEAF}${petals('#E27BB0', 9, 16, 12, 6, 3)}<circle cx="16" cy="12" r="3.6" fill="#B5651D"/>`,
  3: `<path d="M16 28C6 26 4 14 12 8c3 4 4 10 4 20zM16 28c10-2 12-14 4-20-3 4-4 10-4 20zM16 28C13 20 14 10 16 5c2 5 3 15 0 23z" fill="#8FB98B" stroke="#4E7F4A" stroke-width="1"/>`,
  4: `${STEM}${dots('#5B8DD9', [[16, 6], [11, 9], [21, 9], [8, 14], [24, 14], [13, 13], [19, 13], [16, 10], [11, 18], [21, 18], [16, 17]], 3.4)}`,
  5: `${STEM}${dots('#3F66C9', [[16, 4], [16, 8], [16, 12], [16, 16], [13, 6], [19, 6], [13, 10], [19, 10], [13, 14], [19, 14]], 2.3)}${LEAF}`,
  6: `${STEM}${LEAF}${petals('#E94B8B', 5, 12, 10, 2.4, 2.3)}${petals('#F28DB3', 5, 20, 12, 2.4, 2.3)}${petals('#E94B8B', 5, 16, 6, 2.2, 2.1)}`,
  7: `${STEM}<path d="M16 15L9 5M16 15l-2-11M16 15l2-11M16 15l7-10M16 15L5 11M16 15l11-4" stroke="#F08A24" stroke-width="3.4" stroke-linecap="round"/><circle cx="16" cy="15" r="2" fill="#F5C242"/>`,
  8: `${STEM}${LEAF}<circle cx="16" cy="12" r="9" fill="#C2185B"/><circle cx="16" cy="12" r="6.3" fill="#E04A86"/><circle cx="16" cy="12" r="3.4" fill="#F59BBE"/><circle cx="16" cy="12" r="1.2" fill="#F7D774"/>`,
  9: `${STEM}<circle cx="16" cy="23" r="5" fill="#4E9A47"/>${dots('#D32F2F', [[16, 6], [11, 9], [21, 9], [13, 13], [19, 13], [16, 10]], 3.2)}`,
  10: `<path d="M16 29V19" stroke="#3E7B3A" stroke-width="2"/><path d="M9 7c0 8 2 13 7 13s7-5 7-13l-3.5 3L16 5l-3.5 5z" fill="#E03A3E"/><path d="M16 27C9 26 7 19 8 15c5 2 8 6 8 12zM16 27c7-1 9-8 8-12-5 2-8 6-8 12z" fill="#4E9A47"/>`,
  11: `<path d="M16 2L8 12h4L6 20h5L5 27h22l-6-7h5l-6-8h4z" fill="#1F5E34"/><path d="M16 2l-5 8M16 2l5 8" stroke="#2E7D4A" stroke-width="1" fill="none"/>${TRUNK.replace('y="19"', 'y="26"').replace('height="10"', 'height="4"')}`,
  12: `${TRUNK}<path d="M16 3l3 6 6-2-2 6 6 2-5 4 3 6-7-1-1 5-3-4-3 4-1-5-7 1 3-6-5-4 6-2-2-6 6 2z" fill="#C2371F" transform="translate(0 -2) scale(1 .9)"/>`,
  13: `${TRUNK}<path d="M3 17C3 8 10 5 16 6s13 3 13 11c-4-2-8-3-13-3S7 15 3 17z" fill="#7BB661"/><circle cx="9" cy="10" r="1.6" fill="#F6B4CB"/><circle cx="16" cy="8" r="1.6" fill="#F6B4CB"/><circle cx="23" cy="10" r="1.6" fill="#F6B4CB"/><circle cx="19" cy="12" r="1.4" fill="#F6B4CB"/>`,
  14: `<ellipse cx="16" cy="14" rx="6" ry="13" fill="#2F7A44"/><ellipse cx="14" cy="12" rx="2.5" ry="8" fill="#3F9457"/>${TRUNK.replace('y="19"', 'y="25"').replace('height="10"', 'height="5"')}`,
  15: `<circle cx="16" cy="16" r="12" fill="#4E8B47"/>${dots('#A87BD6', [[10, 11], [16, 8], [22, 11], [12, 17], [20, 17], [16, 13], [9, 21], [23, 21], [16, 21]], 2.8)}`,
  16: `<circle cx="16" cy="17" r="12" fill="#6AA84F"/>${dots('#FFD21F', [[10, 11], [16, 8], [22, 11], [8, 17], [24, 17], [13, 15], [19, 15], [11, 22], [21, 22], [16, 20]], 2.5)}`,
  17: `<circle cx="16" cy="17" r="12" fill="#5C9A4B"/>${petals('#F06FA8', 5, 16, 15, 4, 3.4)}<circle cx="16" cy="15" r="2.2" fill="#FFE27A"/>`,
  18: `<circle cx="16" cy="16" r="12.5" fill="#1B4D2E"/><circle cx="12" cy="12" r="5" fill="#2B6B42"/>${dots('#E53935', [[10, 20], [20, 22], [22, 12], [14, 24]], 2)}`,
  19: `${TRUNK}<circle cx="16" cy="12" r="11" fill="#F7B6CE"/><circle cx="10" cy="9" r="5" fill="#FBD0E0"/><circle cx="22" cy="14" r="4.5" fill="#F29BBB"/><circle cx="14" cy="16" r="3.5" fill="#F29BBB"/>`,
  20: `<circle cx="16" cy="17" r="12" fill="#2F6F3B"/><path d="M8 18c3-6 7-8 12-8-1 6-5 9-12 8zM15 24c3-5 7-7 11-6-1 5-5 7-11 6z" fill="#4C9A52"/><path d="M8 18l11-6M15 24l10-5" stroke="#2F6F3B" stroke-width=".8"/>`,
  31: `<path d="M16 2v16" stroke="#8A5A2B" stroke-width="3" stroke-linecap="round"/><path d="M12 2h8" stroke="#8A5A2B" stroke-width="3" stroke-linecap="round"/><path d="M9 16h14l-1 8-6 6-6-6z" fill="#9AA5AD" stroke="#5F6B73" stroke-width="1.2"/>`,
  32: `<path d="M13 4l10 14M19 4L9 18" stroke="#8C99A3" stroke-width="3" stroke-linecap="round"/><path d="M9 18l-3 8a3 3 0 0 0 5 1.5L13 18zM23 18l3 8a3 3 0 0 1-5 1.5L19 18z" fill="#E4572E"/>`,
  33: `<path d="M16 29V15" stroke="#8A5A2B" stroke-width="3" stroke-linecap="round"/><path d="M16 15L6 4M16 15l-5-12M16 15V2M16 15l5-12M16 15l10-11" stroke="#D39B2A" stroke-width="2.4" stroke-linecap="round"/>`,
  34: `<path d="M8 29l13-23" stroke="#8A5A2B" stroke-width="3" stroke-linecap="round"/><path d="M18 5l9-1-1 4-8 3z" fill="#9AA5AD" stroke="#5F6B73" stroke-width="1.2"/>`,
  35: `<path d="M13 6l-6 22M19 6l6 22" stroke="#E4572E" stroke-width="3.4" stroke-linecap="round"/><path d="M13 5L23 3l1 9-10 1zM19 5L9 3 8 12l10 1z" fill="#B7C0C7" stroke="#6B7780" stroke-width="1"/>`,
  36: `<path d="M3 11h20l-4 11H9z" fill="#3E9B5A" stroke="#256D3B" stroke-width="1.2"/><path d="M23 11l7-4M3 11L1 6" stroke="#8A5A2B" stroke-width="2.4" stroke-linecap="round"/><circle cx="14" cy="26" r="4" fill="#333" stroke="#999" stroke-width="1.4"/>`,
  37: `<path d="M9 28l8-12" stroke="#8A5A2B" stroke-width="3.4" stroke-linecap="round"/><path d="M15 14c3-8 9-11 12-9 1 3-3 11-10 14z" fill="#9AA5AD" stroke="#5F6B73" stroke-width="1.2"/>`,
  38: `<path d="M6 29L14 10M24 29L16 10" stroke="#E4572E" stroke-width="3.4" stroke-linecap="round"/><path d="M14 10c-3-5 0-8 5-8-1 3-1 5 1 7zM16 10c3-5 6-6 10-4-3 2-4 4-4 7z" fill="#B7C0C7" stroke="#6B7780" stroke-width="1"/>`,
  39: `<path d="M16 2v18" stroke="#8A5A2B" stroke-width="3.2" stroke-linecap="round"/><path d="M16 29l-4-9h8z" fill="#9AA5AD" stroke="#5F6B73" stroke-width="1.2"/><path d="M13 3h6" stroke="#8A5A2B" stroke-width="3" stroke-linecap="round"/>`
};

const PRODUCT_EMOJI = {
  40: '🧤', 41: '🌀', 42: '💦', 43: '⏲️', 44: '💧', 45: '🔫', 46: '🧶', 47: '🔌', 48: '⛲', 49: '🪣', 50: '🛢️',
  51: '🛋️', 52: '🪑', 53: '⛱️', 54: '💺', 55: '🍽️', 56: '🛏️', 57: '🏖️', 58: '🧺', 59: '🧰', 60: '🎠',
  61: '🔦', 62: '✨', 63: '📡', 64: '🏮', 65: '🔆', 66: '🔘', 67: '🔥', 68: '💡', 69: '🔮', 70: '🕯️',
  71: '💩', 72: '🧴', 73: '🧪', 74: '🌹', 75: '♻️', 76: '📦', 77: '⚗️', 78: '🪻', 79: '🥬', 80: '🌾',
  81: '🪷', 82: '🌊', 83: '🪆', 84: '🏺', 85: '🚧', 86: '🐸', 87: '🐓', 88: '🎐', 89: '🗿', 90: '🐦',
  91: '🪤', 92: '🫧', 93: '🕸️', 94: '🐭', 95: '🐛', 96: '🍄', 97: '🥅', 98: '🛡️', 99: '🐌', 100: '🎑'
};
