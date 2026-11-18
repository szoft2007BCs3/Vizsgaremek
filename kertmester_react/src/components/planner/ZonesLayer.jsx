import { memo, useMemo } from 'react';
import { findLabelSpot } from '../../lib/geometria.js';
import { formatArea, ringsArea } from '../../lib/format.js';
import { AREA_PATTERNS, AREA_PRODUCTS } from '../../lib/teruletek.js';
import { MIN_LABEL_SIZE, toPathData, toPointsAttribute } from '../../lib/zones.js';

function ZonePattern({ productId }) {
  const look = AREA_PRODUCTS[productId];
  const pattern = AREA_PATTERNS[look.pattern];

  return (
    <pattern id={`pattern-${productId}`} patternUnits="userSpaceOnUse" width={pattern.width} height={pattern.height}>
      <rect width={pattern.width} height={pattern.height} fill={look.color} />
      <g dangerouslySetInnerHTML={{ __html: pattern.shapes(look.mark) }} />
    </pattern>
  );
}

const ZoneShape = memo(function ZoneShape({ zone, garden, offset, rings }) {
  const look = AREA_PRODUCTS[zone.productId];
  const spot = useMemo(() => findLabelSpot(zone.rings), [zone]);
  const maxSize = Math.max(MIN_LABEL_SIZE, Math.max(garden.length, garden.width) / 40);
  const size = Math.min(spot.width / (look.label.length * 0.62), (spot.bounds.maxY - spot.bounds.minY) * 0.2, maxSize);
  const transform = offset ? `translate(${offset.dx.toFixed(3)} ${offset.dy.toFixed(3)})` : undefined;

  return (
    <g transform={transform}>
      <path className="zone-shape" d={toPathData(rings || zone.rings)} fillRule="evenodd" fill={zone.filled ? `url(#pattern-${zone.productId})` : 'none'} stroke={look.mark} />
      <text className="zone-label" x={spot.x.toFixed(2)} y={(spot.y + size * 0.3).toFixed(2)} fontSize={size.toFixed(2)}>{look.label}</text>
      <text className="zone-label" x={spot.x.toFixed(2)} y={(spot.y + size * 1.2).toFixed(2)} fontSize={(size * 0.65).toFixed(2)}>{formatArea(ringsArea(zone.rings))}</text>
    </g>
  );
});

export function ZonesLayer({ zones, garden, moving, reshaping, preview }) {
  const productIds = [...new Set(zones.map((zone) => zone.productId))];

  return (
    <svg className="zones-layer" viewBox={`0 0 ${garden.length} ${garden.width}`} preserveAspectRatio="none">
      <defs>{productIds.map((id) => <ZonePattern key={id} productId={id} />)}</defs>
      {zones.map((zone) => (
        <ZoneShape
          key={zone.id}
          zone={zone}
          garden={garden}
          offset={moving && moving.id === zone.id ? moving : null}
          rings={reshaping && reshaping.id === zone.id ? reshaping.rings : null}
        />
      ))}
      <polygon className="zone-preview" points={preview ? toPointsAttribute(preview.points) : ''} style={preview ? { fill: preview.look.color, stroke: preview.look.mark } : undefined} />
    </svg>
  );
}

export function ZoneTags({ zones, garden, moving, onRemove }) {
  return (
    <div className={`zone-tags${moving ? ' is-moving' : ''}`}>
      {zones.map((zone) => {
        const top = zone.rings.flat().reduce((best, point) => (point.y < best.y ? point : best));
        return (
          <button key={zone.id} type="button" className="zone-remove" aria-label="Terület törlése" style={{ left: `${(top.x / garden.length) * 100}%`, top: `${(top.y / garden.width) * 100}%` }} onClick={() => onRemove(zone.id)}>×</button>
        );
      })}
    </div>
  );
}
