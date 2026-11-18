export const FILL_TOLERANCE = 48;
export const SPRAY_DENSITY = 30;
export const SHAPE_TOOLS = ['line', 'ellipse', 'rectangle'];

export function hexToRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

export function drawSpray(ctx, x, y, radius, pixel) {
  for (let i = 0; i < SPRAY_DENSITY; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    ctx.fillRect(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance, pixel, pixel);
  }
}

export function drawShape(ctx, tool, start, point, keepRatio, filled) {
  let width = point.x - start.x;
  let height = point.y - start.y;

  if (keepRatio && tool !== 'line') {
    const size = Math.max(Math.abs(width), Math.abs(height));
    width = Math.sign(width) * size;
    height = Math.sign(height) * size;
  }

  ctx.beginPath();
  if (tool === 'line') {
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(start.x + width, start.y + height);
  } else if (tool === 'ellipse') {
    ctx.ellipse(start.x + width / 2, start.y + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2);
  } else {
    ctx.rect(start.x, start.y, width, height);
  }

  if (tool !== 'line' && filled) ctx.fill();
  ctx.stroke();
}

export function floodFill(ctx, canvas, x, y, hex) {
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
