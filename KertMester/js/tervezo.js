const canvas = document.getElementById('drawboard');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const container = document.getElementById('canvasContainer');
const stage = document.getElementById('stage');
const gridNote = document.getElementById('gridNote');
const gardenLengthInput = document.getElementById('gardenLength');
const gardenWidthInput = document.getElementById('gardenWidth');
const colorPicker = document.getElementById('colorPicker');
const lineWidthInput = document.getElementById('lineWidth');
const lineWidthValue = document.getElementById('lineWidthValue');
const fillToggle = document.getElementById('fillToggle');
const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');
const toolButtons = document.querySelectorAll('[data-tool]');

const MAX_HISTORY = 15;
const FILL_TOLERANCE = 48;
const SPRAY_DENSITY = 30;
const SHAPE_TOOLS = ['line', 'ellipse', 'rectangle'];
const MIN_GARDEN_SIZE = 1;
const MAX_GARDEN_SIZE = 100;
const MAX_CANVAS_SIDE = 1400;
const MAX_PIXELS_PER_METER = 60;
const GRID_STEPS = [1, 2, 5, 10, 20, 50];
const MIN_GRID_CELL = 18;
const SAVE_DELAY = 400;

let currentTool = 'pen';
let isDrawing = false;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;
let snapshot = null;
let sprayTimer = null;
let history = [];
let pixelsPerMeter = 0;
let saveTimer = null;

function pixelRatio() {
  return canvas.width / (canvas.clientWidth || canvas.width);
}

function pushHistory() {
  if (history.length >= MAX_HISTORY) history.shift();
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

function persistDrawing() {
  clearTimeout(saveTimer);
  saveTimer = null;
  saveDrawing(canvas.toDataURL());
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persistDrawing, SAVE_DELAY);
}

function commit() {
  pushHistory();
  scheduleSave();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas() {
  const { length, width } = getGarden();
  const ratio = Math.min(MAX_PIXELS_PER_METER, MAX_CANVAS_SIDE / Math.max(length, width));
  const newWidth = Math.max(1, Math.round(length * ratio));
  const newHeight = Math.max(1, Math.round(width * ratio));
  if (ratio === pixelsPerMeter && newWidth === canvas.width && newHeight === canvas.height) return;

  const copy = document.createElement('canvas');
  copy.width = canvas.width;
  copy.height = canvas.height;
  copy.getContext('2d').drawImage(canvas, 0, 0);

  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (pixelsPerMeter) {
    const zoom = ratio / pixelsPerMeter;
    ctx.drawImage(copy, 0, 0, copy.width * zoom, copy.height * zoom);
  }

  pixelsPerMeter = ratio;
  history = [];
  pushHistory();
}

function fitStage() {
  const { length, width } = getGarden();
  const style = getComputedStyle(container);
  const availableWidth = container.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const availableHeight = container.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  const meter = Math.max(0, Math.min(availableWidth / length, availableHeight / width));
  const step = GRID_STEPS.find((value) => value * meter >= MIN_GRID_CELL) || GRID_STEPS[GRID_STEPS.length - 1];

  stage.style.width = `${length * meter}px`;
  stage.style.height = `${width * meter}px`;
  stage.style.backgroundSize = `${step * meter}px ${step * meter}px`;
  gridNote.textContent = `Egy négyzet = ${step} m`;
}

function showGardenSize() {
  const { length, width } = getGarden();
  gardenLengthInput.value = length;
  gardenWidthInput.value = width;
}

function readGardenSize(input, fallback) {
  const value = Number(input.value);
  if (!value) return fallback;
  return clamp(Math.round(value * 100) / 100, MIN_GARDEN_SIZE, MAX_GARDEN_SIZE);
}

function applyGarden() {
  const current = getGarden();
  setGarden(readGardenSize(gardenLengthInput, current.length), readGardenSize(gardenWidthInput, current.width));
  showGardenSize();
  resizeCanvas();
  fitStage();
  persistDrawing();
  window.dispatchEvent(new Event('garden-changed'));
}

function restoreDrawing() {
  const data = loadDrawing();
  if (!data) return;
  const image = new Image();
  image.onload = () => {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    history = [];
    pushHistory();
  };
  image.src = data;
}

function getPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) * canvas.width) / rect.width,
    y: ((e.clientY - rect.top) * canvas.height) / rect.height
  };
}

function applyBrush() {
  ctx.lineWidth = lineWidthInput.value * pixelRatio();
  ctx.strokeStyle = colorPicker.value;
  ctx.fillStyle = colorPicker.value;
  ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
}

