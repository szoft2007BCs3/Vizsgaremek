const zonesLayer = document.getElementById('zonesLayer');
const zoneTags = document.getElementById('zoneTags');
const zoneGroup = document.getElementById('zoneGroup');
const zoneSwatch = document.getElementById('zoneSwatch');
const zoneName = document.getElementById('zoneName');
const zoneRectBtn = document.getElementById('zoneRectBtn');
const zoneExitBtn = document.getElementById('zoneExitBtn');

const MIN_ZONE_AREA = 0.5;
const MIN_POINT_DISTANCE = 3;
const SIMPLIFY_TOLERANCE = 2;

let zoneProduct = null;

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

function rectanglePoints(a, b) {
  return [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }];
}

function polygonCenter(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  };
}

function toPointsAttribute(points) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
}

function patternMarkup(productId) {
  const look = AREA_PRODUCTS[productId];
  const pattern = AREA_PATTERNS[look.pattern];
  return `<pattern id="pattern-${productId}" patternUnits="userSpaceOnUse" width="${pattern.width}" height="${pattern.height}"><rect width="${pattern.width}" height="${pattern.height}" fill="${look.color}"/>${pattern.shapes(look.mark)}</pattern>`;
}

function zoneMarkup(zone) {
  const look = AREA_PRODUCTS[zone.productId];
  const box = polygonCenter(zone.points);
  const size = Math.min(box.width / (look.label.length * 0.62), box.height * 0.3, 4);
  const area = formatArea(polygonArea(zone.points));

  return `<g>
    <polygon class="zone-shape" points="${toPointsAttribute(zone.points)}" fill="url(#pattern-${zone.productId})" stroke="${look.mark}"/>
    <text class="zone-label" x="${box.x.toFixed(2)}" y="${(box.y - size * 0.1).toFixed(2)}" font-size="${size.toFixed(2)}">${look.label}</text>
    <text class="zone-label" x="${box.x.toFixed(2)}" y="${(box.y + size * 0.9).toFixed(2)}" font-size="${(size * 0.65).toFixed(2)}">${area}</text>
  </g>`;
}

function createZoneRemoveButton(zone) {
  const { length, width } = getGarden();
  const top = zone.points.reduce((best, point) => (point.y < best.y ? point : best));
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

function updatePreview(points) {
  zonesLayer.querySelector('.zone-preview').setAttribute('points', toPointsAttribute(points));
}

function createZoneDrag(e) {
  const look = AREA_PRODUCTS[zoneProduct.ID];
  const isRectangle = zoneRectBtn.getAttribute('aria-pressed') === 'true';
  const start = pointToGarden(e.clientX, e.clientY);
  const preview = zonesLayer.querySelector('.zone-preview');
  let points = [start];

  preview.style.fill = look.color;
  preview.style.stroke = look.mark;

  return {
    move(event) {
      const point = pointToGarden(event.clientX, event.clientY);
      const previous = points[points.length - 1];
      if (isRectangle) {
        points = rectanglePoints(start, point);
      } else if (Math.hypot(point.x - previous.x, point.y - previous.y) * view.zoom >= MIN_POINT_DISTANCE) {
        points.push(point);
      }
      updatePreview(points);
    },
    end() {
      updatePreview([]);
      const shape = isRectangle ? points : simplifyPoints(points, SIMPLIFY_TOLERANCE / view.zoom);
      if (shape.length < 3 || polygonArea(shape) < MIN_ZONE_AREA) return;
      addZone(zoneProduct.ID, shape);
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
  document.querySelectorAll('.toolbox-product').forEach((item) => item.classList.toggle('active', Number(item.dataset.id) === product.ID));
}

window.addEventListener('tool-changed', () => {
  if (currentTool === 'zone') return;
  zoneGroup.hidden = true;
  document.querySelectorAll('.toolbox-product.active').forEach((item) => item.classList.remove('active'));
});

zoneRectBtn.addEventListener('click', () => {
  const isOn = zoneRectBtn.getAttribute('aria-pressed') === 'true';
  zoneRectBtn.setAttribute('aria-pressed', String(!isOn));
  zoneRectBtn.classList.toggle('active', !isOn);
});

zoneExitBtn.addEventListener('click', () => setTool('pen'));

zoneTags.addEventListener('click', (e) => {
  const button = e.target.closest('.zone-remove');
  if (!button) return;
  removeZone(Number(button.dataset.id));
  refreshPlan();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentTool === 'zone') setTool('pen');
});
