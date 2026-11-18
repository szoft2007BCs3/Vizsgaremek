export const AREA_PATTERNS = {
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
  },
  pavers: {
    width: 0.4,
    height: 0.2,
    shapes: (mark) => `<path d="M0 0h0.4v0.2h-0.4zM0.2 0v0.2" stroke="${mark}" stroke-width="0.015" fill="none"/>`
  },
  gravel: {
    width: 0.3,
    height: 0.3,
    shapes: (mark) => `<g fill="${mark}"><circle cx="0.05" cy="0.06" r="0.02"/><circle cx="0.2" cy="0.1" r="0.025"/><circle cx="0.12" cy="0.2" r="0.02"/><circle cx="0.27" cy="0.26" r="0.018"/><circle cx="0.03" cy="0.27" r="0.015"/></g>`
  },
  slabs: {
    width: 0.5,
    height: 0.5,
    shapes: (mark) => `<rect x="0.01" y="0.01" width="0.48" height="0.48" fill="none" stroke="${mark}" stroke-width="0.02"/>`
  },
  planks: {
    width: 0.6,
    height: 0.14,
    shapes: (mark) => `<path d="M0 0.07h0.6M0.3 0v0.07M0.1 0.07v0.07" stroke="${mark}" stroke-width="0.012" fill="none"/>`
  },
  mulch: {
    width: 0.3,
    height: 0.3,
    shapes: (mark) => `<path d="M0.04 0.06l0.08 0.02M0.18 0.12l0.07-0.03M0.08 0.22l0.09 0.03M0.22 0.26l0.06-0.04" stroke="${mark}" stroke-width="0.022" stroke-linecap="round" fill="none"/>`
  }
};

export const AREA_PRODUCTS = {
  21: { label: 'Sportgyep', pattern: 'seeds', kind: 'grass', color: '#9CCB6A', mark: '#4F8A2E', perUnit: 25 },
  22: { label: 'Díszpázsit', pattern: 'seeds', kind: 'grass', color: '#A8D27A', mark: '#4F8A2E', perUnit: 125 },
  23: { label: 'Árnyéktűrő fű', pattern: 'seeds', kind: 'grass', color: '#7FB66A', mark: '#3C7A3A', perUnit: 25 },
  24: { label: 'Szárazságtűrő fű', pattern: 'seeds', kind: 'grass', color: '#B7CF7A', mark: '#6C8A2E', perUnit: 125 },
  25: { label: 'Gyepszőnyeg', pattern: 'blades', kind: 'grass', color: '#6FB04A', mark: '#2F6B2A', perUnit: 1 },
  27: { label: 'Gyepregenerálás', pattern: 'seeds', kind: 'grass', color: '#A5CB75', mark: '#5A8A35', perUnit: 25 },
  30: { label: 'Felülvetés', pattern: 'seeds', kind: 'grass', color: '#8CC07A', mark: '#3F7D3A', perUnit: 50 },
  81: { label: 'Tó', pattern: 'waves', kind: 'water', color: '#7DB9DA', mark: '#2F79A6', perUnit: 20 },
  225: { label: 'Szürke térkő', pattern: 'pavers', kind: 'path', color: '#B9B9B2', mark: '#7C7C76', perUnit: 1 },
  226: { label: 'Terrakotta térkő', pattern: 'pavers', kind: 'path', color: '#C98B68', mark: '#8F5A3C', perUnit: 1 },
  228: { label: 'Mosott kavics', pattern: 'gravel', kind: 'path', color: '#CFC6B0', mark: '#8C8266', perUnit: 0.4 },
  229: { label: 'Fehér kavics', pattern: 'gravel', kind: 'path', color: '#ECE9E0', mark: '#A9A494', perUnit: 0.4 },
  230: { label: 'Folyami kő', pattern: 'gravel', kind: 'path', color: '#B7B0A2', mark: '#6F6A5E', perUnit: 0.4 },
  231: { label: 'Bazalt zúzalék', pattern: 'gravel', kind: 'path', color: '#6E6E72', mark: '#2E2E33', perUnit: 0.4 },
  232: { label: 'Mészkő zúzalék', pattern: 'gravel', kind: 'path', color: '#DAD3BF', mark: '#9A937C', perUnit: 0.5 },
  234: { label: 'Járólap 40x40', pattern: 'slabs', kind: 'path', color: '#C4C2BA', mark: '#85837C', perUnit: 0.16 },
  235: { label: 'Járólap 50x50', pattern: 'slabs', kind: 'path', color: '#B8B6AE', mark: '#7A786F', perUnit: 0.25 },
  236: { label: 'Gránit kockakő', pattern: 'pavers', kind: 'path', color: '#9A9A9E', mark: '#55555A', perUnit: 0.01 },
  241: { label: 'WPC teraszdeszka', pattern: 'planks', kind: 'path', color: '#A9855E', mark: '#6B4E32', perUnit: 0.336 },
  242: { label: 'Fa járólap', pattern: 'planks', kind: 'path', color: '#BE9A6B', mark: '#7C5B34', perUnit: 0.14 },
  248: { label: 'Fakéreg mulcs', pattern: 'mulch', kind: 'path', color: '#8F6B4B', mark: '#53391F', perUnit: 1 },
  249: { label: 'Faforgács ösvény', pattern: 'mulch', kind: 'path', color: '#D2B07C', mark: '#8C6D3D', perUnit: 1 },
  250: { label: 'Márványzúzalék', pattern: 'gravel', kind: 'path', color: '#F1EEE8', mark: '#B3AEA2', perUnit: 0.4 },
  251: { label: 'Klinker burkolat', pattern: 'pavers', kind: 'path', color: '#B5654A', mark: '#6F3524', perUnit: 1 },
  252: { label: 'Hullámmintás térkő', pattern: 'pavers', kind: 'path', color: '#A8A8A0', mark: '#6A6A63', perUnit: 1 },
  254: { label: 'Kavicsrács út', pattern: 'gravel', kind: 'path', color: '#BDB7A5', mark: '#7A7461', perUnit: 1 },
  243: { label: 'Gyeprács', pattern: 'slabs', kind: 'path', color: '#9CB586', mark: '#5C7A47', perUnit: 0.25 }
};

export function isAreaProduct(productId) {
  return productId in AREA_PRODUCTS;
}

export function coexistsWithPath(productIdA, productIdB) {
  const kinds = [AREA_PRODUCTS[productIdA].kind, AREA_PRODUCTS[productIdB].kind];
  return kinds.includes('path') && kinds.includes('grass');
}

export function zoneDrawOrder(zone) {
  return AREA_PRODUCTS[zone.productId].kind === 'path' ? 1 : 0;
}