function drawStroke(x, y) {
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function drawSpray() {
  const ratio = pixelRatio();
  const radius = lineWidthInput.value * 2 * ratio;
  for (let i = 0; i < SPRAY_DENSITY; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    ctx.fillRect(lastX + Math.cos(angle) * distance, lastY + Math.sin(angle) * distance, ratio, ratio);
  }
}

function drawShape(x, y, keepRatio) {
  let width = x - startX;
  let height = y - startY;

  if (keepRatio && currentTool !== 'line') {
    const size = Math.max(Math.abs(width), Math.abs(height));
    width = Math.sign(width) * size;
    height = Math.sign(height) * size;
  }

  ctx.beginPath();
  if (currentTool === 'line') {
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + width, startY + height);
  } else if (currentTool === 'ellipse') {
    ctx.ellipse(startX + width / 2, startY + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2);
  } else {
    ctx.rect(startX, startY, width, height);
  }

  if (currentTool !== 'line' && fillToggle.getAttribute('aria-pressed') === 'true') ctx.fill();
  ctx.stroke();
}

function hexToRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function floodFill(x, y, hex) {
  const width = canvas.width;
  const height = canvas.height;
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  const [fillR, fillG, fillB] = hexToRgb(hex);

  const first = (y * width + x) * 4;
  const target = [data[first], data[first + 1], data[first + 2], data[first + 3]];
  if (target[0] === fillR && target[1] === fillG && target[2] === fillB && target[3] === 255) return;

  const isSimilar = (i) => target.every((value, c) => Math.abs(data[i + c] - value) <= FILL_TOLERANCE);

  const paint = (i) => {
    data[i] = fillR;
    data[i + 1] = fillG;
    data[i + 2] = fillB;
    data[i + 3] = 255;
  };

  const blendEdge = (i) => {
    const opacity = data[i + 3] / 255;
    data[i] = data[i] * opacity + fillR * (1 - opacity);
    data[i + 1] = data[i + 1] * opacity + fillG * (1 - opacity);
    data[i + 2] = data[i + 2] * opacity + fillB * (1 - opacity);
    data[i + 3] = 255;
  };

  const visited = new Uint8Array(width * height);
  const stack = [y * width + x];
  visited[stack[0]] = 1;

  while (stack.length) {
    const pixel = stack.pop();
    paint(pixel * 4);

    const column = pixel % width;
    const neighbors = [];
    if (column > 0) neighbors.push(pixel - 1);
    if (column < width - 1) neighbors.push(pixel + 1);
    if (pixel >= width) neighbors.push(pixel - width);
    if (pixel < width * (height - 1)) neighbors.push(pixel + width);

    for (const next of neighbors) {
      if (visited[next]) continue;
      visited[next] = 1;
      if (isSimilar(next * 4)) stack.push(next);
      else if (data[next * 4 + 3] < 255) blendEdge(next * 4);
    }
  }

  ctx.putImageData(image, 0, 0);
}

function startDrawing(e) {
  if (e.button > 0) return;
  const { x, y } = getPoint(e);
  startX = lastX = x;
  startY = lastY = y;

  applyBrush();

  if (currentTool === 'bucket') {
    floodFill(Math.floor(x), Math.floor(y), colorPicker.value);
    commit();
    return;
  }

  isDrawing = true;
  canvas.setPointerCapture(e.pointerId);
  if (SHAPE_TOOLS.includes(currentTool)) snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(x, y);

  if (currentTool === 'pen' || currentTool === 'eraser') {
    drawStroke(x, y);
  } else if (currentTool === 'spray') {
    drawSpray();
    sprayTimer = setInterval(drawSpray, 20);
  }
}

function draw(e) {
  if (!isDrawing) return;
  const { x, y } = getPoint(e);
  lastX = x;
  lastY = y;

  if (currentTool === 'pen' || currentTool === 'eraser') {
    drawStroke(x, y);
  } else if (SHAPE_TOOLS.includes(currentTool)) {
    ctx.putImageData(snapshot, 0, 0);
    drawShape(x, y, e.shiftKey);
  }
}

function stopDrawing() {
  if (!isDrawing) return;
  isDrawing = false;
  clearInterval(sprayTimer);
  ctx.beginPath();
  commit();
}

function undo() {
  if (history.length < 2) return;
  history.pop();
  ctx.putImageData(history[history.length - 1], 0, 0);
  scheduleSave();
}

toolButtons.forEach((button) => {
  button.addEventListener('click', () => {
    toolButtons.forEach((other) => other.classList.toggle('active', other === button));
    currentTool = button.dataset.tool;
  });
});

fillToggle.addEventListener('click', () => {
  const isOn = fillToggle.getAttribute('aria-pressed') === 'true';
  fillToggle.setAttribute('aria-pressed', String(!isOn));
  fillToggle.classList.toggle('active', !isOn);
});

lineWidthInput.addEventListener('input', () => {
  lineWidthValue.textContent = lineWidthInput.value;
});

undoBtn.addEventListener('click', undo);

clearBtn.addEventListener('click', () => {
  clearCanvas();
  commit();
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    undo();
  }
});

canvas.addEventListener('pointerdown', startDrawing);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointercancel', stopDrawing);

gardenLengthInput.addEventListener('change', applyGarden);
gardenWidthInput.addEventListener('change', applyGarden);

window.addEventListener('pagehide', () => {
  if (saveTimer) persistDrawing();
});

new ResizeObserver(fitStage).observe(container);

showGardenSize();
resizeCanvas();
fitStage();
restoreDrawing();
