const container = document.getElementById('canvasContainer');
const stage = document.getElementById('stage');
const gridCanvas = document.getElementById('gridCanvas');
const rulerCanvas = document.getElementById('rulerCanvas');
const gridCtx = gridCanvas.getContext('2d');
const rulerCtx = rulerCanvas.getContext('2d');
const scaleBarLine = document.getElementById('scaleBarLine');
const scaleBarLabel = document.getElementById('scaleBarLabel');

const RULER_SIZE = 24;
const FIT_MARGIN = 28;
const MAX_ZOOM = 200;
const MAX_STAGE_SIZE = 16000;
const MIN_VISIBLE = 80;
const MIN_GRID_CELL = 20;
const MAJOR_EVERY = 5;
const GRID_STEPS = [1, 2, 5, 10, 20, 50];
const SCALE_STEPS = [1, 2, 5, 10, 20, 50, 100];
const BUTTON_ZOOM = 1.25;

const view = { zoom: 1, panX: 0, panY: 0 };
let autoFit = true;

const css = getComputedStyle(document.documentElement);
const palette = Object.fromEntries(
  ['cream', 'butter', 'moss', 'sage-line', 'forest', 'gold'].map((name) => [name, css.getPropertyValue(`--${name}`).trim()])
);

function viewportSize() {
  return { width: container.clientWidth, height: container.clientHeight };
}

function fitZoom() {
  const { length, width } = getGarden();
  const size = viewportSize();
  const availableWidth = size.width - RULER_SIZE - FIT_MARGIN * 2;
  const availableHeight = size.height - RULER_SIZE - FIT_MARGIN * 2;
  return Math.max(0.5, Math.min(availableWidth / length, availableHeight / width));
}

function zoomLimits() {
  const { length, width } = getGarden();
  const fit = fitZoom();
  return { min: fit * 0.5, max: Math.max(fit, Math.min(MAX_ZOOM, MAX_STAGE_SIZE / Math.max(length, width))) };
}

function pointToGarden(clientX, clientY) {
  const rect = stage.getBoundingClientRect();
  const { length, width } = getGarden();
  return {
    x: clamp(((clientX - rect.left) / rect.width) * length, 0, length),
    y: clamp(((clientY - rect.top) / rect.height) * width, 0, width)
  };
}

