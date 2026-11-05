const canvas = document.getElementById('drawboard');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const colorPicker = document.getElementById('colorPicker');
const lineWidthInput = document.getElementById('lineWidth');
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const toolButtons = document.querySelectorAll('.btn-tool');

let isDrawing = false;
let currentTool = 'pen';

let startX = 0;
let startY = 0;
let snapshot = null;

let historyStack = [];
const maxHistoryLength = 25;

let isShiftPressed = false;

window.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') isShiftPressed = true;
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') isShiftPressed = false;
});

function saveState() {
    if (historyStack.length >= maxHistoryLength) {
        historyStack.shift();
    }
    historyStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

toolButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelector('.btn-tool.active').classList.remove('active');
        e.target.classList.add('active');
        currentTool = e.target.getAttribute('data-tool');
    });
});

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    saveState();
}

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches.clientX : e.clientX;
    const clientY = e.touches ? e.touches.clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function startDrawing(e) {
    isDrawing = true;
    const coords = getCoordinates(e);
    startX = coords.x;
    startY = coords.y;

    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    if (currentTool === 'pen') {
        drawPen(coords.x, coords.y);
    } else if (currentTool === 'bucket') {
        floodFill(Math.floor(coords.x), Math.floor(coords.y), colorPicker.value);
        saveState();
        isDrawing = false;
    } else if (currentTool === 'spray') {
        drawSpray(coords.x, coords.y);
    }
}

function draw(e) {
    if (!isDrawing) return;
    const coords = getCoordinates(e);

    ctx.lineWidth = lineWidthInput.value;
    ctx.strokeStyle = colorPicker.value;
    ctx.fillStyle = colorPicker.value;

    if (['line', 'ellipse', 'rectangle'].includes(currentTool)) {
        ctx.putImageData(snapshot, 0, 0);
    }

    if (currentTool === 'pen') {
        drawPen(coords.x, coords.y);
    } else if (currentTool === 'spray') {
        drawSpray(coords.x, coords.y);
    } else if (currentTool === 'line') {
        drawLine(coords.x, coords.y);
    } else if (currentTool === 'ellipse') {
        drawEllipse(coords.x, coords.y);
    } else if (currentTool === 'rectangle') {
        drawRectangle(coords.x, coords.y);
    }
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        ctx.beginPath();
        if (currentTool !== 'bucket') {
            saveState();
        }
    }
}


function drawPen(x, y) {
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function drawSpray(x, y) {
    const density = 30;
    const radius = lineWidthInput.value * 2;
    for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        ctx.fillRect(x + Math.cos(angle) * r, y + Math.sin(angle) * r, 1, 1);
    }
}

function drawLine(endX, endY) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

function drawEllipse(endX, endY) {
    ctx.beginPath();

    let radiusX = Math.abs(endX - startX);
    let radiusY = Math.abs(endY - startY);
    let centerX = startX + (endX - startX) / 2;
    let centerY = startY + (endY - startY) / 2;
    if (isShiftPressed) {
        const maxRadius = Math.max(radiusX, radiusY);
        radiusX = maxRadius;
        radiusY = maxRadius;
        centerX = startX + Math.sign(endX - startX) * maxRadius;
        centerY = startY + Math.sign(endY - startY) * maxRadius;
        ctx.arc(startX, startY, maxRadius, 0, 2 * Math.PI);
    } else {
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    }
    ctx.stroke();
}
function drawRectangle(endX, endY) {
    ctx.beginPath();
    const width = endX - startX;
    const height = endY - startY;
    ctx.strokeRect(startX, startY, width, height);
}
function floodFill(startX, startY, fillColorHex) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const fillR = parseInt(fillColorHex.slice(1, 3), 16);
    const fillG = parseInt(fillColorHex.slice(3, 5), 16);
    const fillB = parseInt(fillColorHex.slice(5, 7), 16);
    const targetIndex = (startY * canvas.width + startX) * 4;
    const targetR = data[targetIndex];
    const targetG = data[targetIndex + 1];
    const targetB = data[targetIndex + 2];
    const targetA = data[targetIndex + 3];
    if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === 255) return;
    const queue = [[startX, startY]];
    while (queue.length > 0) {
        const [x, y] = queue.shift();
        const idx = (y * canvas.width + x) * 4;
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            if (data[idx] === targetR && data[idx + 1] === targetG && data[idx + 2] === targetB && data[idx + 3] === targetA) {
                data[idx] = fillR;
                data[idx + 1] = fillG;
                data[idx + 2] = fillB;
                data[idx + 3] = 255;
                queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
undoBtn.addEventListener('click', () => {
    if (historyStack.length > 1) {
        historyStack.pop();
        const previousState = historyStack[historyStack.length - 1];
        ctx.putImageData(previousState, 0, 0);
    } else if (historyStack.length === 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
});
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
window.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('touchstart', startDrawing, { passive: true });
canvas.addEventListener('touchmove', draw, { passive: true });
window.addEventListener('touchend', stopDrawing);
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
