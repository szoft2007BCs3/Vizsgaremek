const OFFERS = [
  { id: 1, type: 'buyGet', icon: '🌱', badge: '4+1', title: 'Fűmag: 4 zsák mellé 1 ajándék', text: 'Minden negyedik zsák után az ötödik, a legolcsóbb ingyen jár.', productIds: [21, 22, 23, 24, 27, 30], buy: 4, free: 1 },
  { id: 2, type: 'percent', icon: '🟩', badge: '−10%', title: 'Gyepszőnyeg 10 m² felett', text: 'Tíz négyzetméter gyepszőnyeg fölött 10% kedvezmény.', productIds: [25], minQuantity: 10, percent: 10 },
  { id: 3, type: 'buyGet', icon: '🌸', badge: '3+1', title: 'Évelők: a negyedik ingyen', text: 'Vegyél három évelőt, a negyedik ajándék.', productIds: [1, 2, 3, 5, 6, 7], buy: 3, free: 1 },
  { id: 4, type: 'buyGet', icon: '🌷', badge: '2+1', title: 'Tulipánhagyma: 3 csomag, 2 áráért', text: 'Két csomag mellé a harmadik ingyen van.', productIds: [10], buy: 2, free: 1 },
  { id: 5, type: 'bundle', icon: '🌺', badge: '−400 Ft', title: 'Muskátli csomag', text: 'Kerti muskátli és muskátli tápoldat együtt 400 Ft-tal olcsóbb.', items: { 9: 1, 73: 1 }, amount: 400 },
  { id: 6, type: 'percent', icon: '🌿', badge: '−12%', title: 'Cserjék: 3 darabtól', text: 'Három cserje vagy több vásárlásakor 12% kedvezmény.', productIds: [11, 14, 15, 16, 17, 18, 20], minQuantity: 3, percent: 12 },
  { id: 7, type: 'percent', icon: '🌳', badge: '−10%', title: 'Díszfák: 2 darabtól', text: 'Két díszfa vagy több vásárlásakor 10% kedvezmény.', productIds: [12, 13, 19], minQuantity: 2, percent: 10 },
  { id: 8, type: 'bundle', icon: '🛠️', badge: '−2 500 Ft', title: 'Ásó + gereblye + kapa szett', text: 'A három alapszerszám együtt 2 500 Ft-tal olcsóbb.', items: { 31: 1, 33: 1, 34: 1 }, amount: 2500 },
  { id: 9, type: 'bundle', icon: '🧤', badge: '−500 Ft', title: 'Ültető duó', text: 'Kézi ültetőlapát és kerti kesztyű együtt 500 Ft-tal olcsóbb.', items: { 37: 1, 40: 1 }, amount: 500 },
  { id: 10, type: 'percent', icon: '✂️', badge: '−15%', title: 'Metszőollók: 2 darabtól', text: 'Metszőolló, sövényvágó és ágvágó közül kettő vagy több: 15% kedvezmény.', productIds: [32, 35, 38], minQuantity: 2, percent: 15 },
  { id: 11, type: 'buyGet', icon: '💧', badge: '3+1', title: 'Öntözés: a negyedik ajándék', text: 'Slag, csepegtető, pisztoly, gyorscsatlakozó és kanna: három mellé egy ingyen.', productIds: [41, 44, 45, 47, 49], buy: 3, free: 1 },
  { id: 12, type: 'bundle', icon: '⏲️', badge: '−3 000 Ft', title: 'Automata öntöző szett', text: 'Öntözőóra és két pop-up szórófej együtt 3 000 Ft-tal olcsóbb.', items: { 43: 1, 48: 2 }, amount: 3000 },
  { id: 13, type: 'bundle', icon: '🪑', badge: '−4 000 Ft', title: 'Asztal + 4 szék', text: 'Üveglapos kerti asztal négy székkel 4 000 Ft-tal olcsóbb.', items: { 55: 1, 54: 4 }, amount: 4000 },
  { id: 14, type: 'percent', icon: '💡', badge: '−10%', title: 'Kerti világítás: 4 darabtól', text: 'Négy lámpa vagy több vásárlásakor 10% kedvezmény.', productIds: [61, 62, 64, 66, 67, 68, 69], minQuantity: 4, percent: 10 },
  { id: 15, type: 'threshold', icon: '🎁', badge: '−5%', title: '50 000 Ft felett még 5%', text: 'A többi kedvezmény után 50 000 Ft fölött a teljes összegből további 5% kedvezmény.', minTotal: 50000, percent: 5 }
];

async function loadOffers() {
  return OFFERS;
}

function countUnits(offer, quantities) {
  return offer.productIds.reduce((sum, id) => sum + (quantities[id] || 0), 0);
}

function buyGetDiscount(offer, quantities, productsById) {
  const prices = offer.productIds
    .filter((id) => productsById[id])
    .flatMap((id) => Array(quantities[id] || 0).fill(productsById[id].Ar))
    .sort((a, b) => b - a);
  const freeCount = Math.floor(prices.length / (offer.buy + offer.free)) * offer.free;
  if (!freeCount) return null;
  const amount = prices.slice(prices.length - freeCount).reduce((sum, price) => sum + price, 0);
  return { amount, detail: `${freeCount} db ingyen` };
}

function percentDiscount(offer, quantities, productsById) {
  if (countUnits(offer, quantities) < offer.minQuantity) return null;
  const base = offer.productIds.reduce((sum, id) => sum + (productsById[id] ? (quantities[id] || 0) * productsById[id].Ar : 0), 0);
  return { amount: Math.round((base * offer.percent) / 100), detail: `−${offer.percent}%` };
}

function bundleDiscount(offer, quantities, productsById) {
  const ids = Object.keys(offer.items);
  if (ids.some((id) => !productsById[id])) return null;
  const sets = Math.min(...ids.map((id) => Math.floor((quantities[id] || 0) / offer.items[id])));
  if (!sets) return null;
  return { amount: sets * offer.amount, detail: `${sets} szett` };
}

function calculateDiscounts(quantities, productsById) {
  const discounts = [];
  OFFERS.filter((offer) => offer.type !== 'threshold').forEach((offer) => {
    const calculate = { buyGet: buyGetDiscount, percent: percentDiscount, bundle: bundleDiscount }[offer.type];
    const result = calculate(offer, quantities, productsById);
    if (result && result.amount > 0) discounts.push({ offer, ...result });
  });

  const subtotal = Object.keys(quantities).reduce((sum, id) => sum + (productsById[id] ? quantities[id] * productsById[id].Ar : 0), 0);
  const remaining = subtotal - discounts.reduce((sum, discount) => sum + discount.amount, 0);
  OFFERS.filter((offer) => offer.type === 'threshold' && remaining >= offer.minTotal).forEach((offer) => {
    discounts.push({ offer, amount: Math.round((remaining * offer.percent) / 100), detail: `−${offer.percent}%` });
  });
  return discounts;
}
