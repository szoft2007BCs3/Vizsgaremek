export const priceFormat = new Intl.NumberFormat('hu-HU');
export const areaFormat = new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 1 });

export const DEFAULT_LOOK = { icon: '🌿', color: '#6E8B5E' };

export const CATEGORY_LOOK = {
  1: { icon: '🌸', color: '#B66A8C' },
  2: { icon: '🌳', color: '#4C7A47' },
  3: { icon: '🌱', color: '#7FA84A' },
  4: { icon: '🛠️', color: '#8A6D4A' },
  5: { icon: '💧', color: '#4A86A8' },
  6: { icon: '🪑', color: '#A07A4F' },
  7: { icon: '💡', color: '#C69A3C' },
  8: { icon: '🧪', color: '#5F8F6A' },
  9: { icon: '⛲', color: '#5F8F95' },
  10: { icon: '🛡️', color: '#7A6A8A' },
  11: { icon: '🛤️', color: '#8C8878' },
  12: { icon: '🥕', color: '#C0803A' }
};

export function formatPrice(amount) {
  return `${priceFormat.format(amount)} Ft`;
}

export function normalizeText(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function formatArea(area) {
  return `${areaFormat.format(area)} m²`;
}

export function signedRingArea(ring) {
  let sum = 0;
  ring.forEach((point, i) => {
    const next = ring[(i + 1) % ring.length];
    sum += point.x * next.y - next.x * point.y;
  });
  return sum / 2;
}

export function ringsArea(rings) {
  return Math.abs(rings.reduce((sum, ring) => sum + signedRingArea(ring), 0));
}
