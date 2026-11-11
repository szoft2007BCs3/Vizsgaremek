const itemsLayer = document.getElementById('itemsLayer');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const DRAG_THRESHOLD = 6;

let productsById = {};
let draggedItem = null;

function shortName(product) {
  return product.Nev.split(' (')[0];
}

function isOverStage(clientX, clientY) {
  const rect = itemsLayer.getBoundingClientRect();
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

function createPlacedItem(item) {
  const product = productsById[item.productId];
  const { length, width } = getGarden();

  const remove = createElement('button', 'placed-remove', '×');
  remove.type = 'button';
  remove.setAttribute('aria-label', 'Eltávolítás a tervből');

  const marker = createElement('span', 'placed-marker');
  marker.append(createProductIcon(product), remove);

  const element = createElement('div', 'placed-item');
  element.tabIndex = 0;
  element.dataset.id = item.id;
  element.title = product.Nev;
  element.style.left = `${(item.x / length) * 100}%`;
  element.style.top = `${(item.y / width) * 100}%`;
  element.append(marker, createElement('span', 'placed-name', shortName(product)));
  return element;
}

function renderPlacedItems() {
  const items = getPlacedItems().filter((item) => productsById[item.productId]);
  itemsLayer.replaceChildren(...items.map(createPlacedItem));
}

function updateCartSummary() {
  const summary = getCartSummary(productsById);
  cartCount.textContent = summary.count;
  cartTotal.textContent = formatPrice(summary.total);
}

function refreshPlan() {
  renderFootprints();
  renderPlacedItems();
  renderZones();
  updateCartSummary();
}

function placeProduct(product, x, y) {
  addPlacedItem(product.ID, x, y);
  commitPlan();
  refreshPlan();
}

function placeProductInCenter(product) {
  const { length, width } = getGarden();
  const spread = Math.min(length, width) * 0.3;
  placeProduct(product, length / 2 + (Math.random() - 0.5) * spread, width / 2 + (Math.random() - 0.5) * spread);
}

function startProductDrag(e, product) {
  if (e.pointerType === 'mouse') {
    if (e.button !== 0) return;
    e.preventDefault();
  }

  const startX = e.clientX;
  const startY = e.clientY;
  let ghost = null;

  function move(event) {
    if (!ghost && Math.hypot(event.clientX - startX, event.clientY - startY) > DRAG_THRESHOLD) {
      ghost = createProductIcon(product);
      ghost.classList.add('drag-ghost');
      document.body.append(ghost);
      document.body.classList.add('is-dragging');
    }
    if (ghost) {
      ghost.style.left = `${event.clientX}px`;
      ghost.style.top = `${event.clientY}px`;
      if (isOverStage(event.clientX, event.clientY)) {
        const point = pointToGarden(event.clientX, event.clientY);
        ghost.classList.toggle('is-blocked', showSpacingGuides(product, point.x, point.y, null));
      } else {
        hideSpacingGuides();
        ghost.classList.remove('is-blocked');
      }
    }
  }

  function finish() {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', drop);
    window.removeEventListener('pointercancel', finish);
    document.body.classList.remove('is-dragging');
    hideSpacingGuides();
    if (ghost) ghost.remove();
  }

  function drop(event) {
    const wasDragging = Boolean(ghost);
    finish();
    if (wasDragging) {
      if (isOverStage(event.clientX, event.clientY)) {
        const point = pointToGarden(event.clientX, event.clientY);
        placeProduct(product, point.x, point.y);
      }
    } else if (event.pointerType !== 'mouse') {
      placeProductInCenter(product);
    }
  }

  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', drop);
  window.addEventListener('pointercancel', finish);
}

itemsLayer.addEventListener('pointerdown', (e) => {
  const element = e.target.closest('.placed-item');
  if (!element || e.target.closest('.placed-remove')) return;

  const id = Number(element.dataset.id);
  const item = getPlacedItems().find((other) => other.id === id);
  const point = pointToGarden(e.clientX, e.clientY);
  draggedItem = { element, id, productId: item.productId, offsetX: point.x - item.x, offsetY: point.y - item.y, x: item.x, y: item.y };
  element.setPointerCapture(e.pointerId);
});

itemsLayer.addEventListener('pointermove', (e) => {
  if (!draggedItem) return;
  const { length, width } = getGarden();
  const point = pointToGarden(e.clientX, e.clientY);
  draggedItem.x = clamp(point.x - draggedItem.offsetX, 0, length);
  draggedItem.y = clamp(point.y - draggedItem.offsetY, 0, width);
  draggedItem.element.style.left = `${(draggedItem.x / length) * 100}%`;
  draggedItem.element.style.top = `${(draggedItem.y / width) * 100}%`;
  moveFootprint(draggedItem.id, draggedItem.x, draggedItem.y);
  const product = productsById[draggedItem.productId];
  draggedItem.element.classList.toggle('is-blocked', showSpacingGuides(product, draggedItem.x, draggedItem.y, draggedItem.id));
});

function endItemDrag() {
  if (!draggedItem) return;
  const moved = getPlacedItems().find((item) => item.id === draggedItem.id);
  const changed = moved && (moved.x !== draggedItem.x || moved.y !== draggedItem.y);
  movePlacedItem(draggedItem.id, draggedItem.x, draggedItem.y);
  if (changed) commitPlan();
  draggedItem.element.classList.remove('is-blocked');
  hideSpacingGuides();
  draggedItem = null;
}

itemsLayer.addEventListener('pointerup', endItemDrag);
itemsLayer.addEventListener('pointercancel', endItemDrag);

itemsLayer.addEventListener('click', (e) => {
  const remove = e.target.closest('.placed-remove');
  if (!remove) return;
  removePlacedItem(Number(remove.closest('.placed-item').dataset.id));
  commitPlan();
  refreshPlan();
});

itemsLayer.addEventListener('keydown', (e) => {
  const element = e.target.closest('.placed-item');
  if (!element || (e.key !== 'Delete' && e.key !== 'Backspace')) return;
  removePlacedItem(Number(element.dataset.id));
  commitPlan();
  refreshPlan();
});

window.addEventListener('garden-changed', refreshPlan);
window.addEventListener('plan-changed', refreshPlan);

async function initPlacedItems() {
  const products = await loadAllProducts();
  productsById = Object.fromEntries(products.map((product) => [product.ID, product]));
  refreshPlan();
}

initPlacedItems();
