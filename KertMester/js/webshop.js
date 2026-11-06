const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const productList = document.getElementById('productList');
const emptyMessage = document.getElementById('emptyMessage');
const cartList = document.getElementById('cartList');
const cartEmpty = document.getElementById('cartEmpty');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');

let products = [];
let categoriesById = {};
let productsById = {};

function createProductCard(product) {
  const head = createElement('div', 'shop-product-head');
  head.append(createProductIcon(product.Kategoria_ID), createElement('strong', '', product.Nev));

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
  const info = createElement('div', 'cart-item-info');
  info.append(createElement('strong', '', product.Nev), createElement('span', 'cart-item-meta', `${formatPrice(product.Ar)} / db${placed ? ` · tervben: ${placed} db` : ''}`));

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
  renderCart();
}

searchInput.addEventListener('input', renderProducts);
categoryFilter.addEventListener('change', renderProducts);
window.addEventListener('plan-changed', renderCart);

initShop();
