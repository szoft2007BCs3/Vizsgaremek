import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import ProductIcon from '../components/ProductIcon.jsx';
import { CATEGORIES, PRODUCTS } from '../lib/adatok.js';
import { OFFERS } from '../lib/ajanlatok.js';
import { formatArea, formatPrice, normalizeText } from '../lib/format.js';
import {
  decreaseQuantity,
  getCartSummary,
  getExtraCount,
  getPlacedCount,
  getQuantities,
  getZoneArea,
  increaseQuantity,
  removeProduct
} from '../lib/store.js';
import { isAreaProduct } from '../lib/teruletek.js';
import { usePlan } from '../lib/usePlan.js';
import { navigate } from '../lib/useRoute.js';

const OFFER_SCROLL_SPEED = 26;
const PRODUCTS_BY_ID = Object.fromEntries(PRODUCTS.map((product) => [product.ID, product]));
const CATEGORIES_BY_ID = Object.fromEntries(CATEGORIES.map((category) => [category.ID, category]));

function OfferCard({ offer, active, hidden }) {
  return (
    <article className={`offer-card${active ? ' is-active' : ''}`} aria-hidden={hidden || undefined}>
      <span className="offer-icon">{offer.icon}</span>
      <strong className="offer-title">{offer.title}</strong>
      <span className="offer-badge">{offer.badge}</span>
      <p className="offer-text">{offer.text}</p>
    </article>
  );
}

function Offers({ activeIds }) {
  const trackRef = useRef(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    track.style.setProperty('--scroll-time', `${track.scrollHeight / 2 / OFFER_SCROLL_SPEED}s`);
  }, []);

  return (
    <aside className="panel shop-offers">
      <h2 className="panel-title">Ajánlatok</h2>
      <div className="offer-marquee">
        <div className="offer-track" ref={trackRef}>
          {OFFERS.map((offer) => <OfferCard key={offer.id} offer={offer} active={activeIds.has(offer.id)} />)}
          {OFFERS.map((offer) => <OfferCard key={`copy-${offer.id}`} offer={offer} active={activeIds.has(offer.id)} hidden />)}
        </div>
      </div>
    </aside>
  );
}

function ProductCard({ product }) {
  const category = CATEGORIES_BY_ID[product.Kategoria_ID];
  return (
    <li className="shop-product">
      <div className="shop-product-head">
        <ProductIcon product={product} />
        <strong>{product.Nev}</strong>
      </div>
      <p className="shop-product-desc">{product.Leiras}</p>
      <span className="shop-product-meta">{`${category ? category.Nev : ''} · ${product.Meret_Adatok}`}</span>
      <div className="shop-product-foot">
        <span className="shop-price">{formatPrice(product.Ar)}</span>
        <button type="button" className="btn-add" onClick={() => increaseQuantity(product.ID)}>Kosárba</button>
      </div>
    </li>
  );
}

function CartItem({ product, quantity }) {
  const placed = getPlacedCount(product.ID);
  const area = getZoneArea(product.ID);
  const details = [`${formatPrice(product.Ar)} / db`];
  if (placed) details.push(`tervben: ${placed} db`);
  if (area) details.push(`tervben: ${formatArea(area)}`);
  const areaLocked = isAreaProduct(product.ID) && getExtraCount(product.ID) === 0;

  return (
    <li className="cart-item">
      <div className="cart-item-info">
        <strong>{product.Nev}</strong>
        <span className="cart-item-meta">{details.join(' · ')}</span>
      </div>
      <button type="button" className="cart-item-remove" aria-label="Termék törlése a kosárból" onClick={() => removeProduct(product.ID)}>×</button>
      <div className="cart-item-controls">
        <button type="button" className="qty-btn" aria-label="Eggyel kevesebb" disabled={areaLocked} title={areaLocked ? 'A területet a tervezőben tudod törölni' : undefined} onClick={() => decreaseQuantity(product.ID)}>−</button>
        <span className="qty-value">{quantity}</span>
        <button type="button" className="qty-btn" aria-label="Eggyel több" onClick={() => increaseQuantity(product.ID)}>+</button>
      </div>
      <strong className="cart-item-total">{formatPrice(product.Ar * quantity)}</strong>
    </li>
  );
}

function Cart({ summary }) {
  const quantities = getQuantities();
  const ids = Object.keys(quantities).map(Number).sort((a, b) => a - b).filter((id) => PRODUCTS_BY_ID[id]);
  const hasDiscounts = summary.discounts.length > 0;

  return (
    <aside className="panel shop-cart">
      <h2 className="panel-title">Kosár</h2>
      <ul className="cart-list">
        {ids.map((id) => <CartItem key={id} product={PRODUCTS_BY_ID[id]} quantity={quantities[id]} />)}
      </ul>
      <p className="cart-empty" hidden={ids.length > 0}>A kosár üres. Húzz termékeket a tervezőbe, vagy add hozzá őket a katalógusból.</p>
      <ul className="cart-discounts" hidden={!hasDiscounts}>
        {summary.discounts.map((discount) => (
          <li className="cart-discount" key={discount.offer.id}>
            <span className="discount-icon">{discount.offer.icon}</span>
            <span className="discount-name">{`${discount.offer.title} (${discount.detail})`}</span>
            <strong className="discount-amount">{`−${formatPrice(discount.amount)}`}</strong>
          </li>
        ))}
      </ul>
      <dl className="cart-footer">
        <div className="cart-row" hidden={!hasDiscounts}><dt>Részösszeg</dt><dd>{formatPrice(summary.subtotal)}</dd></div>
        <div className="cart-row cart-row-saving" hidden={!hasDiscounts}><dt>Megtakarítás</dt><dd>{`−${formatPrice(summary.saving)}`}</dd></div>
        <div className="cart-row cart-row-total"><dt>Összesen (<span>{summary.count}</span> db)</dt><dd>{formatPrice(summary.total)}</dd></div>
      </dl>
      <button type="button" className="btn-order" disabled={summary.count === 0} onClick={() => navigate('rendeles')}>Megrendelés</button>
    </aside>
  );
}

export default function Webshop({ params }) {
  usePlan();
  const [query, setQuery] = useState(params.get('q') || '');
  const [categoryId, setCategoryId] = useState(CATEGORIES_BY_ID[params.get('kat')] ? params.get('kat') : '');

  const visible = useMemo(() => {
    const text = normalizeText(query.trim());
    return PRODUCTS.filter((product) => {
      const matchesCategory = !categoryId || product.Kategoria_ID === Number(categoryId);
      return matchesCategory && normalizeText(`${product.Nev} ${product.Leiras}`).includes(text);
    });
  }, [query, categoryId]);

  const summary = getCartSummary(PRODUCTS_BY_ID);
  const activeIds = new Set(summary.discounts.map((discount) => discount.offer.id));

  return (
    <main className="shop">
      <Offers activeIds={activeIds} />

      <section className="panel shop-items">
        <h2 className="panel-title">Termékek</h2>
        <div className="shop-filters">
          <input type="search" className="shop-search" placeholder="Keresés a termékek között…" aria-label="Keresés" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="shop-select" aria-label="Kategória" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Minden kategória</option>
            {CATEGORIES.map((category) => <option key={category.ID} value={category.ID}>{category.Nev}</option>)}
          </select>
        </div>
        <ul className="shop-list">
          {visible.map((product) => <ProductCard key={product.ID} product={product} />)}
        </ul>
        <p className="shop-empty" hidden={visible.length > 0}>Nincs a keresésnek megfelelő termék.</p>
      </section>

      <Cart summary={summary} />
    </main>
  );
}
