const AREA_PATTERNS = {
  blades: {
    width: 0.5,
    height: 0.5,
    shapes: (mark) => `<path d="M0.08 0.42l0.03-0.2M0.24 0.5l-0.02-0.22M0.38 0.38l0.03-0.2M0.44 0.14l-0.02-0.1M0.12 0.14l0.02-0.08" stroke="${mark}" stroke-width="0.025" stroke-linecap="round" fill="none"/>`
  },
  seeds: {
    width: 0.4,
    height: 0.4,
    shapes: (mark) => `<g fill="${mark}"><circle cx="0.07" cy="0.1" r="0.018"/><circle cx="0.26" cy="0.06" r="0.018"/><circle cx="0.17" cy="0.24" r="0.018"/><circle cx="0.35" cy="0.3" r="0.018"/><circle cx="0.05" cy="0.34" r="0.018"/></g>`
  },
  waves: {
    width: 1,
    height: 0.5,
    shapes: (mark) => `<path d="M0 0.25q0.125-0.12 0.25 0t0.25 0t0.25 0t0.25 0" stroke="${mark}" stroke-width="0.03" stroke-linecap="round" fill="none"/>`
  },
  stones: {
    width: 0.5,
    height: 0.5,
    shapes: (mark) => `<g fill="none" stroke="${mark}" stroke-width="0.02"><circle cx="0.12" cy="0.12" r="0.09"/><circle cx="0.34" cy="0.16" r="0.07"/><circle cx="0.2" cy="0.36" r="0.08"/><circle cx="0.42" cy="0.42" r="0.06"/></g>`
  }
};

const AREA_PRODUCTS = {
  21: { label: 'Sportgyep', pattern: 'seeds', color: '#9CCB6A', mark: '#4F8A2E', perUnit: 25 },
  22: { label: 'Díszpázsit', pattern: 'seeds', color: '#A8D27A', mark: '#4F8A2E', perUnit: 125 },
  23: { label: 'Árnyéktűrő fű', pattern: 'seeds', color: '#7FB66A', mark: '#3C7A3A', perUnit: 25 },
  24: { label: 'Szárazságtűrő fű', pattern: 'seeds', color: '#B7CF7A', mark: '#6C8A2E', perUnit: 125 },
  25: { label: 'Gyepszőnyeg', pattern: 'blades', color: '#6FB04A', mark: '#2F6B2A', perUnit: 1 },
  27: { label: 'Gyepregenerálás', pattern: 'seeds', color: '#A5CB75', mark: '#5A8A35', perUnit: 25 },
  30: { label: 'Felülvetés', pattern: 'seeds', color: '#8CC07A', mark: '#3F7D3A', perUnit: 50 },
  81: { label: 'Tó', pattern: 'waves', color: '#7DB9DA', mark: '#2F79A6', perUnit: 20 }
};

function isAreaProduct(productId) {
  return productId in AREA_PRODUCTS;
}
