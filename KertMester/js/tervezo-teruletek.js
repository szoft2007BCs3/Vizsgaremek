const zonesLayer = document.getElementById('zonesLayer');
const zoneTags = document.getElementById('zoneTags');
const zoneGroup = document.getElementById('zoneGroup');
const zoneSwatch = document.getElementById('zoneSwatch');
const zoneName = document.getElementById('zoneName');
const zoneFillBtn = document.getElementById('zoneFillBtn');
const zoneExitBtn = document.getElementById('zoneExitBtn');
const zoneShapeButtons = document.querySelectorAll('[data-zone-shape]');
const toolbar = document.querySelector('.toolbar');

const MIN_ZONE_AREA = 0.5;
const MIN_POINT_DISTANCE = 3;
const SIMPLIFY_TOLERANCE = 2;
const MIN_LABEL_SIZE = 4;
const INK_ALPHA = 64;
const MAX_INK_SAMPLES = 4;

let zoneProduct = null;
let zoneShape = 'freehand';

function toPointsAttribute(points) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
}

function toPathData(rings) {
  return rings.map((ring) => `M${toPointsAttribute(ring).replaceAll(' ', 'L')}Z`).join('');
}

function patternMarkup(productId) {
  const look = AREA_PRODUCTS[productId];
  const pattern = AREA_PATTERNS[look.pattern];
  return `<pattern id="pattern-${productId}" patternUnits="userSpaceOnUse" width="${pattern.width}" height="${pattern.height}"><rect width="${pattern.width}" height="${pattern.height}" fill="${look.color}"/>${pattern.shapes(look.mark)}</pattern>`;
}

function zoneMarkup(zone) {
  const { length, width } = getGarden();
  const look = AREA_PRODUCTS[zone.productId];
  const spot = findLabelSpot(zone.rings);
  const maxSize = Math.max(MIN_LABEL_SIZE, Math.max(length, width) / 40);
  const size = Math.min(spot.width / (look.label.length * 0.62), (spot.bounds.maxY - spot.bounds.minY) * 0.2, maxSize);
  const fill = zone.filled ? `url(#pattern-${zone.productId})` : 'none';

  return `<g data-id="${zone.id}">
    <path class="zone-shape" d="${toPathData(zone.rings)}" fill-rule="evenodd" fill="${fill}" stroke="${look.mark}"/>
    <text class="zone-label" x="${spot.x.toFixed(2)}" y="${(spot.y + size * 0.3).toFixed(2)}" font-size="${size.toFixed(2)}">${look.label}</text>
    <text class="zone-label" x="${spot.x.toFixed(2)}" y="${(spot.y + size * 1.2).toFixed(2)}" font-size="${(size * 0.65).toFixed(2)}">${formatArea(ringsArea(zone.rings))}</text>
  </g>`;
}

function createZoneRemoveButton(zone) {
  const { length, width } = getGarden();
  const top = zone.rings.flat().reduce((best, point) => (point.y < best.y ? point : best));
  const button = createElement('button', 'zone-remove', '×');
  button.type = 'button';
  button.dataset.id = zone.id;
  button.setAttribute('aria-label', 'Terület törlése');
  button.style.left = `${(top.x / length) * 100}%`;
  button.style.top = `${(top.y / width) * 100}%`;
  return button;
}

function renderZones() {
  const { length, width } = getGarden();
  const zones = getZones().filter((zone) => isAreaProduct(zone.productId));
  const productIds = [...new Set(zones.map((zone) => zone.productId))];

  zonesLayer.setAttribute('viewBox', `0 0 ${length} ${width}`);
  zonesLayer.innerHTML = `<defs>${productIds.map(patternMarkup).join('')}</defs>${zones.map(zoneMarkup).join('')}<polygon class="zone-preview"/>`;
  zoneTags.replaceChildren(...zones.map(createZoneRemoveButton));
}

