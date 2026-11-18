import { useRef } from 'react';
import ProductIcon from '../ProductIcon.jsx';
import { PRODUCTS } from '../../lib/adatok.js';
import { isRotatable, isWoody, OBJECT_SIZES } from '../../lib/meretek.js';
import { findCrowdedTrees } from '../../lib/spacing.js';
import { clamp, movePlacedItem, removePlacedItem, setItemRotation } from '../../lib/store.js';

const ROTATION_STEP = 5;
const PRODUCTS_BY_ID = Object.fromEntries(PRODUCTS.map((product) => [product.ID, product]));

function shortName(product) {
  return product.Nev.split(' (')[0];
}

function PlacedItem({ item, garden, live, blocked, handlers }) {
  const product = PRODUCTS_BY_ID[item.productId];
  const rotatable = isRotatable(item.productId);
  const x = live ? live.x : item.x;
  const y = live ? live.y : item.y;
  const rotation = live && live.rotation !== undefined ? live.rotation : item.rotation || 0;
  const style = { left: `${(x / garden.length) * 100}%`, top: `${(y / garden.width) * 100}%` };
  if (rotatable) {
    style['--len'] = garden.length;
    style['--fh'] = OBJECT_SIZES[item.productId].height;
    style['--rot'] = `${rotation}deg`;
  }

  return (
    <div
      className={`placed-item${blocked ? ' is-blocked' : ''}`}
      tabIndex={0}
      title={product.Nev}
      style={style}
      onPointerDown={(e) => handlers.startMove(e, item)}
      onPointerMove={(e) => handlers.move(e, item)}
      onPointerUp={() => handlers.endMove(item)}
      onPointerCancel={() => handlers.endMove(item)}
      onKeyDown={(e) => handlers.keyDown(e, item)}
    >
      <span className="placed-marker">
        <ProductIcon product={product} />
        <button type="button" className="placed-remove" aria-label="Eltávolítás a tervből" onClick={() => handlers.remove(item)}>×</button>
        {rotatable && (
          <span
            className="rotate-handle"
            title="Forgatás: húzd el"
            onPointerDown={(e) => handlers.startRotate(e, item)}
            onPointerMove={(e) => handlers.rotate(e, item)}
            onPointerUp={() => handlers.endRotate(item)}
            onPointerCancel={() => handlers.endRotate(item)}
          >↻</span>
        )}
      </span>
      <span className="placed-name">{shortName(product)}</span>
    </div>
  );
}

export default function ItemsLayer({ items, garden, live, setLive, setGuide, pointToGarden, commitPlan }) {
  const moveRef = useRef(null);
  const rotateRef = useRef(null);

  function startMove(e, item) {
    if (e.target.closest('.placed-remove') || e.target.closest('.rotate-handle')) return;
    const point = pointToGarden(e.clientX, e.clientY);
    moveRef.current = { offsetX: point.x - item.x, offsetY: point.y - item.y, x: item.x, y: item.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function move(e, item) {
    const drag = moveRef.current;
    if (!drag) return;
    const point = pointToGarden(e.clientX, e.clientY);
    drag.x = clamp(point.x - drag.offsetX, 0, garden.length);
    drag.y = clamp(point.y - drag.offsetY, 0, garden.width);
    setLive({ id: item.id, x: drag.x, y: drag.y, moving: true });
    setGuide({ productId: item.productId, x: drag.x, y: drag.y, ignoredId: item.id });
  }

  function endMove(item) {
    const drag = moveRef.current;
    if (!drag) return;
    moveRef.current = null;
    const changed = drag.x !== item.x || drag.y !== item.y;
    movePlacedItem(item.id, drag.x, drag.y);
    if (changed) commitPlan();
    setLive(null);
    setGuide(null);
  }

  function startRotate(e, item) {
    e.preventDefault();
    e.stopPropagation();
    rotateRef.current = { marker: e.currentTarget.parentElement, rotation: item.rotation || 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function rotate(e, item) {
    const rotation = rotateRef.current;
    if (!rotation) return;
    const rect = rotation.marker.getBoundingClientRect();
    const angle = (Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2)) * 180) / Math.PI + 90;
    rotation.rotation = (((Math.round(angle / ROTATION_STEP) * ROTATION_STEP) % 360) + 360) % 360;
    setLive({ id: item.id, x: item.x, y: item.y, rotation: rotation.rotation });
  }

  function endRotate(item) {
    const rotation = rotateRef.current;
    if (!rotation) return;
    rotateRef.current = null;
    setLive(null);
    if (rotation.rotation === (item.rotation || 0)) return;
    setItemRotation(item.id, rotation.rotation);
    commitPlan();
  }

  function remove(item) {
    removePlacedItem(item.id);
    commitPlan();
  }

  function keyDown(e, item) {
    if (e.target !== e.currentTarget || (e.key !== 'Delete' && e.key !== 'Backspace')) return;
    remove(item);
  }

  const handlers = { startMove, move, endMove, startRotate, rotate, endRotate, remove, keyDown };

  return (
    <div className="items-layer">
      {items.filter((item) => PRODUCTS_BY_ID[item.productId]).map((item) => {
        const itemLive = live && live.id === item.id ? live : null;
        const blocked = Boolean(itemLive && itemLive.moving && isWoody(item.productId) && findCrowdedTrees(item.productId, itemLive.x, itemLive.y, item.id).length);
        return <PlacedItem key={item.id} item={item} garden={garden} live={itemLive} blocked={blocked} handlers={handlers} />;
      })}
    </div>
  );
}
