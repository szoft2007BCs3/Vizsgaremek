import { useState } from 'react';
import ProductIcon from '../ProductIcon.jsx';
import { CATEGORIES, PRODUCTS } from '../../lib/adatok.js';
import { formatPrice, normalizeText } from '../../lib/format.js';
import { isAreaProduct } from '../../lib/teruletek.js';

function CategoryList({ onOpen }) {
  return (
    <ul className="toolbox-list">
      {CATEGORIES.map((category) => (
        <li key={category.ID}>
          <button type="button" className="toolbox-category" onClick={() => onOpen(category)}>
            <strong>{category.Nev}</strong>
            <span>{category.Leiras}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function ProductItem({ product, active, onArea, onDragStart }) {
  const isArea = isAreaProduct(product.ID);
  const className = `toolbox-product${isArea ? ' is-area' : ''}${active ? ' active' : ''}`;

  return (
    <li className={className} data-id={product.ID} title={product.Leiras} onClick={isArea ? () => onArea(product) : undefined} onPointerDown={isArea ? undefined : (e) => onDragStart(e, product)}>
      <ProductIcon product={product} />
      <div className="toolbox-product-text">
        <strong>{product.Nev}</strong>
        <span className="toolbox-meta">
          <span>{product.Meret_Adatok}</span>
          <span className="toolbox-price">{formatPrice(product.Ar)}</span>
        </span>
      </div>
      {isArea && <span className="toolbox-badge">Terület</span>}
    </li>
  );
}

function ProductList({ category, activeProductId, onBack, onArea, onDragStart }) {
  const [query, setQuery] = useState('');
  const text = normalizeText(query.trim());
  const matches = PRODUCTS.filter((product) => product.Kategoria_ID === category.ID && normalizeText(`${product.Nev} ${product.Leiras}`).includes(text));

  return (
    <>
      <div className="toolbox-header">
        <button type="button" className="toolbox-back" onClick={onBack}>← Vissza</button>
        <h3 className="toolbox-heading">{category.Nev}</h3>
      </div>
      <input type="search" className="toolbox-search" placeholder={`Keresés: ${category.Nev}`} aria-label={`Keresés a(z) ${category.Nev} kategóriában`} autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
      <p className="toolbox-hint">Húzd a terméket a tervezőre (érintőn koppints rá). A „Terület” jelzésű termékekre kattintva körberajzolhatod a kívánt részt.</p>
      <ul className="toolbox-list">
        {matches.length === 0 && <li className="toolbox-empty">Nincs találat ebben a kategóriában.</li>}
        {matches.map((product) => (
          <ProductItem key={product.ID} product={product} active={product.ID === activeProductId} onArea={onArea} onDragStart={onDragStart} />
        ))}
      </ul>
    </>
  );
}

export default function Toolbox({ activeProductId, onArea, onDragStart }) {
  const [category, setCategory] = useState(null);

  return (
    <div className="toolbox">
      {category ? (
        <ProductList category={category} activeProductId={activeProductId} onBack={() => setCategory(null)} onArea={onArea} onDragStart={onDragStart} />
      ) : (
        <CategoryList onOpen={setCategory} />
      )}
    </div>
  );
}
