import { PRODUCT_SVG, PRODUCT_EMOJI } from '../lib/ikonok.js';
import { CATEGORY_LOOK, DEFAULT_LOOK } from '../lib/format.js';

export default function ProductIcon({ product, className = '', style }) {
  const look = CATEGORY_LOOK[product.Kategoria_ID] || DEFAULT_LOOK;

  if (PRODUCT_SVG[product.ID]) {
    return (
      <span className={`product-icon has-svg ${className}`.trim()} style={{ borderColor: look.color, ...style }}>
        <svg viewBox="0 0 32 32" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PRODUCT_SVG[product.ID] }} />
      </span>
    );
  }

  return (
    <span className={`product-icon ${className}`.trim()} style={{ background: look.color, ...style }}>
      {PRODUCT_EMOJI[product.ID] || look.icon}
    </span>
  );
}
