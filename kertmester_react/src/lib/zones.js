import { boundsOverlap, createRaster, maskToShapes, masksOverlap, mergeBounds, pointInRing, rasterizeRings, ringsBounds, subtractMask, unionMasks } from './geometria.js';
import { ringsArea } from './format.js';
import { clamp, createZone, getZones, setZones } from './store.js';
import { coexistsWithPath, isAreaProduct, zoneDrawOrder } from './teruletek.js';

export const MIN_ZONE_AREA = 0.5;
export const MIN_POINT_DISTANCE = 3;
export const SIMPLIFY_TOLERANCE = 2;
export const MIN_LABEL_SIZE = 4;
const INK_ALPHA = 64;
const MAX_INK_SAMPLES = 4;
const EDGE_GRAB_PIXELS = 8;

export function toPointsAttribute(points) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
}

export function toPathData(rings) {
  return rings.map((ring) => `M${toPointsAttribute(ring).replaceAll(' ', 'L')}Z`).join('');
}

export function orderedZones() {
  return getZones().filter((zone) => isAreaProduct(zone.productId)).sort((a, b) => zoneDrawOrder(a) - zoneDrawOrder(b));
}

export function insertZone(productId, shapeRings, filled) {
  const zones = getZones();
  const shapeBounds = ringsBounds(shapeRings);
  const nearby = zones.filter((zone) => boundsOverlap(ringsBounds(zone.rings), shapeBounds));
  const raster = createRaster(mergeBounds([shapeBounds, ...nearby.map((zone) => ringsBounds(zone.rings))]));
  const shapeMask = rasterizeRings(raster, shapeRings);

  const replaced = [];
  const pieces = [];
  let mergedMask = shapeMask;

  nearby.forEach((zone) => {
    const zoneMask = rasterizeRings(raster, zone.rings);
    if (!masksOverlap(zoneMask, shapeMask) || (zone.productId !== productId && coexistsWithPath(zone.productId, productId))) return;
    replaced.push(zone);
    if (zone.productId === productId) {
      mergedMask = unionMasks(mergedMask, zoneMask);
    } else {
      maskToShapes(raster, subtractMask(zoneMask, shapeMask), MIN_ZONE_AREA).forEach((rings) => {
        pieces.push(createZone(zone.productId, rings, zone.filled));
      });
    }
  });

  const created = replaced.length
    ? maskToShapes(raster, mergedMask, MIN_ZONE_AREA).map((rings) => createZone(productId, rings, filled))
    : [createZone(productId, shapeRings, filled)];

  setZones([...zones.filter((zone) => !replaced.includes(zone)), ...pieces, ...created]);
}

function createInkMask(raster, image, pixelsPerMeter) {
  const { minX, minY, cell, cols, rows } = raster;
  const mask = new Uint8Array(cols * rows);
  const cellPixels = cell * pixelsPerMeter;
  const samples = Math.min(MAX_INK_SAMPLES, Math.max(1, Math.ceil(cellPixels)));

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < cols; column++) {
      search: for (let i = 0; i < samples; i++) {
        for (let j = 0; j < samples; j++) {
          const x = Math.floor((minX + (column + (j + 0.5) / samples) * cell) * pixelsPerMeter);
          const y = Math.floor((minY + (row + (i + 0.5) / samples) * cell) * pixelsPerMeter);
          if (x < 0 || y < 0 || x >= image.width || y >= image.height) continue;
          if (image.data[(y * image.width + x) * 4 + 3] >= INK_ALPHA) {
            mask[row * cols + column] = 1;
            break search;
          }
        }
      }
    }
  }
  return mask;
}

export function carveZonesWithInk(ctx, canvas, pixelsPerMeter) {
  const zones = getZones();
  if (!zones.length) return;
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const result = [];
  let changed = false;

  zones.forEach((zone) => {
    const raster = createRaster(ringsBounds(zone.rings));
    const zoneMask = rasterizeRings(raster, zone.rings);
    const inkMask = createInkMask(raster, image, pixelsPerMeter);
    if (!masksOverlap(zoneMask, inkMask)) {
      result.push(zone);
      return;
    }
    changed = true;
    maskToShapes(raster, subtractMask(zoneMask, inkMask), MIN_ZONE_AREA).forEach((rings) => {
      result.push(createZone(zone.productId, rings, zone.filled));
    });
  });

  if (changed) setZones(result);
}

export function keepSquare(start, point) {
  const size = Math.max(Math.abs(point.x - start.x), Math.abs(point.y - start.y));
  return { x: start.x + Math.sign(point.x - start.x) * size, y: start.y + Math.sign(point.y - start.y) * size };
}

export function findZoneAt(point) {
  const zones = orderedZones();
  for (let i = zones.length - 1; i >= 0; i--) {
    const inside = zones[i].rings.filter((ring) => pointInRing(point, ring)).length;
    if (inside % 2 === 1) return zones[i];
  }
  return null;
}

function nearestOnSegment(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared ? clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared, 0, 1) : 0;
  const x = a.x + t * dx;
  const y = a.y + t * dy;
  return { x, y, distance: Math.hypot(point.x - x, point.y - y) };
}

export function findEdgeAt(point, zoom) {
  const limit = EDGE_GRAB_PIXELS / zoom;
  const zones = orderedZones();
  for (let z = zones.length - 1; z >= 0; z--) {
    let best = null;
    zones[z].rings.forEach((ring, ringIndex) => {
      ring.forEach((corner, i) => {
        const cornerDistance = Math.hypot(point.x - corner.x, point.y - corner.y);
        if (cornerDistance <= limit && (!best || cornerDistance < best.distance)) {
          best = { zone: zones[z], ringIndex, vertexIndex: i, distance: cornerDistance };
        }
      });
    });
    if (best) return best;
    zones[z].rings.forEach((ring, ringIndex) => {
      ring.forEach((corner, i) => {
        const near = nearestOnSegment(point, corner, ring[(i + 1) % ring.length]);
        if (near.distance <= limit && (!best || near.distance < best.distance)) {
          best = { zone: zones[z], ringIndex, segmentIndex: i, point: { x: near.x, y: near.y }, distance: near.distance };
        }
      });
    });
    if (best) return best;
  }
  return null;
}
