import { getPlantSize, getSpacingRadius, isWoody, OBJECT_SIZES } from '../../lib/meretek.js';
import { findCrowdedTrees } from '../../lib/spacing.js';

function PlantFootprint({ size, mature }) {
  if (!mature) {
    return <circle r={size.sapling / 2} fill={size.color} fillOpacity="0.55" stroke={size.color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />;
  }
  const radius = size.mature / 2;
  if (size.kind === 'flower') {
    return <circle r={radius} fill={size.color} fillOpacity="0.35" stroke={size.color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />;
  }
  return (
    <>
      <circle r={radius} fill="url(#canopy-shadow)" stroke="#0F2A17" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
      <circle r={Math.max(size.trunk, 0.1) / 2} fill="#5A3E24" stroke="#2E1E10" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </>
  );
}

function ObjectFootprint({ size }) {
  if (size.coverage) {
    return <circle r={size.coverage} fill="#6EB5E8" fillOpacity="0.18" stroke="#3F8FC9" strokeDasharray="6 4" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />;
  }
  if (size.shape === 'round') {
    return <circle r={size.width / 2} fill={size.color} fillOpacity="0.85" stroke="#4A3B2A" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />;
  }
  return <rect x={-size.width / 2} y={-size.height / 2} width={size.width} height={size.height} rx={Math.min(size.width, size.height) * 0.08} fill={size.color} fillOpacity="0.88" stroke="#4A3B2A" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />;
}

function Footprint({ item, mature, live }) {
  const plant = getPlantSize(item.productId);
  const object = OBJECT_SIZES[item.productId];
  if (!plant && !object) return null;
  const x = live ? live.x : item.x;
  const y = live ? live.y : item.y;
  const rotation = live && live.rotation !== undefined ? live.rotation : item.rotation || 0;

  return (
    <g className="footprint" transform={`translate(${x} ${y}) rotate(${rotation})`}>
      {plant ? <PlantFootprint size={plant} mature={mature} /> : <ObjectFootprint size={object} />}
    </g>
  );
}

function SpacingGuides({ guide, items }) {
  if (!guide || !isWoody(guide.productId)) return null;
  const crowded = findCrowdedTrees(guide.productId, guide.x, guide.y, guide.ignoredId);

  return (
    <g className="spacing-guides">
      {items
        .filter((other) => other.id !== guide.ignoredId && isWoody(other.productId))
        .map((other) => (
          <circle key={other.id} className={crowded.includes(other) ? 'guide-blocked' : 'guide-free'} cx={other.x} cy={other.y} r={getSpacingRadius(other.productId, guide.productId)} />
        ))}
      <circle className="guide-own" cx={guide.x} cy={guide.y} r={getPlantSize(guide.productId).mature / 2} />
    </g>
  );
}

export default function FootprintsLayer({ garden, items, mature, live, guide }) {
  return (
    <svg className="footprints-layer" viewBox={`0 0 ${garden.length} ${garden.width}`} preserveAspectRatio="none">
      <defs>
        <radialGradient id="canopy-shadow">
          <stop offset="0" stopColor="#0F2A17" stopOpacity="0.62" />
          <stop offset="0.7" stopColor="#143B23" stopOpacity="0.42" />
          <stop offset="1" stopColor="#143B23" stopOpacity="0.12" />
        </radialGradient>
      </defs>
      {items.map((item) => <Footprint key={item.id} item={item} mature={mature} live={live && live.id === item.id ? live : null} />)}
      <SpacingGuides guide={guide} items={items} />
    </svg>
  );
}
