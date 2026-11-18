import { calculateDiscounts } from './ajanlatok.js';
import { ringsArea } from './format.js';
import { AREA_PRODUCTS, isAreaProduct } from './teruletek.js';

export const PLAN_KEY = 'kertmester-terv';
export const DRAWING_KEY = 'kertmester-rajz';

export function readPlan() {
  const empty = { garden: { length: 15, width: 10 }, items: [], zones: [], labels: [], extras: {}, mature: false, nextId: 1 };
  try {
    const saved = { ...empty, ...JSON.parse(localStorage.getItem(PLAN_KEY)) };
    saved.zones = saved.zones.map((zone) => (zone.rings ? zone : { ...zone, rings: [zone.points], filled: true }));
    return saved;
  } catch {
    return empty;
  }
}

let plan = readPlan();
export const listeners = new Set();
export let version = 0;

export function notify() {
  version++;
  listeners.forEach((listener) => listener());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getVersion() {
  return version;
}

export function savePlan() {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  } catch {}
  notify();
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getGarden() {
  return plan.garden;
}

export function setGarden(length, width) {
  plan.garden = { length, width };
  plan.items.forEach((item) => {
    item.x = clamp(item.x, 0, length);
    item.y = clamp(item.y, 0, width);
  });
  plan.zones.forEach((zone) => {
    zone.rings = zone.rings.map((ring) => ring.map((point) => ({ x: clamp(point.x, 0, length), y: clamp(point.y, 0, width) })));
  });
  savePlan();
}

export function clearPlan() {
  plan.items = [];
  plan.zones = [];
  plan.labels = [];
  plan.extras = {};
  savePlan();
}

export function isMature() {
  return plan.mature;
}

export function setMature(value) {
  plan.mature = value;
  savePlan();
}

export function getPlacedItems() {
  return plan.items;
}

export function setPlacedItems(items) {
  plan.items = items;
  savePlan();
}

export function addPlacedItem(productId, x, y) {
  plan.items.push({ id: plan.nextId++, productId, x, y });
  savePlan();
}

export function movePlacedItem(id, x, y) {
  const item = plan.items.find((other) => other.id === id);
  item.x = x;
  item.y = y;
  savePlan();
}

export function setItemRotation(id, rotation) {
  const item = plan.items.find((other) => other.id === id);
  item.rotation = rotation;
  savePlan();
}

export function removePlacedItem(id) {
  plan.items = plan.items.filter((item) => item.id !== id);
  savePlan();
}

export function getLabels() {
  return plan.labels;
}

export function setLabels(labels) {
  plan.labels = labels;
  savePlan();
}

export function addLabel(text, x, y, color, size) {
  const label = { id: plan.nextId++, text, x, y, color, size };
  plan.labels.push(label);
  savePlan();
  return label;
}

export function updateLabel(id, changes) {
  const label = plan.labels.find((other) => other.id === id);
  Object.assign(label, changes);
  savePlan();
}

export function removeLabel(id) {
  plan.labels = plan.labels.filter((label) => label.id !== id);
  savePlan();
}

export function getZones() {
  return plan.zones;
}

export function createZone(productId, rings, filled) {
  return { id: plan.nextId++, productId, filled, rings };
}

export function setZones(zones) {
  plan.zones = zones;
  savePlan();
}

export function removeZone(id) {
  plan.zones = plan.zones.filter((zone) => zone.id !== id);
  savePlan();
}

export function getZoneArea(productId) {
  return plan.zones
    .filter((zone) => zone.productId === productId)
    .reduce((sum, zone) => sum + ringsArea(zone.rings), 0);
}

export function getExtraCount(productId) {
  return plan.extras[productId] || 0;
}

export function getPlacedCount(productId) {
  return plan.items.filter((item) => item.productId === productId).length;
}

export function getQuantities() {
  const quantities = { ...plan.extras };
  plan.items.forEach((item) => {
    quantities[item.productId] = (quantities[item.productId] || 0) + 1;
  });
  new Set(plan.zones.map((zone) => zone.productId)).forEach((productId) => {
    if (!isAreaProduct(productId)) return;
    const units = Math.max(1, Math.ceil(getZoneArea(productId) / AREA_PRODUCTS[productId].perUnit - 1e-9));
    quantities[productId] = (quantities[productId] || 0) + units;
  });
  return quantities;
}

export function increaseQuantity(productId) {
  plan.extras[productId] = (plan.extras[productId] || 0) + 1;
  savePlan();
}

export function decreaseQuantity(productId) {
  if (plan.extras[productId] > 0) {
    plan.extras[productId]--;
    if (plan.extras[productId] === 0) delete plan.extras[productId];
  } else if (!isAreaProduct(productId)) {
    const last = plan.items.findLast((item) => item.productId === productId);
    if (last) plan.items = plan.items.filter((item) => item !== last);
  }
  savePlan();
}

export function removeProduct(productId) {
  delete plan.extras[productId];
  plan.items = plan.items.filter((item) => item.productId !== productId);
  plan.zones = plan.zones.filter((zone) => zone.productId !== productId);
  savePlan();
}

export function getCartSummary(productsById) {
  const quantities = getQuantities();
  let count = 0;
  let subtotal = 0;
  Object.keys(quantities).forEach((id) => {
    if (!productsById[id]) return;
    count += quantities[id];
    subtotal += quantities[id] * productsById[id].Ar;
  });
  const discounts = calculateDiscounts(quantities, productsById);
  const saving = discounts.reduce((sum, discount) => sum + discount.amount, 0);
  return { count, subtotal, discounts, saving, total: subtotal - saving };
}

export function saveDrawing(dataUrl) {
  try {
    localStorage.setItem(DRAWING_KEY, dataUrl);
  } catch {}
}

export function loadDrawing() {
  try {
    return localStorage.getItem(DRAWING_KEY);
  } catch {
    return null;
  }
}

window.addEventListener('storage', (e) => {
  if (e.key !== PLAN_KEY) return;
  plan = readPlan();
  notify();
});