function insertZone(productId, shapeRings, filled) {
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
    if (!masksOverlap(zoneMask, shapeMask)) return;
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

function createInkMask(raster, image) {
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

function carveZonesWithInk() {
  const zones = getZones();
  if (!zones.length) return;
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const result = [];
  let changed = false;

  zones.forEach((zone) => {
    const raster = createRaster(ringsBounds(zone.rings));
    const zoneMask = rasterizeRings(raster, zone.rings);
    const inkMask = createInkMask(raster, image);
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

function updatePreview(points) {
  zonesLayer.querySelector('.zone-preview').setAttribute('points', toPointsAttribute(points));
}

function keepSquare(start, point) {
  const size = Math.max(Math.abs(point.x - start.x), Math.abs(point.y - start.y));
  return { x: start.x + Math.sign(point.x - start.x) * size, y: start.y + Math.sign(point.y - start.y) * size };
}

function createZoneDrag(e) {
  const look = AREA_PRODUCTS[zoneProduct.ID];
  const shape = zoneShape;
  const filled = zoneFillBtn.getAttribute('aria-pressed') === 'true';
  const start = pointToGarden(e.clientX, e.clientY);
  const preview = zonesLayer.querySelector('.zone-preview');
  let points = [start];

  preview.style.fill = look.color;
  preview.style.stroke = look.mark;

  return {
    move(event) {
      let point = pointToGarden(event.clientX, event.clientY);
      if (shape !== 'freehand' && event.shiftKey) point = keepSquare(start, point);

      if (shape === 'rectangle') {
        points = rectanglePoints(start, point);
      } else if (shape === 'ellipse') {
        points = ellipsePoints(start, point);
      } else {
        const previous = points[points.length - 1];
        if (Math.hypot(point.x - previous.x, point.y - previous.y) * view.zoom >= MIN_POINT_DISTANCE) points.push(point);
      }
      updatePreview(points);
    },
    end() {
      updatePreview([]);
      const ring = shape === 'freehand' ? simplifyPoints(points, SIMPLIFY_TOLERANCE / view.zoom) : points;
      if (ring.length < 3 || ringsArea([ring]) < MIN_ZONE_AREA) return;
      insertZone(zoneProduct.ID, [ring], filled);
      carveZonesWithInk();
      commitPlan();
      refreshPlan();
    }
  };
}

function findZoneAt(point) {
  const zones = getZones();
  for (let i = zones.length - 1; i >= 0; i--) {
    const inside = zones[i].rings.filter((ring) => pointInRing(point, ring)).length;
    if (inside % 2 === 1) return zones[i];
  }
  return null;
}

function createZoneMoveDrag(e, zone) {
  const { length, width } = getGarden();
  const bounds = ringsBounds(zone.rings);
  const start = pointToGarden(e.clientX, e.clientY);
  const group = zonesLayer.querySelector(`g[data-id="${zone.id}"]`);
  let dx = 0;
  let dy = 0;
  zoneTags.classList.add('is-moving');

  return {
    move(event) {
      const point = pointToGarden(event.clientX, event.clientY);
      dx = clamp(point.x - start.x, -bounds.minX, length - bounds.maxX);
      dy = clamp(point.y - start.y, -bounds.minY, width - bounds.maxY);
      group.setAttribute('transform', `translate(${dx.toFixed(3)} ${dy.toFixed(3)})`);
    },
    end() {
      zoneTags.classList.remove('is-moving');
      if (Math.hypot(dx, dy) < 0.01) {
        refreshPlan();
        return;
      }
      const moved = zone.rings.map((ring) => ring.map((point) => ({ x: point.x + dx, y: point.y + dy })));
      removeZone(zone.id);
      insertZone(zone.productId, moved, zone.filled);
      carveZonesWithInk();
      commitPlan();
      refreshPlan();
    }
  };
}

function activateZoneTool(product) {
  const look = AREA_PRODUCTS[product.ID];
  zoneProduct = product;
  setTool('zone');
  zoneSwatch.style.background = look.color;
  zoneSwatch.style.borderColor = look.mark;
  zoneName.textContent = look.label;
  zoneGroup.hidden = false;
  toolbar.classList.add('zone-mode');
  document.querySelectorAll('.toolbox-product').forEach((item) => item.classList.toggle('active', Number(item.dataset.id) === product.ID));
}

window.addEventListener('tool-changed', () => {
  if (currentTool === 'zone') return;
  zoneGroup.hidden = true;
  toolbar.classList.remove('zone-mode');
  document.querySelectorAll('.toolbox-product.active').forEach((item) => item.classList.remove('active'));
});

zoneShapeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    zoneShape = button.dataset.zoneShape;
    zoneShapeButtons.forEach((other) => other.classList.toggle('active', other === button));
  });
});

zoneFillBtn.addEventListener('click', () => {
  const isOn = zoneFillBtn.getAttribute('aria-pressed') === 'true';
  zoneFillBtn.setAttribute('aria-pressed', String(!isOn));
  zoneFillBtn.classList.toggle('active', !isOn);
});

zoneExitBtn.addEventListener('click', () => setTool('pen'));

zoneTags.addEventListener('click', (e) => {
  const button = e.target.closest('.zone-remove');
  if (!button) return;
  removeZone(Number(button.dataset.id));
  commitPlan();
  refreshPlan();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentTool === 'zone') setTool('pen');
});