function prepareCanvas(element, context) {
  const ratio = window.devicePixelRatio || 1;
  const { width, height } = viewportSize();
  if (element.width !== Math.round(width * ratio) || element.height !== Math.round(height * ratio)) {
    element.width = Math.round(width * ratio);
    element.height = Math.round(height * ratio);
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
}

function drawGridLines(step, color) {
  const { length, width } = getGarden();
  const { zoom, panX, panY } = view;

  gridCtx.strokeStyle = color;
  gridCtx.lineWidth = 1;
  gridCtx.beginPath();
  for (let i = 0; i * step <= length + 1e-9; i++) {
    const x = Math.round(panX + i * step * zoom) + 0.5;
    gridCtx.moveTo(x, panY);
    gridCtx.lineTo(x, panY + width * zoom);
  }
  for (let i = 0; i * step <= width + 1e-9; i++) {
    const y = Math.round(panY + i * step * zoom) + 0.5;
    gridCtx.moveTo(panX, y);
    gridCtx.lineTo(panX + length * zoom, y);
  }
  gridCtx.stroke();
}

function drawGrid(step) {
  const { length, width } = getGarden();
  const { zoom, panX, panY } = view;

  prepareCanvas(gridCanvas, gridCtx);
  gridCtx.fillStyle = palette.cream;
  gridCtx.fillRect(panX, panY, length * zoom, width * zoom);
  drawGridLines(step, 'rgba(70, 96, 63, 0.14)');
  drawGridLines(step * MAJOR_EVERY, 'rgba(70, 96, 63, 0.3)');
  gridCtx.strokeStyle = palette.moss;
  gridCtx.lineWidth = 2;
  gridCtx.strokeRect(panX, panY, length * zoom, width * zoom);
}

function drawRulers(step) {
  const { length, width } = getGarden();
  const { zoom, panX, panY } = view;
  const size = viewportSize();

  prepareCanvas(rulerCanvas, rulerCtx);
  rulerCtx.fillStyle = palette.butter;
  rulerCtx.fillRect(0, 0, size.width, RULER_SIZE);
  rulerCtx.fillRect(0, 0, RULER_SIZE, size.height);
  rulerCtx.fillStyle = 'rgba(70, 96, 63, 0.18)';
  rulerCtx.fillRect(panX, 0, length * zoom, RULER_SIZE);
  rulerCtx.fillRect(0, panY, RULER_SIZE, width * zoom);

  rulerCtx.strokeStyle = palette.gold;
  rulerCtx.lineWidth = 1;
  rulerCtx.beginPath();
  rulerCtx.moveTo(RULER_SIZE + 0.5, 0);
  rulerCtx.lineTo(RULER_SIZE + 0.5, size.height);
  rulerCtx.moveTo(0, RULER_SIZE + 0.5);
  rulerCtx.lineTo(size.width, RULER_SIZE + 0.5);
  rulerCtx.stroke();

  rulerCtx.fillStyle = palette.forest;
  rulerCtx.strokeStyle = palette.forest;
  rulerCtx.font = '10px Arial';
  rulerCtx.textBaseline = 'top';

  const drawTicks = (isHorizontal, total, offset) => {
    for (let i = 0; i * step <= total + 1e-9; i++) {
      const position = Math.round(offset + i * step * zoom) + 0.5;
      if (position < RULER_SIZE || position > (isHorizontal ? size.width : size.height)) continue;
      const isMajor = i % MAJOR_EVERY === 0;
      const tick = isMajor ? 10 : 5;

      rulerCtx.beginPath();
      rulerCtx.moveTo(isHorizontal ? position : RULER_SIZE - tick, isHorizontal ? RULER_SIZE - tick : position);
      rulerCtx.lineTo(isHorizontal ? position : RULER_SIZE, isHorizontal ? RULER_SIZE : position);
      rulerCtx.stroke();

      if (!isMajor) continue;
      const label = String(i * step);
      if (isHorizontal) {
        rulerCtx.textAlign = 'left';
        rulerCtx.fillText(label, position + 3, 2);
      } else {
        rulerCtx.save();
        rulerCtx.translate(2, position + 3);
        rulerCtx.rotate(-Math.PI / 2);
        rulerCtx.textAlign = 'right';
        rulerCtx.fillText(label, 0, 0);
        rulerCtx.restore();
      }
    }
  };

  drawTicks(true, length, panX);
  drawTicks(false, width, panY);

  rulerCtx.fillStyle = palette.butter;
  rulerCtx.fillRect(0, 0, RULER_SIZE, RULER_SIZE);
  rulerCtx.fillStyle = palette.forest;
  rulerCtx.textAlign = 'center';
  rulerCtx.textBaseline = 'middle';
  rulerCtx.fillText('m', RULER_SIZE / 2, RULER_SIZE / 2);
}

function drawScaleBar() {
  const distance = SCALE_STEPS.find((step) => step * view.zoom >= 70) || SCALE_STEPS[SCALE_STEPS.length - 1];
  scaleBarLine.style.width = `${distance * view.zoom}px`;
  scaleBarLabel.textContent = `${distance} m`;
}

function applyView() {
  const { length, width } = getGarden();
  const size = viewportSize();

  view.panX = clamp(view.panX, RULER_SIZE + MIN_VISIBLE - length * view.zoom, size.width - MIN_VISIBLE);
  view.panY = clamp(view.panY, RULER_SIZE + MIN_VISIBLE - width * view.zoom, size.height - MIN_VISIBLE);

  stage.style.width = `${length * view.zoom}px`;
  stage.style.height = `${width * view.zoom}px`;
  stage.style.transform = `translate(${view.panX}px, ${view.panY}px)`;

  const step = GRID_STEPS.find((value) => value * view.zoom >= MIN_GRID_CELL) || GRID_STEPS[GRID_STEPS.length - 1];
  drawGrid(step);
  drawRulers(step);
  drawScaleBar();
}

function fitView() {
  const { length, width } = getGarden();
  const size = viewportSize();

  view.zoom = fitZoom();
  view.panX = RULER_SIZE + (size.width - RULER_SIZE - length * view.zoom) / 2;
  view.panY = RULER_SIZE + (size.height - RULER_SIZE - width * view.zoom) / 2;
  autoFit = true;
  applyView();
}

function zoomAt(factor, x, y) {
  const limits = zoomLimits();
  const zoom = clamp(view.zoom * factor, limits.min, limits.max);
  const ratio = zoom / view.zoom;

  view.panX = x - (x - view.panX) * ratio;
  view.panY = y - (y - view.panY) * ratio;
  view.zoom = zoom;
  autoFit = false;
  applyView();
}

function zoomFromCenter(factor) {
  const size = viewportSize();
  zoomAt(factor, (size.width + RULER_SIZE) / 2, (size.height + RULER_SIZE) / 2);
}

function createPanDrag(e) {
  let lastX = e.clientX;
  let lastY = e.clientY;

  return {
    move(event) {
      view.panX += event.clientX - lastX;
      view.panY += event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      autoFit = false;
      applyView();
    },
    end() {}
  };
}

container.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    const rect = container.getBoundingClientRect();
    const delta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
    zoomAt(Math.exp(-delta * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
  },
  { passive: false }
);

document.getElementById('zoomInBtn').addEventListener('click', () => zoomFromCenter(BUTTON_ZOOM));
document.getElementById('zoomOutBtn').addEventListener('click', () => zoomFromCenter(1 / BUTTON_ZOOM));
document.getElementById('zoomFitBtn').addEventListener('click', fitView);

new ResizeObserver(() => (autoFit ? fitView() : applyView())).observe(container);

fitView();
