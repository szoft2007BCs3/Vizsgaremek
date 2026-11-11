const MAX_RASTER_SIDE = 1000;
const MIN_RASTER_CELL = 0.02;
const RASTER_PADDING = 2;
const LABEL_ROWS = 9;

function ringsBounds(rings) {
  const points = rings.flat();
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

function mergeBounds(list) {
  return {
    minX: Math.min(...list.map((bounds) => bounds.minX)),
    minY: Math.min(...list.map((bounds) => bounds.minY)),
    maxX: Math.max(...list.map((bounds) => bounds.maxX)),
    maxY: Math.max(...list.map((bounds) => bounds.maxY))
  };
}

function boundsOverlap(a, b) {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

function distanceToSegment(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared ? clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared, 0, 1) : 0;
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

function simplifyPoints(points, tolerance) {
  if (points.length < 3) return points;
  const last = points.length - 1;
  let farthest = 0;
  let index = 0;
  for (let i = 1; i < last; i++) {
    const distance = distanceToSegment(points[i], points[0], points[last]);
    if (distance > farthest) {
      farthest = distance;
      index = i;
    }
  }
  if (farthest <= tolerance) return [points[0], points[last]];
  return [...simplifyPoints(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplifyPoints(points.slice(index), tolerance)];
}

function simplifyRing(ring, tolerance) {
  let farthest = 0;
  let index = 0;
  ring.forEach((point, i) => {
    const distance = Math.hypot(point.x - ring[0].x, point.y - ring[0].y);
    if (distance > farthest) {
      farthest = distance;
      index = i;
    }
  });
  const first = simplifyPoints(ring.slice(0, index + 1), tolerance);
  const second = simplifyPoints([...ring.slice(index), ring[0]], tolerance);
  return [...first.slice(0, -1), ...second.slice(0, -1)];
}

function pointInRing(point, ring) {
  let inside = false;
  ring.forEach((a, i) => {
    const b = ring[(i + 1) % ring.length];
    if (a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  });
  return inside;
}

function rectanglePoints(a, b) {
  return [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }];
}

function ellipsePoints(a, b, segments = 64) {
  const centerX = (a.x + b.x) / 2;
  const centerY = (a.y + b.y) / 2;
  const radiusX = Math.abs(b.x - a.x) / 2;
  const radiusY = Math.abs(b.y - a.y) / 2;
  return Array.from({ length: segments }, (_, i) => {
    const angle = (i / segments) * Math.PI * 2;
    return { x: centerX + radiusX * Math.cos(angle), y: centerY + radiusY * Math.sin(angle) };
  });
}

function ringEdges(rings) {
  const edges = [];
  rings.forEach((ring) => {
    ring.forEach((a, i) => {
      const b = ring[(i + 1) % ring.length];
      if (a.y !== b.y) edges.push(a.y < b.y ? [a, b] : [b, a]);
    });
  });
  return edges;
}

function crossingsAt(edges, y) {
  return edges
    .filter(([top, bottom]) => top.y <= y && y < bottom.y)
    .map(([top, bottom]) => top.x + ((y - top.y) * (bottom.x - top.x)) / (bottom.y - top.y))
    .sort((a, b) => a - b);
}

function findLabelSpot(rings) {
  const bounds = ringsBounds(rings);
  const edges = ringEdges(rings);
  let best = { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2, width: 0 };

  for (let i = 1; i <= LABEL_ROWS; i++) {
    const y = bounds.minY + ((bounds.maxY - bounds.minY) * i) / (LABEL_ROWS + 1);
    const crossings = crossingsAt(edges, y);
    for (let k = 0; k + 1 < crossings.length; k += 2) {
      const width = crossings[k + 1] - crossings[k];
      if (width > best.width) best = { x: (crossings[k] + crossings[k + 1]) / 2, y, width };
    }
  }
  return { ...best, bounds };
}

function createRaster(bounds) {
  const cell = Math.max(MIN_RASTER_CELL, Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) / MAX_RASTER_SIDE);
  const minX = bounds.minX - RASTER_PADDING * cell;
  const minY = bounds.minY - RASTER_PADDING * cell;
  return {
    minX,
    minY,
    cell,
    cols: Math.ceil((bounds.maxX - minX) / cell) + RASTER_PADDING,
    rows: Math.ceil((bounds.maxY - minY) / cell) + RASTER_PADDING
  };
}

function rasterizeRings(raster, rings) {
  const { minX, minY, cell, cols, rows } = raster;
  const mask = new Uint8Array(cols * rows);
  const edges = ringEdges(rings);

  for (let row = 0; row < rows; row++) {
    const crossings = crossingsAt(edges, minY + (row + 0.5) * cell);
    for (let k = 0; k + 1 < crossings.length; k += 2) {
      const from = Math.max(0, Math.ceil((crossings[k] - minX) / cell - 0.5));
      const to = Math.min(cols, Math.ceil((crossings[k + 1] - minX) / cell - 0.5));
      if (to > from) mask.fill(1, row * cols + from, row * cols + to);
    }
  }
  return mask;
}

function masksOverlap(a, b) {
  return a.some((value, i) => value && b[i]);
}

function unionMasks(a, b) {
  return a.map((value, i) => (value || b[i] ? 1 : 0));
}

function subtractMask(a, b) {
  return a.map((value, i) => (value && !b[i] ? 1 : 0));
}

function traceMask(raster, mask) {
  const { minX, minY, cell, cols, rows } = raster;
  const stride = cols + 1;
  const outgoing = new Map();

  const isFilled = (column, row) => column >= 0 && column < cols && row >= 0 && row < rows && mask[row * cols + column] === 1;
  const addEdge = (x1, y1, x2, y2) => {
    const from = y1 * stride + x1;
    if (!outgoing.has(from)) outgoing.set(from, []);
    outgoing.get(from).push(y2 * stride + x2);
  };

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < cols; column++) {
      if (!isFilled(column, row)) continue;
      if (!isFilled(column, row - 1)) addEdge(column, row, column + 1, row);
      if (!isFilled(column + 1, row)) addEdge(column + 1, row, column + 1, row + 1);
      if (!isFilled(column, row + 1)) addEdge(column + 1, row + 1, column, row + 1);
      if (!isFilled(column - 1, row)) addEdge(column, row + 1, column, row);
    }
  }

  const loops = [];
  outgoing.forEach((targets, start) => {
    while (targets.length) {
      const loop = [];
      let current = start;
      do {
        loop.push(current);
        current = outgoing.get(current).pop();
      } while (current !== start);
      loops.push(loop.map((key) => ({ x: minX + (key % stride) * cell, y: minY + Math.floor(key / stride) * cell })));
    }
  });
  return loops;
}

function maskToShapes(raster, mask, minArea) {
  const rings = traceMask(raster, mask)
    .map((ring) => simplifyRing(ring, raster.cell * 0.9))
    .filter((ring) => ring.length >= 3);

  const shapes = rings.filter((ring) => signedRingArea(ring) > 0).map((ring) => [ring]);
  rings
    .filter((ring) => signedRingArea(ring) < 0)
    .forEach((hole) => {
      const owners = shapes.filter((shape) => pointInRing(hole[0], shape[0]));
      owners.sort((a, b) => ringsArea([a[0]]) - ringsArea([b[0]]));
      if (owners.length) owners[0].push(hole);
    });

  return shapes.filter((shape) => ringsArea(shape) >= minArea);
}
