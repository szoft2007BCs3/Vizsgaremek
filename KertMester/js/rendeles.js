const checkoutForm = document.getElementById('checkoutForm');
const checkoutSummary = document.getElementById('checkoutSummary');
const checkoutEmpty = document.getElementById('checkoutEmpty');
const orderDone = document.getElementById('orderDone');
const sameBilling = document.getElementById('sameBilling');
const billingFields = document.getElementById('billingFields');
const placeOrderBtn = document.getElementById('placeOrderBtn');

const payOverlay = document.getElementById('payOverlay');
const payClose = document.getElementById('payClose');
const cardForm = document.getElementById('cardForm');
const creditCard = document.getElementById('creditCard');
const cardNumber = document.getElementById('cardNumber');
const cardName = document.getElementById('cardName');
const cardExpiry = document.getElementById('cardExpiry');
const cardCvc = document.getElementById('cardCvc');
const payBtn = document.getElementById('payBtn');
const payBtnText = document.getElementById('payBtnText');

const SHIPPING_FEE = 1490;
const FREE_SHIPPING_FROM = 30000;
const COD_FEE = 590;
const PAYMENT_DELAY = 2200;

const BRAND_LOGOS = {
  visa: '<span class="logo-visa">VISA</span>',
  mastercard: '<span class="logo-mc"><i></i><i></i></span>',
  amex: '<span class="logo-amex">AMEX</span>',
  discover: '<span class="logo-discover">DISCOVER</span>',
  diners: '<span class="logo-diners">Diners Club</span>',
  jcb: '<span class="logo-jcb">JCB</span>',
  unionpay: '<span class="logo-unionpay">UnionPay</span>',
  maestro: '<span class="logo-mc logo-maestro"><i></i><i></i></span>'
};

let productsById = {};
let summary = null;

function getPayment() {
  return checkoutForm.elements.payment.value;
}

function getShipping() {
  return summary.total >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
}

function getGrandTotal() {
  return summary.total + getShipping() + (getPayment() === 'cod' ? COD_FEE : 0);
}

function renderSummary() {
  const items = Object.entries(getQuantities())
    .filter(([id]) => productsById[id])
    .map(([id, quantity]) => {
      const product = productsById[id];
      const row = createElement('li', 'summary-item');
      row.append(
        createProductIcon(product),
        createElement('span', 'summary-name', `${shortProductName(product)} × ${quantity}`),
        createElement('strong', '', formatPrice(product.Ar * quantity))
      );
      return row;
    });
  document.getElementById('summaryItems').replaceChildren(...items);

  const discounts = summary.discounts.map((discount) => {
    const row = createElement('li', 'cart-discount');
    row.append(
      createElement('span', 'discount-icon', discount.offer.icon),
      createElement('span', 'discount-name', `${discount.offer.title} (${discount.detail})`),
      createElement('strong', 'discount-amount', `−${formatPrice(discount.amount)}`)
    );
    return row;
  });
  document.getElementById('summaryDiscounts').replaceChildren(...discounts);
  updateTotals();
}

function updateTotals() {
  const shipping = getShipping();
  document.getElementById('sumSubtotal').textContent = formatPrice(summary.subtotal);
  document.getElementById('sumSaving').textContent = `−${formatPrice(summary.saving)}`;
  document.getElementById('sumSavingRow').hidden = summary.saving === 0;
  document.getElementById('sumShipping').textContent = shipping === 0 ? 'Ingyenes' : formatPrice(shipping);
  document.getElementById('sumCodRow').hidden = getPayment() !== 'cod';
  document.getElementById('sumTotal').textContent = formatPrice(getGrandTotal());
  placeOrderBtn.textContent = getPayment() === 'card' ? 'Tovább a fizetéshez' : 'Megrendelem';
  payBtnText.textContent = `Fizetek ${formatPrice(getGrandTotal())}`;
}

function shortProductName(product) {
  return product.Nev.split(' (')[0];
}

function toggleBilling() {
  billingFields.hidden = sameBilling.checked;
  ['billName', 'billZip', 'billCity', 'billStreet'].forEach((name) => {
    checkoutForm.elements[name].required = !sameBilling.checked;
  });
}

