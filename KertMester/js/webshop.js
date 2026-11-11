const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const productList = document.getElementById('productList');
const emptyMessage = document.getElementById('emptyMessage');
const cartList = document.getElementById('cartList');
const cartEmpty = document.getElementById('cartEmpty');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const orderBtn = document.getElementById('orderBtn');
const offerTrack = document.getElementById('offerTrack');
const offerMarquee = document.getElementById('offerMarquee');
const cartDiscounts = document.getElementById('cartDiscounts');
const subtotalRow = document.getElementById('subtotalRow');
const savingRow = document.getElementById('savingRow');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartSaving = document.getElementById('cartSaving');

const OFFER_SCROLL_SPEED = 26;

let products = [];
let categoriesById = {};
let productsById = {};

function createProductCard(product) {
  const head = createElement('div', 'shop-product-head');
  head.append(createProductIcon(product), createElement('strong', '', product.Nev));

  const addButton = createElement('button', 'btn-add', 'Kosárba');
  addButton.type = 'button';
  addButton.addEventListener('click', () => {
    increaseQuantity(product.ID);
    renderCart();
  });

  const foot = createElement('div', 'shop-product-foot');
  foot.append(createElement('span', 'shop-price', formatPrice(product.Ar)), addButton);

  const category = categoriesById[product.Kategoria_ID];
  const meta = `${category ? category.Nev : ''} · ${product.Meret_Adatok}`;

  const card = createElement('li', 'shop-product');
  card.append(head, createElement('p', 'shop-product-desc', product.Leiras), createElement('span', 'shop-product-meta', meta), foot);
  return card;
}

function renderProducts() {
  const query = normalizeText(searchInput.value.trim());
  const categoryId = Number(categoryFilter.value);

  const visible = products.filter((product) => {
    const matchesCategory = !categoryId || product.Kategoria_ID === categoryId;
    const matchesQuery = normalizeText(`${product.Nev} ${product.Leiras}`).includes(query);
    return matchesCategory && matchesQuery;
  });

  productList.replaceChildren(...visible.map(createProductCard));
  emptyMessage.hidden = visible.length > 0;
}

function createCartItem(product, quantity) {
  const placed = getPlacedCount(product.ID);
  const area = getZoneArea(product.ID);
  const details = [`${formatPrice(product.Ar)} / db`];
  if (placed) details.push(`tervben: ${placed} db`);
  if (area) details.push(`tervben: ${formatArea(area)}`);

  const info = createElement('div', 'cart-item-info');
  info.append(createElement('strong', '', product.Nev), createElement('span', 'cart-item-meta', details.join(' · ')));

  const removeButton = createElement('button', 'cart-item-remove', '×');
  removeButton.type = 'button';
  removeButton.setAttribute('aria-label', 'Termék törlése a kosárból');
  removeButton.addEventListener('click', () => {
    removeProduct(product.ID);
    renderCart();
  });

  const minusButton = createElement('button', 'qty-btn', '−');
  minusButton.type = 'button';
  minusButton.setAttribute('aria-label', 'Eggyel kevesebb');
  if (isAreaProduct(product.ID) && getExtraCount(product.ID) === 0) {
    minusButton.disabled = true;
    minusButton.title = 'A területet a tervezőben tudod törölni';
  }
  minusButton.addEventListener('click', () => {
    decreaseQuantity(product.ID);
    renderCart();
  });

  const plusButton = createElement('button', 'qty-btn', '+');
  plusButton.type = 'button';
  plusButton.setAttribute('aria-label', 'Eggyel több');
  plusButton.addEventListener('click', () => {
    increaseQuantity(product.ID);
    renderCart();
  });

  const controls = createElement('div', 'cart-item-controls');
  controls.append(minusButton, createElement('span', 'qty-value', quantity), plusButton);

  const item = createElement('li', 'cart-item');
  item.append(info, removeButton, controls, createElement('strong', 'cart-item-total', formatPrice(product.Ar * quantity)));
  return item;
}

function createOfferCard(offer) {
  const card = createElement('article', 'offer-card');
  card.dataset.id = offer.id;
  card.append(
    createElement('span', 'offer-icon', offer.icon),
    createElement('strong', 'offer-title', offer.title),
    createElement('span', 'offer-badge', offer.badge),
    createElement('p', 'offer-text', offer.text)
  );
  return card;
}

async function renderOffers() {
  const offers = await loadOffers();
  const copy = () => offers.map(createOfferCard);
  const second = copy();
  second.forEach((card) => card.setAttribute('aria-hidden', 'true'));
  offerTrack.replaceChildren(...copy(), ...second);
  offerTrack.style.setProperty('--scroll-time', `${offerTrack.scrollHeight / 2 / OFFER_SCROLL_SPEED}s`);
}

function createDiscountRow(discount) {
  const row = createElement('li', 'cart-discount');
  row.append(
    createElement('span', 'discount-icon', discount.offer.icon),
    createElement('span', 'discount-name', `${discount.offer.title} (${discount.detail})`),
    createElement('strong', 'discount-amount', `−${formatPrice(discount.amount)}`)
  );
  return row;
}

function renderDiscounts(summary) {
  cartDiscounts.replaceChildren(...summary.discounts.map(createDiscountRow));
  cartDiscounts.hidden = summary.discounts.length === 0;
  subtotalRow.hidden = summary.discounts.length === 0;
  savingRow.hidden = summary.discounts.length === 0;
  cartSubtotal.textContent = formatPrice(summary.subtotal);
  cartSaving.textContent = `−${formatPrice(summary.saving)}`;

  const active = new Set(summary.discounts.map((discount) => String(discount.offer.id)));
  offerTrack.querySelectorAll('.offer-card').forEach((card) => card.classList.toggle('is-active', active.has(card.dataset.id)));
}

function renderCart() {
  const quantities = getQuantities();
  const entries = Object.keys(quantities)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((id) => productsById[id]);

  cartList.replaceChildren(...entries.map((id) => createCartItem(productsById[id], quantities[id])));
  cartEmpty.hidden = entries.length > 0;

  const summary = getCartSummary(productsById);
  cartCount.textContent = summary.count;
  cartTotal.textContent = formatPrice(summary.total);
  renderDiscounts(summary);
  orderBtn.disabled = summary.count === 0;
}

async function initShop() {
  const [allProducts, categories] = await Promise.all([loadAllProducts(), loadCategories()]);
  products = allProducts;
  productsById = Object.fromEntries(products.map((product) => [product.ID, product]));
  categoriesById = Object.fromEntries(categories.map((category) => [category.ID, category]));

  categories.forEach((category) => {
    const option = createElement('option', '', category.Nev);
    option.value = category.ID;
    categoryFilter.append(option);
  });

  renderProducts();
  await renderOffers();
  renderCart();
}

orderBtn.addEventListener('click', () => {
  window.location.href = 'rendeles.html';
});

searchInput.addEventListener('input', renderProducts);
categoryFilter.addEventListener('change', renderProducts);
window.addEventListener('plan-changed', renderCart);

initShop();
