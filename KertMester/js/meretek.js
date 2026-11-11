const PLANT_SIZES = {
  1: { kind: 'flower', sapling: 0.2, mature: 0.6, trunk: 0, color: '#8E6BC4' },
  2: { kind: 'flower', sapling: 0.2, mature: 0.5, trunk: 0, color: '#E27BB0' },
  3: { kind: 'flower', sapling: 0.2, mature: 0.7, trunk: 0, color: '#6FA06B' },
  4: { kind: 'flower', sapling: 0.3, mature: 1.2, trunk: 0, color: '#5B8DD9' },
  5: { kind: 'flower', sapling: 0.2, mature: 0.5, trunk: 0, color: '#3F66C9' },
  6: { kind: 'flower', sapling: 0.2, mature: 0.5, trunk: 0, color: '#E94B8B' },
  7: { kind: 'flower', sapling: 0.2, mature: 0.6, trunk: 0, color: '#F08A24' },
  8: { kind: 'flower', sapling: 0.25, mature: 0.9, trunk: 0, color: '#C2185B' },
  9: { kind: 'flower', sapling: 0.15, mature: 0.4, trunk: 0, color: '#D32F2F' },
  10: { kind: 'flower', sapling: 0.1, mature: 0.25, trunk: 0, color: '#E03A3E' },
  11: { kind: 'shrub', sapling: 0.3, mature: 1.5, trunk: 0.15, color: '#1F5E34' },
  12: { kind: 'tree', sapling: 0.4, mature: 4, trunk: 0.25, color: '#9C2D1A' },
  13: { kind: 'tree', sapling: 0.4, mature: 6, trunk: 0.35, color: '#4F8A3A' },
  14: { kind: 'shrub', sapling: 0.3, mature: 2, trunk: 0.2, color: '#1F5E34' },
  15: { kind: 'shrub', sapling: 0.4, mature: 3, trunk: 0.15, color: '#6A4C93' },
  16: { kind: 'shrub', sapling: 0.4, mature: 2.5, trunk: 0.1, color: '#B8960C' },
  17: { kind: 'shrub', sapling: 0.4, mature: 2, trunk: 0.1, color: '#B04A7A' },
  18: { kind: 'shrub', sapling: 0.3, mature: 3, trunk: 0.3, color: '#143B23' },
  19: { kind: 'tree', sapling: 0.5, mature: 7, trunk: 0.4, color: '#C2547E' },
  20: { kind: 'shrub', sapling: 0.4, mature: 3, trunk: 0.12, color: '#1F5A2E' }
};

const OBJECT_SIZES = {
  36: { shape: 'rect', width: 0.65, height: 1.3, color: '#3E9B5A' },
  48: { coverage: 4 },
  50: { shape: 'round', width: 0.7, height: 0.7, color: '#4A6FA5' },
  51: { shape: 'rect', width: 2.2, height: 1.6, color: '#A67C52' },
  52: { shape: 'rect', width: 1.5, height: 0.5, color: '#B5895A' },
  53: { shape: 'round', width: 3, height: 3, color: '#E9D8A6' },
  54: { shape: 'rect', width: 0.55, height: 0.55, color: '#C9C2B2' },
  55: { shape: 'rect', width: 1.5, height: 0.9, color: '#9CC5C9' },
  56: { shape: 'rect', width: 1.95, height: 1.05, color: '#C7A27A' },
  57: { shape: 'rect', width: 1.9, height: 0.6, color: '#D8CBA8' },
  58: { shape: 'rect', width: 0.7, height: 0.7, color: '#B5895A' },
  59: { shape: 'rect', width: 1.2, height: 0.5, color: '#7C8A6A' },
  60: { shape: 'rect', width: 1.7, height: 1.1, color: '#B58B6E' },
  84: { shape: 'round', width: 0.4, height: 0.4, color: '#C77B4A' },
  89: { shape: 'rect', width: 0.6, height: 0.4, color: '#9A9A92' },
  90: { shape: 'rect', width: 0.25, height: 0.25, color: '#B5895A' }
};

const SPACING_FACTOR = 0.75;

function getPlantSize(productId) {
  return PLANT_SIZES[productId] || null;
}

function isWoody(productId) {
  const size = PLANT_SIZES[productId];
  return Boolean(size) && size.kind !== 'flower';
}

function getSpacingRadius(firstId, secondId) {
  return SPACING_FACTOR * (PLANT_SIZES[firstId].mature + PLANT_SIZES[secondId].mature) / 2;
}
