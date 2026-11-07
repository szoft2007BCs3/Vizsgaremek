const PLAN_KEY = 'kertmester-terv';
const DRAWING_KEY = 'kertmester-rajz';

function readPlan() {
  const empty = { garden: { length: 15, width: 10 }, items: [], zones: [], extras: {}, nextId: 1 };
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(PLAN_KEY)) };
  } catch {
    return empty;
  }
}

let plan = readPlan();

function savePlan() {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  } catch {}
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getGarden() {
  return plan.garden;
}

function setGarden(length, width) {
  plan.garden = { length, width };
  plan.items.forEach((item) => {
    item.x = clamp(item.x, 0, length);
    item.y = clamp(item.y, 0, width);
  });
  plan.zones.forEach((zone) => {
    zone.points = zone.points.map((point) => ({ x: clamp(point.x, 0, length), y: clamp(point.y, 0, width) }));
  });
  savePlan();
}

function getPlacedItems() {
  return plan.items;
}

function addPlacedItem(productId, x, y) {
  plan.items.push({ id: plan.nextId++, productId, x, y });
  savePlan();
}

function movePlacedItem(id, x, y) {
  const item = plan.items.find((other) => other.id === id);
  item.x = x;
  item.y = y;
  savePlan();
}

function removePlacedItem(id) {
  plan.items = plan.items.filter((item) => item.id !== id);
  savePlan();
}

function getZones() {
  return plan.zones;
}

function addZone(productId, points) {
  plan.zones.push({ id: plan.nextId++, productId, points });
  savePlan();
}

function removeZone(id) {
  plan.zones = plan.zones.filter((zone) => zone.id !== id);
  savePlan();
}

function getZoneArea(productId) {
  return plan.zones
    .filter((zone) => zone.productId === productId)
    .reduce((sum, zone) => sum + polygonArea(zone.points), 0);
}

function getExtraCount(productId) {
  return plan.extras[productId] || 0;
}

function getPlacedCount(productId) {
  return plan.items.filter((item) => item.productId === productId).length;
}

function getQuantities() {
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

function increaseQuantity(productId) {
  plan.extras[productId] = (plan.extras[productId] || 0) + 1;
  savePlan();
}

function decreaseQuantity(productId) {
  if (plan.extras[productId] > 0) {
    plan.extras[productId]--;
    if (plan.extras[productId] === 0) delete plan.extras[productId];
  } else if (!isAreaProduct(productId)) {
    const last = plan.items.findLast((item) => item.productId === productId);
    if (last) plan.items = plan.items.filter((item) => item !== last);
  }
  savePlan();
}

function removeProduct(productId) {
  delete plan.extras[productId];
  plan.items = plan.items.filter((item) => item.productId !== productId);
  plan.zones = plan.zones.filter((zone) => zone.productId !== productId);
  savePlan();
}

function getCartSummary(productsById) {
  const quantities = getQuantities();
  let count = 0;
  let total = 0;
  Object.keys(quantities).forEach((id) => {
    if (!productsById[id]) return;
    count += quantities[id];
    total += quantities[id] * productsById[id].Ar;
  });
  return { count, total };
}

function saveDrawing(dataUrl) {
  try {
    localStorage.setItem(DRAWING_KEY, dataUrl);
  } catch {}
}

function loadDrawing() {
  try {
    return localStorage.getItem(DRAWING_KEY);
  } catch {
    return null;
  }
}

window.addEventListener('storage', (e) => {
  if (e.key !== PLAN_KEY) return;
  plan = readPlan();
  window.dispatchEvent(new Event('plan-changed'));
});

window.addEventListener('pageshow', (e) => {
  if (e.persisted) location.reload();
});
