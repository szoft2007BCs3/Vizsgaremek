const priceFormat = new Intl.NumberFormat('hu-HU');
const areaFormat = new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 1 });

const DEFAULT_LOOK = { icon: '🌿', color: '#6E8B5E' };

const CATEGORY_LOOK = {
  1: { icon: '🌸', color: '#B66A8C' },
  2: { icon: '🌳', color: '#4C7A47' },
  3: { icon: '🌱', color: '#7FA84A' },
  4: { icon: '🛠️', color: '#8A6D4A' },
  5: { icon: '💧', color: '#4A86A8' },
  6: { icon: '🪑', color: '#A07A4F' },
  7: { icon: '💡', color: '#C69A3C' },
  8: { icon: '🧪', color: '#5F8F6A' },
  9: { icon: '⛲', color: '#5F8F95' },
  10: { icon: '🛡️', color: '#7A6A8A' }
};

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function createProductIcon(categoryId) {
  const look = CATEGORY_LOOK[categoryId] || DEFAULT_LOOK;
  const icon = createElement('span', 'product-icon', look.icon);
  icon.style.background = look.color;
  return icon;
}

function formatPrice(amount) {
  return `${priceFormat.format(amount)} Ft`;
}

function normalizeText(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function formatArea(area) {
  return `${areaFormat.format(area)} m²`;
}

function polygonArea(points) {
  let sum = 0;
  points.forEach((point, i) => {
    const next = points[(i + 1) % points.length];
    sum += point.x * next.y - next.x * point.y;
  });
  return Math.abs(sum) / 2;
}
