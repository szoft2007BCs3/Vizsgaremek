import { useEffect, useRef, useState } from 'react';
import ProductIcon from '../components/ProductIcon.jsx';
import { PRODUCTS } from '../lib/adatok.js';
import { formatPrice } from '../lib/format.js';
import { detectCardBrand, formatCardNumber, formatExpiry, getBrandInfo, groupDigits, isExpiryValid, isLuhnValid } from '../lib/kartya.js';
import { clearPlan, getCartSummary, getQuantities } from '../lib/store.js';

const SHIPPING_FEE = 1490;
const FREE_SHIPPING_FROM = 30000;
const COD_FEE = 590;
const PAYMENT_DELAY = 2200;

const PRODUCTS_BY_ID = Object.fromEntries(PRODUCTS.map((product) => [product.ID, product]));

const BRAND_LOGOS = {
  visa: <span className="logo-visa">VISA</span>,
  mastercard: <span className="logo-mc"><i></i><i></i></span>,
  amex: <span className="logo-amex">AMEX</span>,
  discover: <span className="logo-discover">DISCOVER</span>,
  diners: <span className="logo-diners">Diners Club</span>,
  jcb: <span className="logo-jcb">JCB</span>,
  unionpay: <span className="logo-unionpay">UnionPay</span>,
  maestro: <span className="logo-mc logo-maestro"><i></i><i></i></span>
};

const EMPTY_CARD = { number: '', name: '', expiry: '', cvc: '' };

function shortProductName(product) {
  return product.Nev.split(' (')[0];
}

