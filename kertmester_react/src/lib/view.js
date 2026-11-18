import { clamp } from './store.js';

export const RULER_SIZE = 24;
const FIT_MARGIN = 28;
const MAX_ZOOM = 200;
const MAX_STAGE_SIZE = 16000;
const MIN_VISIBLE = 80;
const MIN_GRID_CELL = 20;
const MAJOR_EVERY = 5;
const GRID_STEPS = [1, 2, 5, 10, 20, 50];
const SCALE_STEPS = [1, 2, 5, 10, 20, 50, 100];
export const BUTTON_ZOOM = 1.25;

export function fitZoom(garden, size) {
  const availableWidth = size.width - RULER_SIZE - FIT_MARGIN * 2;
  const availableHeight = size.height - RULER_SIZE - FIT_MARGIN * 2;
  return Math.max(0.5, Math.min(availableWidth / garden.length, availableHeight / garden.width));
}

export function zoomLimits(garden, size) {
  const fit = fitZoom(garden, size);
  return { min: fit * 0.5, max: Math.max(fit, Math.min(MAX_ZOOM, MAX_STAGE_SIZE / Math.max(garden.length, garden.width))) };
}

export function clampView(view, garden, size) {
  return {
    zoom: view.zoom,
    panX: clamp(view.panX, RULER_SIZE + MIN_VISIBLE - garden.length * view.zoom, size.width - MIN_VISIBLE),
    panY: clamp(view.panY, RULER_SIZE + MIN_VISIBLE - garden.width * view.zoom, size.height - MIN_VISIBLE)
  };
}

export function fittedView(garden, size) {
  const zoom = fitZoom(garden, size);
  return clampView(
    {
      zoom,
      panX: RULER_SIZE + (size.width - RULER_SIZE - garden.length * zoom) / 2,
      panY: RULER_SIZE + (size.height - RULER_SIZE - garden.width * zoom) / 2
    },
    garden,
    size
  );
}

export function zoomedView(view, garden, size, factor, x, y) {
  const limits = zoomLimits(garden, size);
  const zoom = clamp(view.zoom * factor, limits.min, limits.max);
  const ratio = zoom / view.zoom;
  return clampView({ zoom, panX: x - (x - view.panX) * ratio, panY: y - (y - view.panY) * ratio }, garden, size);
}

export function gridStep(zoom) {
  return GRID_STEPS.find((value) => value * zoom >= MIN_GRID_CELL) || GRID_STEPS[GRID_STEPS.length - 1];
}

export function scaleDistance(zoom) {
  return SCALE_STEPS.find((step) => step * zoom >= 70) || SCALE_STEPS[SCALE_STEPS.length - 1];
}

export function readPalette() {
  const css = getComputedStyle(document.documentElement);
  return Object.fromEntries(['cream', 'butter', 'moss', 'sage-line', 'forest', 'gold'].map((name) => [name, css.getPropertyValue(`--${name}`).trim()]));
}

export function prepareCanvas(canvas, context, size) {
  const ratio = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(size.width * ratio) || canvas.height !== Math.round(size.height * ratio)) {
    canvas.width = Math.round(size.width * ratio);
    canvas.height = Math.round(size.height * ratio);
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, size.width, size.height);
}

function drawGridLines(context, garden, view, step, color) {
  const { length, width } = garden;
  const { zoom, panX, panY } = view;

  context.strokeStyle = color;
  context.lineWidth = 1;
  context.beginPath();
  for (let i = 0; i * step <= length + 1e-9; i++) {
    const x = Math.round(panX + i * step * zoom) + 0.5;
    context.moveTo(x, panY);
    context.lineTo(x, panY + width * zoom);
  }
  for (let i = 0; i * step <= width + 1e-9; i++) {
    const y = Math.round(panY + i * step * zoom) + 0.5;
    context.moveTo(panX, y);
    context.lineTo(panX + length * zoom, y);
  }
  context.stroke();
}

export function drawGrid(canvas, garden, view, size, palette) {
  const context = canvas.getContext('2d');
  const step = gridStep(view.zoom);
  const { zoom, panX, panY } = view;

  prepareCanvas(canvas, context, size);
  context.fillStyle = palette.cream;
  context.fillRect(panX, panY, garden.length * zoom, garden.width * zoom);
  drawGridLines(context, garden, view, step, 'rgba(70, 96, 63, 0.14)');
  drawGridLines(context, garden, view, step * MAJOR_EVERY, 'rgba(70, 96, 63, 0.3)');
  context.strokeStyle = palette.moss;
  context.lineWidth = 2;
  context.strokeRect(panX, panY, garden.length * zoom, garden.width * zoom);
}

export function drawRulers(canvas, garden, view, size, palette) {
  const context = canvas.getContext('2d');
  const { length, width } = garden;
  const { zoom, panX, panY } = view;
  const step = gridStep(zoom);

  prepareCanvas(canvas, context, size);
  context.fillStyle = palette.butter;
  context.fillRect(0, 0, size.width, RULER_SIZE);
  context.fillRect(0, 0, RULER_SIZE, size.height);
  context.fillStyle = 'rgba(70, 96, 63, 0.18)';
  context.fillRect(panX, 0, length * zoom, RULER_SIZE);
  context.fillRect(0, panY, RULER_SIZE, width * zoom);

  context.strokeStyle = palette.gold;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(RULER_SIZE + 0.5, 0);
  context.lineTo(RULER_SIZE + 0.5, size.height);
  context.moveTo(0, RULER_SIZE + 0.5);
  context.lineTo(size.width, RULER_SIZE + 0.5);
  context.stroke();

  context.fillStyle = palette.forest;
  context.strokeStyle = palette.forest;
  context.font = '10px Arial';
  context.textBaseline = 'top';

  const drawTicks = (isHorizontal, total, offset) => {
    for (let i = 0; i * step <= total + 1e-9; i++) {
      const position = Math.round(offset + i * step * zoom) + 0.5;
      if (position < RULER_SIZE || position > (isHorizontal ? size.width : size.height)) continue;
      const isMajor = i % MAJOR_EVERY === 0;
      const tick = isMajor ? 10 : 5;

      context.beginPath();
      context.moveTo(isHorizontal ? position : RULER_SIZE - tick, isHorizontal ? RULER_SIZE - tick : position);
      context.lineTo(isHorizontal ? position : RULER_SIZE, isHorizontal ? RULER_SIZE : position);
      context.stroke();

      if (!isMajor) continue;
      const label = String(i * step);
      if (isHorizontal) {
        context.textAlign = 'left';
        context.fillText(label, position + 3, 2);
      } else {
        context.save();
        context.translate(2, position + 3);
        context.rotate(-Math.PI / 2);
        context.textAlign = 'right';
        context.fillText(label, 0, 0);
        context.restore();
      }
    }
  };

  drawTicks(true, length, panX);
  drawTicks(false, width, panY);

  context.fillStyle = palette.butter;
  context.fillRect(0, 0, RULER_SIZE, RULER_SIZE);
  context.fillStyle = palette.forest;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('m', RULER_SIZE / 2, RULER_SIZE / 2);
}