function finishOrder(paymentLabel) {
  const total = getGrandTotal();
  const orderNumber = `KM-${Date.now().toString().slice(-8)}`;
  const email = checkoutForm.elements.email.value;
  clearPlan();
  checkoutForm.hidden = true;
  checkoutSummary.hidden = true;
  payOverlay.hidden = true;
  document.getElementById('doneText').textContent = `Rendelésszám: ${orderNumber}. Végösszeg: ${formatPrice(total)} (${paymentLabel}). A visszaigazolást a(z) ${email} címre küldjük.`;
  orderDone.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showCardBrand() {
  const digits = cardNumber.value.replace(/\D/g, '');
  const brand = detectCardBrand(digits);
  const info = getBrandInfo(brand);
  creditCard.dataset.brand = brand;
  const logo = BRAND_LOGOS[brand] || '';
  document.getElementById('cardBrandLogo').innerHTML = logo;
  document.getElementById('cardBrandLogoBack').innerHTML = logo;
  document.getElementById('cardTypeText').textContent = brand === 'unknown' ? 'Kártya típusa: add meg a számot' : `Felismert kártya: ${info.name}`;
  cardCvc.maxLength = info.cvcLength;
  cardCvc.placeholder = '1234'.slice(0, info.cvcLength);

  const mask = groupDigits('0'.repeat(info.length), info.groups).split('');
  let position = 0;
  document.getElementById('cardNumberView').textContent = mask.map((char) => (char === ' ' ? ' ' : digits[position++] || '•')).join('');
}

function showCardValues() {
  document.getElementById('cardNameView').textContent = cardName.value.trim().toUpperCase() || 'NÉV NÉV';
  document.getElementById('cardExpiryView').textContent = cardExpiry.value || 'HH/ÉÉ';
  document.getElementById('cardCvcView').textContent = cardCvc.value || '•'.repeat(getBrandInfo(creditCard.dataset.brand).cvcLength);
}

function setError(id, message) {
  document.querySelector(`.field-error[data-for="${id}"]`).textContent = message;
  document.getElementById(id).classList.toggle('is-invalid', Boolean(message));
  return !message;
}

function validateCard() {
  const digits = cardNumber.value.replace(/\D/g, '');
  const info = getBrandInfo(detectCardBrand(digits));
  const results = [
    setError('cardNumber', digits.length === info.length && isLuhnValid(digits) ? '' : 'Érvénytelen kártyaszám.'),
    setError('cardName', cardName.value.trim().length >= 3 ? '' : 'Add meg a kártyán szereplő nevet.'),
    setError('cardExpiry', isExpiryValid(cardExpiry.value) ? '' : 'Érvénytelen vagy lejárt dátum.'),
    setError('cardCvc', cardCvc.value.length === info.cvcLength ? '' : `${info.cvcLength} számjegy szükséges.`)
  ];
  return results.every(Boolean);
}

function openPayment() {
  cardForm.reset();
  creditCard.classList.remove('is-flipped');
  document.querySelectorAll('.field-error').forEach((error) => (error.textContent = ''));
  showCardBrand();
  showCardValues();
  payOverlay.hidden = false;
  document.body.classList.add('modal-open');
  cardNumber.focus();
}

function closePayment() {
  if (payBtn.classList.contains('is-loading')) return;
  payOverlay.hidden = true;
  document.body.classList.remove('modal-open');
}

checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  checkoutForm.classList.add('was-validated');
  if (!checkoutForm.reportValidity()) return;
  if (getPayment() === 'card') openPayment();
  else finishOrder('utánvéttel fizetendő a futárnak');
});

checkoutForm.addEventListener('change', (e) => {
  if (e.target.name === 'payment') updateTotals();
});

sameBilling.addEventListener('change', toggleBilling);

cardNumber.addEventListener('input', () => {
  cardNumber.value = formatCardNumber(cardNumber.value);
  showCardBrand();
  showCardValues();
});

cardName.addEventListener('input', () => {
  cardName.value = cardName.value.replace(/[0-9]/g, '');
  showCardValues();
});

cardExpiry.addEventListener('input', () => {
  cardExpiry.value = formatExpiry(cardExpiry.value);
  showCardValues();
});

cardCvc.addEventListener('input', () => {
  cardCvc.value = cardCvc.value.replace(/\D/g, '');
  showCardValues();
});

cardCvc.addEventListener('focus', () => creditCard.classList.add('is-flipped'));
cardCvc.addEventListener('blur', () => creditCard.classList.remove('is-flipped'));

cardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (payBtn.classList.contains('is-loading') || !validateCard()) return;
  payBtn.classList.add('is-loading');
  payBtn.disabled = true;
  setTimeout(() => {
    payBtn.classList.remove('is-loading');
    payBtn.disabled = false;
    cardForm.reset();
    document.body.classList.remove('modal-open');
    finishOrder('bankkártyával fizetve');
  }, PAYMENT_DELAY);
});

payClose.addEventListener('click', closePayment);
payOverlay.addEventListener('click', (e) => {
  if (e.target === payOverlay) closePayment();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !payOverlay.hidden) closePayment();
});

async function initCheckout() {
  const products = await loadAllProducts();
  productsById = Object.fromEntries(products.map((product) => [product.ID, product]));
  summary = getCartSummary(productsById);
  if (summary.count === 0) {
    checkoutEmpty.hidden = false;
    return;
  }
  checkoutForm.hidden = false;
  checkoutSummary.hidden = false;
  toggleBilling();
  renderSummary();
}

initCheckout();