function Field({ label, className = '', children }) {
  return (
    <label className={`field ${className}`.trim()}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function CardModal({ total, onClose, onPaid }) {
  const [card, setCard] = useState(EMPTY_CARD);
  const [errors, setErrors] = useState({});
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const numberRef = useRef(null);

  const digits = card.number.replace(/\D/g, '');
  const brand = detectCardBrand(digits);
  const info = getBrandInfo(brand);

  useEffect(() => {
    numberRef.current.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [loading, onClose]);

  function change(field, value) {
    setCard((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const next = {
      number: digits.length === info.length && isLuhnValid(digits) ? '' : 'Érvénytelen kártyaszám.',
      name: card.name.trim().length >= 3 ? '' : 'Add meg a kártyán szereplő nevet.',
      expiry: isExpiryValid(card.expiry) ? '' : 'Érvénytelen vagy lejárt dátum.',
      cvc: card.cvc.length === info.cvcLength ? '' : `${info.cvcLength} számjegy szükséges.`
    };
    setErrors(next);
    return Object.values(next).every((message) => !message);
  }

  function submit(e) {
    e.preventDefault();
    if (loading || !validate()) return;
    setLoading(true);
    setTimeout(() => onPaid(), PAYMENT_DELAY);
  }

  const mask = groupDigits('0'.repeat(info.length), info.groups).split('');
  let position = 0;
  const numberView = mask.map((char) => (char === ' ' ? ' ' : digits[position++] || '•')).join('');
  const logo = BRAND_LOGOS[brand] || null;

  return (
    <div className="pay-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="pay-modal" role="dialog" aria-modal="true" aria-labelledby="payTitle">
        <button type="button" className="pay-close" aria-label="Bezárás" onClick={() => !loading && onClose()}>×</button>
        <h2 id="payTitle">Biztonságos kártyás fizetés</h2>
        <div className="pay-grid">
          <div className="card-scene" aria-hidden="true">
            <div className={`credit-card${flipped ? ' is-flipped' : ''}`} data-brand={brand}>
              <div className="card-face card-front">
                <div className="card-top">
                  <span className="card-chip"></span>
                  <span className="card-brand">{logo}</span>
                </div>
                <div className="card-number">{numberView}</div>
                <div className="card-bottom">
                  <div><small>Kártyabirtokos</small><span>{card.name.trim().toUpperCase() || 'NÉV NÉV'}</span></div>
                  <div><small>Lejárat</small><span>{card.expiry || 'HH/ÉÉ'}</span></div>
                </div>
              </div>
              <div className="card-face card-back">
                <div className="card-stripe"></div>
                <div className="card-sign"><span>CVC</span><strong>{card.cvc || '•'.repeat(info.cvcLength)}</strong></div>
                <span className="card-brand card-brand-back">{logo}</span>
              </div>
            </div>
            <p className="card-type">{brand === 'unknown' ? 'Kártya típusa: add meg a számot' : `Felismert kártya: ${info.name}`}</p>
          </div>

          <form className="card-form" noValidate autoComplete="off" onSubmit={submit}>
            <Field label="Kártyaszám">
              <input ref={numberRef} className={errors.number ? 'is-invalid' : ''} inputMode="numeric" autoComplete="off" placeholder="1234 5678 9012 3456" maxLength={23} value={card.number} onChange={(e) => change('number', formatCardNumber(e.target.value))} />
              <em className="field-error">{errors.number}</em>
            </Field>
            <Field label="Kártyabirtokos neve">
              <input className={errors.name ? 'is-invalid' : ''} autoComplete="off" placeholder="Minta János" maxLength={26} value={card.name} onChange={(e) => change('name', e.target.value.replace(/[0-9]/g, ''))} />
              <em className="field-error">{errors.name}</em>
            </Field>
            <div className="field-grid">
              <Field label="Lejárat (HH/ÉÉ)">
                <input className={errors.expiry ? 'is-invalid' : ''} inputMode="numeric" autoComplete="off" placeholder="HH/ÉÉ" maxLength={5} value={card.expiry} onChange={(e) => change('expiry', formatExpiry(e.target.value))} />
                <em className="field-error">{errors.expiry}</em>
              </Field>
              <Field label="CVC / CVV">
                <input className={errors.cvc ? 'is-invalid' : ''} inputMode="numeric" autoComplete="off" placeholder={'1234'.slice(0, info.cvcLength)} maxLength={info.cvcLength} value={card.cvc} onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)} onChange={(e) => change('cvc', e.target.value.replace(/\D/g, ''))} />
                <em className="field-error">{errors.cvc}</em>
              </Field>
            </div>
            <button type="submit" className={`btn-order pay-submit${loading ? ' is-loading' : ''}`} disabled={loading}>
              <span>{`Fizetek ${formatPrice(total)}`}</span>
              <span className="spinner" aria-hidden="true"></span>
            </button>
            <p className="pay-demo">🔒 Bemutató oldal: valódi fizetés nem történik, a megadott kártyaadatokat nem küldjük el és nem mentjük el sehová.</p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Summary({ summary, shipping, payment, total }) {
  const quantities = getQuantities();
  const ids = Object.keys(quantities).filter((id) => PRODUCTS_BY_ID[id]);

  return (
    <aside className="panel checkout-summary">
      <h2 className="panel-title">Rendelésed</h2>
      <ul className="summary-items">
        {ids.map((id) => (
          <li className="summary-item" key={id}>
            <ProductIcon product={PRODUCTS_BY_ID[id]} />
            <span className="summary-name">{`${shortProductName(PRODUCTS_BY_ID[id])} × ${quantities[id]}`}</span>
            <strong>{formatPrice(PRODUCTS_BY_ID[id].Ar * quantities[id])}</strong>
          </li>
        ))}
      </ul>
      <ul className="summary-discounts">
        {summary.discounts.map((discount) => (
          <li className="cart-discount" key={discount.offer.id}>
            <span className="discount-icon">{discount.offer.icon}</span>
            <span className="discount-name">{`${discount.offer.title} (${discount.detail})`}</span>
            <strong className="discount-amount">{`−${formatPrice(discount.amount)}`}</strong>
          </li>
        ))}
      </ul>
      <dl className="summary-totals">
        <div className="cart-row"><dt>Részösszeg</dt><dd>{formatPrice(summary.subtotal)}</dd></div>
        <div className="cart-row cart-row-saving" hidden={summary.saving === 0}><dt>Kedvezmények</dt><dd>{`−${formatPrice(summary.saving)}`}</dd></div>
        <div className="cart-row"><dt>Szállítás (GLS futár)</dt><dd>{shipping === 0 ? 'Ingyenes' : formatPrice(shipping)}</dd></div>
        <div className="cart-row" hidden={payment !== 'cod'}><dt>Utánvét kezelési díj</dt><dd>{formatPrice(COD_FEE)}</dd></div>
        <div className="cart-row cart-row-total"><dt>Fizetendő</dt><dd>{formatPrice(total)}</dd></div>
      </dl>
      <p className="summary-note">Ingyenes szállítás 30 000 Ft felett.</p>
      <button type="submit" form="checkoutForm" className="btn-order">{payment === 'card' ? 'Tovább a fizetéshez' : 'Megrendelem'}</button>
      <a className="summary-back" href="#/webshop">← Vissza a kosárhoz</a>
    </aside>
  );
}

export default function Rendeles() {
  const [summary] = useState(() => getCartSummary(PRODUCTS_BY_ID));
  const [payment, setPayment] = useState('cod');
  const [sameBilling, setSameBilling] = useState(true);
  const [validated, setValidated] = useState(false);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(null);
  const formRef = useRef(null);

  const shipping = summary.total >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  const total = summary.total + shipping + (payment === 'cod' ? COD_FEE : 0);

  useEffect(() => {
    document.body.classList.toggle('modal-open', paying);
    return () => document.body.classList.remove('modal-open');
  }, [paying]);

  function finish(paymentLabel) {
    const orderNumber = `KM-${Date.now().toString().slice(-8)}`;
    const email = formRef.current.elements.email.value;
    clearPlan();
    setPaying(false);
    setDone(`Rendelésszám: ${orderNumber}. Végösszeg: ${formatPrice(total)} (${paymentLabel}). A visszaigazolást a(z) ${email} címre küldjük.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function submit(e) {
    e.preventDefault();
    setValidated(true);
    if (!formRef.current.reportValidity()) return;
    if (payment === 'card') setPaying(true);
    else finish('utánvéttel fizetendő a futárnak');
  }

  if (done) {
    return (
      <main className="checkout">
        <section className="panel order-done">
          <div className="done-mark" aria-hidden="true">✓</div>
          <h1 className="panel-title">Köszönjük a rendelésedet!</h1>
          <p>{done}</p>
          <a className="btn-submit btn-link" href="#/webshop">Vissza a webshopba</a>
        </section>
      </main>
    );
  }

  if (summary.count === 0) {
    return (
      <main className="checkout">
        <div className="checkout-empty panel">
          <h1 className="panel-title">A kosarad üres</h1>
          <p>Válassz néhány terméket a webshopban, vagy rakd össze a kertedet a tervezőben.</p>
          <a className="btn-submit btn-link" href="#/webshop">Vissza a webshopba</a>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout">
      <form className={`checkout-form${validated ? ' was-validated' : ''}`} id="checkoutForm" ref={formRef} noValidate onSubmit={submit}>
        <h1 className="checkout-title">Megrendelés</h1>

        <section className="panel checkout-section">
          <h2 className="panel-title"><span className="step-no">1</span> Kapcsolattartó</h2>
          <div className="field-grid">
            <Field label="Teljes név" className="span-2"><input name="name" autoComplete="name" required minLength={3} /></Field>
            <Field label="E-mail cím"><input name="email" type="email" autoComplete="email" required /></Field>
            <Field label="Telefonszám"><input name="phone" type="tel" autoComplete="tel" required pattern="[0-9+ \(\)\/\-]{7,}" placeholder="+36 30 123 4567" /></Field>
          </div>
        </section>

        <section className="panel checkout-section">
          <h2 className="panel-title"><span className="step-no">2</span> Szállítási cím</h2>
          <div className="field-grid">
            <Field label="Irányítószám"><input name="zip" inputMode="numeric" autoComplete="postal-code" required pattern="[0-9]{4}" maxLength={4} /></Field>
            <Field label="Település"><input name="city" autoComplete="address-level2" required /></Field>
            <Field label="Utca, házszám" className="span-2"><input name="street" autoComplete="address-line1" required /></Field>
            <Field label="Megjegyzés a futárnak (nem kötelező)" className="span-2"><input name="note" placeholder="Kapucsengő, emelet, átvétel időpontja…" /></Field>
          </div>
        </section>

        <section className="panel checkout-section">
          <h2 className="panel-title"><span className="step-no">3</span> Számlázási cím</h2>
          <label className="check-row">
            <input type="checkbox" checked={sameBilling} onChange={(e) => setSameBilling(e.target.checked)} />
            <span>Megegyezik a szállítási címmel</span>
          </label>
          <div className="field-grid" hidden={sameBilling}>
            <Field label="Név / cégnév" className="span-2"><input name="billName" autoComplete="organization" required={!sameBilling} /></Field>
            <Field label="Irányítószám"><input name="billZip" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} required={!sameBilling} /></Field>
            <Field label="Település"><input name="billCity" required={!sameBilling} /></Field>
            <Field label="Utca, házszám" className="span-2"><input name="billStreet" required={!sameBilling} /></Field>
            <Field label="Adószám (nem kötelező)" className="span-2"><input name="taxNumber" placeholder="12345678-1-12" /></Field>
          </div>
        </section>

        <section className="panel checkout-section">
          <h2 className="panel-title"><span className="step-no">4</span> Fizetési mód</h2>
          <div className="pay-options">
            <label className="pay-option">
              <input type="radio" name="payment" value="cod" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
              <span className="pay-option-body"><span className="pay-option-icon">💵</span><strong>Utánvét</strong><small>Fizetés a futárnak átvételkor · +590 Ft kezelési díj</small></span>
            </label>
            <label className="pay-option">
              <input type="radio" name="payment" value="card" checked={payment === 'card'} onChange={() => setPayment('card')} />
              <span className="pay-option-body"><span className="pay-option-icon">💳</span><strong>Bankkártya</strong><small>Biztonságos fizetés a következő lépésben · nincs felár</small></span>
            </label>
          </div>
        </section>
      </form>

      <Summary summary={summary} shipping={shipping} payment={payment} total={total} />

      {paying && <CardModal total={total} onClose={() => setPaying(false)} onPaid={() => finish('bankkártyával fizetve')} />}
    </main>
  );
}
