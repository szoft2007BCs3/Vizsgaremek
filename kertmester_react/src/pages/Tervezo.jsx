import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ProductIcon from '../components/ProductIcon.jsx';
import FootprintsLayer from '../components/planner/FootprintsLayer.jsx';
import { GridCanvas, RulerCanvas } from '../components/planner/GridCanvases.jsx';
import ItemsLayer from '../components/planner/ItemsLayer.jsx';
import LabelsLayer from '../components/planner/LabelsLayer.jsx';
import ToolMenu from '../components/planner/ToolMenu.jsx';
import Toolbox from '../components/planner/Toolbox.jsx';
import { ZoneTags, ZonesLayer } from '../components/planner/ZonesLayer.jsx';
import { PRODUCTS } from '../lib/adatok.js';
import { formatPrice, ringsArea } from '../lib/format.js';
import { ellipsePoints, rectanglePoints, ringsBounds, simplifyPoints } from '../lib/geometria.js';
import { drawShape, drawSpray, floodFill, SHAPE_TOOLS } from '../lib/ink.js';
import { isWoody } from '../lib/meretek.js';
import { findCrowdedTrees } from '../lib/spacing.js';
import {
  addPlacedItem,
  clamp,
  clearPlan,
  getCartSummary,
  getGarden,
  getLabels,
  getPlacedItems,
  getZones,
  isMature,
  loadDrawing,
  removeZone,
  saveDrawing,
  setGarden,
  setLabels,
  setMature,
  setPlacedItems,
  setZones
} from '../lib/store.js';
import { AREA_PRODUCTS } from '../lib/teruletek.js';
import { useLabelEditor } from '../lib/useLabelEditor.js';
import { usePlan } from '../lib/usePlan.js';
import { BUTTON_ZOOM, clampView, fittedView, RULER_SIZE, scaleDistance, zoomedView } from '../lib/view.js';
import {
  carveZonesWithInk,
  findEdgeAt,
  findZoneAt,
  insertZone,
  keepSquare,
  MIN_POINT_DISTANCE,
  MIN_ZONE_AREA,
  orderedZones,
  SIMPLIFY_TOLERANCE
} from '../lib/zones.js';

const HISTORY_BUDGET = 100 * 1024 * 1024;
const MAX_HISTORY = 20;
const MIN_GARDEN_SIZE = 1;
const MAX_GARDEN_SIZE = 500;
const MAX_CANVAS_SIDE = 2400;
const MAX_PIXELS_PER_METER = 60;
const SAVE_DELAY = 400;
const DRAG_THRESHOLD = 6;
const LABEL_SIZE_FACTOR = 4;
const MIN_LABEL_METERS = 0.15;
const PRODUCTS_BY_ID = Object.fromEntries(PRODUCTS.map((product) => [product.ID, product]));
const TOOL_CURSORS = { hand: 'grab', text: 'text', reshape: 'default' };

function readGardenSize(value, fallback) {
  const number = Number(value);
  if (!number) return fallback;
  return clamp(Math.round(number * 100) / 100, MIN_GARDEN_SIZE, MAX_GARDEN_SIZE);
}

export default function Tervezo() {
  usePlan();
  const garden = getGarden();
  const mature = isMature();

  const [tool, setToolState] = useState('pen');
  const [color, setColor] = useState('#24392C');
  const [lineWidth, setLineWidth] = useState(5);
  const [shapeFill, setShapeFill] = useState(false);
  const [zoneProduct, setZoneProduct] = useState(null);
  const [zoneShape, setZoneShape] = useState('freehand');
  const [zoneFill, setZoneFill] = useState(true);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setView] = useState({ zoom: 1, panX: 0, panY: 0 });
  const [hoverCursor, setHoverCursor] = useState(null);
  const [live, setLive] = useState(null);
  const [guide, setGuide] = useState(null);
  const [ghost, setGhost] = useState(null);
  const [moving, setMoving] = useState(null);
  const [reshaping, setReshaping] = useState(null);
  const [preview, setPreview] = useState(null);
  const [gardenText, setGardenText] = useState({ length: String(garden.length), width: String(garden.width) });

  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const lengthInputRef = useRef(null);
  const widthInputRef = useRef(null);
  const ctxRef = useRef(null);
  const viewRef = useRef(view);
  const sizeRef = useRef(size);
  const autoFitRef = useRef(true);
  const pixelsPerMeterRef = useRef(0);
  const historyRef = useRef([]);
  const saveTimerRef = useRef(null);
  const dragRef = useRef(null);
  const drawingRef = useRef(null);
  const latest = useRef({});

  const labelEditor = useLabelEditor({
    getNewSize: () => Math.max(MIN_LABEL_METERS, (latest.current.lineWidth * LABEL_SIZE_FACTOR) / pixelsPerMeterRef.current),
    getColor: () => latest.current.color,
    commitPlan: () => latest.current.commitPlan()
  });

  function updateView(next) {
    const clamped = clampView(next, getGarden(), sizeRef.current);
    viewRef.current = clamped;
    setView(clamped);
  }

  function fitView() {
    autoFitRef.current = true;
    updateView(fittedView(getGarden(), sizeRef.current));
  }

  function zoomAt(factor, x, y) {
    autoFitRef.current = false;
    updateView(zoomedView(viewRef.current, getGarden(), sizeRef.current, factor, x, y));
  }

  function zoomFromCenter(factor) {
    zoomAt(factor, (sizeRef.current.width + RULER_SIZE) / 2, (sizeRef.current.height + RULER_SIZE) / 2);
  }

  function pointToGarden(clientX, clientY) {
    const rect = stageRef.current.getBoundingClientRect();
    const { length, width } = getGarden();
    return {
      x: clamp(((clientX - rect.left) / rect.width) * length, 0, length),
      y: clamp(((clientY - rect.top) / rect.height) * width, 0, width)
    };
  }

  function pixelRatio() {
    const canvas = canvasRef.current;
    return canvas.width / (canvas.clientWidth || canvas.width);
  }

  function getPoint(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) * canvas.width) / rect.width, y: ((e.clientY - rect.top) * canvas.height) / rect.height };
  }

  function pushHistory(reuseImage = false) {
    const canvas = canvasRef.current;
    const history = historyRef.current;
    const limit = Math.max(3, Math.min(MAX_HISTORY, Math.floor(HISTORY_BUDGET / (canvas.width * canvas.height * 4))));
    while (history.length >= limit) history.shift();
    const last = history[history.length - 1];
    const image = reuseImage && last ? last.image : ctxRef.current.getImageData(0, 0, canvas.width, canvas.height);
    history.push({ image, zones: structuredClone(getZones()), items: structuredClone(getPlacedItems()), labels: structuredClone(getLabels()) });
  }

  function persistDrawing() {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;
    saveDrawing(canvasRef.current.toDataURL());
  }

  function scheduleSave() {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(persistDrawing, SAVE_DELAY);
  }

  function commit() {
    pushHistory();
    scheduleSave();
  }

  function commitPlan() {
    pushHistory(true);
  }

  function carve() {
    carveZonesWithInk(ctxRef.current, canvasRef.current, pixelsPerMeterRef.current);
  }

  function finishInk(currentTool) {
    if (currentTool !== 'eraser') carve();
    commit();
  }

  function resizeCanvas() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const { length, width } = getGarden();
    const ratio = Math.min(MAX_PIXELS_PER_METER, MAX_CANVAS_SIDE / Math.max(length, width));
    const newWidth = Math.max(1, Math.round(length * ratio));
    const newHeight = Math.max(1, Math.round(width * ratio));
    if (ratio === pixelsPerMeterRef.current && newWidth === canvas.width && newHeight === canvas.height) return;

    const copy = document.createElement('canvas');
    copy.width = canvas.width;
    copy.height = canvas.height;
    copy.getContext('2d').drawImage(canvas, 0, 0);

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (pixelsPerMeterRef.current) {
      const zoom = ratio / pixelsPerMeterRef.current;
      ctx.drawImage(copy, 0, 0, copy.width * zoom, copy.height * zoom);
    }

    pixelsPerMeterRef.current = ratio;
    historyRef.current = [];
    pushHistory();
  }

  function applyGarden() {
    const current = getGarden();
    const length = readGardenSize(lengthInputRef.current.value, current.length);
    const width = readGardenSize(widthInputRef.current.value, current.width);
    setGarden(length, width);
    setGardenText({ length: String(length), width: String(width) });
    resizeCanvas();
    fitView();
    persistDrawing();
  }

  function restoreDrawing() {
    const data = loadDrawing();
    if (!data) return;
    const image = new Image();
    image.onload = () => {
      ctxRef.current.drawImage(image, 0, 0, canvasRef.current.width, canvasRef.current.height);
      historyRef.current = [];
      pushHistory();
    };
    image.src = data;
  }

  function setTool(next) {
    setToolState(next);
    setHoverCursor(null);
  }

  function activateZoneTool(product) {
    setZoneProduct(product);
    setTool('zone');
  }

  function undo() {
    const history = historyRef.current;
    if (history.length < 2) return;
    history.pop();
    const previous = history[history.length - 1];
    ctxRef.current.putImageData(previous.image, 0, 0);
    setZones(structuredClone(previous.zones));
    setPlacedItems(structuredClone(previous.items));
    setLabels(structuredClone(previous.labels));
    scheduleSave();
  }

  function clearAll() {
    if (!confirm('Biztosan törlöd az egész tervet? A rajz, az összes növény, terület és a kosár tartalma is törlődik.')) return;
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    clearPlan();
    commit();
  }

  function startDrag(e, handler) {
    canvasRef.current.setPointerCapture(e.pointerId);
    dragRef.current = handler;
  }

  function createPanDrag(e) {
    let lastX = e.clientX;
    let lastY = e.clientY;
    return {
      move(event) {
        autoFitRef.current = false;
        updateView({ ...viewRef.current, panX: viewRef.current.panX + event.clientX - lastX, panY: viewRef.current.panY + event.clientY - lastY });
        lastX = event.clientX;
        lastY = event.clientY;
      },
      end() {}
    };
  }

  function createZoneDrag(e) {
    const look = AREA_PRODUCTS[zoneProduct.ID];
    const shape = zoneShape;
    const filled = zoneFill;
    const start = pointToGarden(e.clientX, e.clientY);
    let points = [start];

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
          if (Math.hypot(point.x - previous.x, point.y - previous.y) * viewRef.current.zoom >= MIN_POINT_DISTANCE) points = [...points, point];
        }
        setPreview({ points, look });
      },
      end() {
        setPreview(null);
        const ring = shape === 'freehand' ? simplifyPoints(points, SIMPLIFY_TOLERANCE / viewRef.current.zoom) : points;
        if (ring.length < 3 || ringsArea([ring]) < MIN_ZONE_AREA) return;
        insertZone(zoneProduct.ID, [ring], filled);
        carve();
        commitPlan();
      }
    };
  }

  function createZoneMoveDrag(e, zone) {
    const { length, width } = getGarden();
    const bounds = ringsBounds(zone.rings);
    const start = pointToGarden(e.clientX, e.clientY);
    let dx = 0;
    let dy = 0;

    return {
      move(event) {
        const point = pointToGarden(event.clientX, event.clientY);
        dx = clamp(point.x - start.x, -bounds.minX, length - bounds.maxX);
        dy = clamp(point.y - start.y, -bounds.minY, width - bounds.maxY);
        setMoving({ id: zone.id, dx, dy });
      },
      end() {
        setMoving(null);
        if (Math.hypot(dx, dy) < 0.01) return;
        const moved = zone.rings.map((ring) => ring.map((point) => ({ x: point.x + dx, y: point.y + dy })));
        removeZone(zone.id);
        insertZone(zone.productId, moved, zone.filled);
        carve();
        commitPlan();
      }
    };
  }

  function createReshapeDrag(hit) {
    const zone = hit.zone;
    const rings = structuredClone(zone.rings);
    const ring = rings[hit.ringIndex];
    const index = hit.vertexIndex ?? hit.segmentIndex + 1;
    if (hit.vertexIndex === undefined) ring.splice(index, 0, hit.point);
    let moved = false;

    return {
      move(event) {
        ring[index] = pointToGarden(event.clientX, event.clientY);
        moved = true;
        setReshaping({ id: zone.id, rings: rings.map((other) => [...other]) });
      },
      end() {
        setReshaping(null);
        if (!moved || ringsArea(rings) < MIN_ZONE_AREA) return;
        removeZone(zone.id);
        insertZone(zone.productId, rings, zone.filled);
        carve();
        commitPlan();
      }
    };
  }

  function applyBrush() {
    const ctx = ctxRef.current;
    ctx.lineWidth = lineWidth * pixelRatio();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
  }

  function drawStroke(x, y) {
    const ctx = ctxRef.current;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function sprayOnce() {
    const drawing = drawingRef.current;
    const ratio = pixelRatio();
    drawSpray(ctxRef.current, drawing.last.x, drawing.last.y, lineWidth * 2 * ratio, ratio);
  }

  function startDrawing(e) {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (e.button === 0 && tool === 'hand') {
      const zone = findZoneAt(pointToGarden(e.clientX, e.clientY));
      if (zone) {
        e.preventDefault();
        setHoverCursor('grabbing');
        startDrag(e, createZoneMoveDrag(e, zone));
        return;
      }
    }
    if (e.button === 1 || (e.button === 0 && tool === 'hand')) {
      e.preventDefault();
      startDrag(e, createPanDrag(e));
      return;
    }
    if (e.button > 0) return;

    if (tool === 'reshape') {
      const hit = findEdgeAt(pointToGarden(e.clientX, e.clientY), viewRef.current.zoom);
      if (hit) {
        e.preventDefault();
        startDrag(e, createReshapeDrag(hit));
      }
      return;
    }
    if (tool === 'zone') {
      startDrag(e, createZoneDrag(e));
      return;
    }
    if (tool === 'text') {
      e.preventDefault();
      labelEditor.open(pointToGarden(e.clientX, e.clientY), null);
      return;
    }

    const { x, y } = getPoint(e);
    applyBrush();

    if (tool === 'bucket') {
      floodFill(ctx, canvas, Math.floor(x), Math.floor(y), color);
      finishInk(tool);
      return;
    }

    const drawing = { start: { x, y }, last: { x, y }, snapshot: null, sprayTimer: null, tool };
    drawingRef.current = drawing;
    canvas.setPointerCapture(e.pointerId);
    if (SHAPE_TOOLS.includes(tool)) drawing.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === 'pen' || tool === 'eraser') {
      drawStroke(x, y);
    } else if (tool === 'spray') {
      sprayOnce();
      drawing.sprayTimer = setInterval(sprayOnce, 20);
    }
  }

  function draw(e) {
    if (dragRef.current) {
      dragRef.current.move(e);
      return;
    }
    const drawing = drawingRef.current;
    if (!drawing) {
      if (tool === 'reshape') setHoverCursor(findEdgeAt(pointToGarden(e.clientX, e.clientY), viewRef.current.zoom) ? 'grab' : 'default');
      if (tool === 'hand') setHoverCursor(findZoneAt(pointToGarden(e.clientX, e.clientY)) ? 'move' : 'grab');
      return;
    }
    const { x, y } = getPoint(e);
    drawing.last = { x, y };

    if (tool === 'pen' || tool === 'eraser') {
      drawStroke(x, y);
    } else if (SHAPE_TOOLS.includes(tool)) {
      ctxRef.current.putImageData(drawing.snapshot, 0, 0);
      drawShape(ctxRef.current, tool, drawing.start, { x, y }, e.shiftKey, shapeFill);
    }
  }

  function stopDrawing(e) {
    if (dragRef.current) {
      dragRef.current.end(e);
      dragRef.current = null;
      if (tool === 'hand') setHoverCursor('grab');
      return;
    }
    const drawing = drawingRef.current;
    if (!drawing) return;
    drawingRef.current = null;
    clearInterval(drawing.sprayTimer);
    ctxRef.current.beginPath();
    finishInk(tool);
  }

  function placeProduct(product, x, y) {
    addPlacedItem(product.ID, x, y);
    commitPlan();
  }

  function isOverStage(clientX, clientY) {
    const rect = stageRef.current.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }

  function startProductDrag(e, product) {
    if (e.pointerType === 'mouse') {
      if (e.button !== 0) return;
      e.preventDefault();
    }

    const startX = e.clientX;
    const startY = e.clientY;
    let dragging = false;

    function move(event) {
      if (!dragging && Math.hypot(event.clientX - startX, event.clientY - startY) > DRAG_THRESHOLD) dragging = true;
      if (!dragging) return;
      const over = isOverStage(event.clientX, event.clientY);
      const point = over ? pointToGarden(event.clientX, event.clientY) : null;
      setGuide(point ? { productId: product.ID, x: point.x, y: point.y, ignoredId: null } : null);
      const blocked = Boolean(point && isWoody(product.ID) && findCrowdedTrees(product.ID, point.x, point.y, null).length);
      setGhost({ product, x: event.clientX, y: event.clientY, blocked });
    }

    function finish() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', drop);
      window.removeEventListener('pointercancel', finish);
      setGhost(null);
      setGuide(null);
    }

    function drop(event) {
      const wasDragging = dragging;
      finish();
      if (wasDragging) {
        if (isOverStage(event.clientX, event.clientY)) {
          const point = pointToGarden(event.clientX, event.clientY);
          placeProduct(product, point.x, point.y);
        }
      } else if (event.pointerType !== 'mouse') {
        const { length, width } = getGarden();
        const spread = Math.min(length, width) * 0.3;
        placeProduct(product, length / 2 + (Math.random() - 0.5) * spread, width / 2 + (Math.random() - 0.5) * spread);
      }
    }

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', drop);
    window.addEventListener('pointercancel', finish);
  }

  function removeZoneAndCommit(id) {
    removeZone(id);
    commitPlan();
  }

  latest.current = { lineWidth, color, commitPlan, undo, tool, setTool, applyGarden, zoomAt };

  useLayoutEffect(() => {
    const container = containerRef.current;
    const observer = new ResizeObserver(() => {
      const next = { width: container.clientWidth, height: container.clientHeight };
      sizeRef.current = next;
      setSize(next);
      if (autoFitRef.current) fitView();
      else updateView(viewRef.current);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    ctxRef.current = canvasRef.current.getContext('2d', { willReadFrequently: true });
    resizeCanvas();
    restoreDrawing();
    const onPageHide = () => {
      if (saveTimerRef.current) persistDrawing();
    };
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      if (saveTimerRef.current) persistDrawing();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const delta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
      latest.current.zoomAt(Math.exp(-delta * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        latest.current.undo();
      }
      if (e.key === 'Escape' && latest.current.tool === 'zone') latest.current.setTool('pen');
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const inputs = [lengthInputRef.current, widthInputRef.current];
    const onChange = () => latest.current.applyGarden();
    inputs.forEach((input) => input.addEventListener('change', onChange));
    return () => inputs.forEach((input) => input.removeEventListener('change', onChange));
  }, []);

  useEffect(() => {
    labelEditor.close(true);
  }, [tool]);

  useEffect(() => {
    document.body.classList.toggle('is-dragging', Boolean(ghost));
    return () => document.body.classList.remove('is-dragging');
  }, [Boolean(ghost)]);

  const zones = orderedZones();
  const summary = getCartSummary(PRODUCTS_BY_ID);
  const zoneLook = zoneProduct ? AREA_PRODUCTS[zoneProduct.ID] : null;
  const distance = scaleDistance(view.zoom);

  return (
    <main className="planner">
      <aside className="panel planner-toolbar">
        <h2 className="panel-title">Eszköztár</h2>
        <Toolbox activeProductId={tool === 'zone' && zoneProduct ? zoneProduct.ID : null} onArea={activateZoneTool} onDragStart={startProductDrag} />
      </aside>

      <ToolMenu
        ui={{ tool, color, lineWidth, shapeFill, mature, zone: { look: zoneLook, shape: zoneShape, fill: zoneFill } }}
        actions={{
          setTool,
          setColor,
          setLineWidth,
          toggleShapeFill: () => setShapeFill(!shapeFill),
          setZoneShape,
          toggleZoneFill: () => setZoneFill(!zoneFill),
          toggleMature: () => setMature(!mature),
          undo,
          clear: clearAll
        }}
      />

      <section className="panel planner-canvas">
        <div className="panel-head">
          <h2 className="panel-title">Tervező</h2>
          <div className="garden-size">
            <label className="garden-field">Hosszúság
              <input type="number" ref={lengthInputRef} min="1" max="500" step="0.5" value={gardenText.length} onChange={(e) => setGardenText({ ...gardenText, length: e.target.value })} />
              m
            </label>
            <label className="garden-field">Szélesség
              <input type="number" ref={widthInputRef} min="1" max="500" step="0.5" value={gardenText.width} onChange={(e) => setGardenText({ ...gardenText, width: e.target.value })} />
              m
            </label>
          </div>
          <a className="cart-link" href="#/webshop">Kosár: <span>{summary.count}</span> db · <span>{formatPrice(summary.total)}</span></a>
        </div>

        <div className="canvas-container" ref={containerRef}>
          <GridCanvas garden={garden} view={view} size={size} />
          <div
            className="canvas-stage"
            ref={stageRef}
            data-tool={tool}
            style={{ width: `${garden.length * view.zoom}px`, height: `${garden.width * view.zoom}px`, transform: `translate(${view.panX}px, ${view.panY}px)` }}
          >
            <ZonesLayer zones={zones} garden={garden} moving={moving} reshaping={reshaping} preview={preview} />
            <canvas
              id="drawboard"
              ref={canvasRef}
              style={{ cursor: hoverCursor || TOOL_CURSORS[tool] || 'crosshair' }}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
            ></canvas>
            <FootprintsLayer garden={garden} items={getPlacedItems()} mature={mature} live={live} guide={guide} />
            <ZoneTags zones={zones} garden={garden} moving={moving} onRemove={removeZoneAndCommit} />
            <ItemsLayer items={getPlacedItems()} garden={garden} live={live} setLive={setLive} setGuide={setGuide} pointToGarden={pointToGarden} commitPlan={commitPlan} />
            <LabelsLayer
              garden={garden}
              tool={tool}
              editor={labelEditor.editor}
              setEditorText={labelEditor.setText}
              openEditor={labelEditor.open}
              closeEditor={labelEditor.close}
              pointToGarden={pointToGarden}
              commitPlan={commitPlan}
            />
          </div>
          <RulerCanvas garden={garden} view={view} size={size} />
          <div className="scale-bar">
            <span>{distance} m</span>
            <span className="scale-bar-line" style={{ width: `${distance * view.zoom}px` }}></span>
          </div>
          <div className="zoom-controls">
            <button type="button" className="zoom-btn" aria-label="Nagyítás" title="Nagyítás" onClick={() => zoomFromCenter(BUTTON_ZOOM)}>+</button>
            <button type="button" className="zoom-btn" aria-label="Kicsinyítés" title="Kicsinyítés" onClick={() => zoomFromCenter(1 / BUTTON_ZOOM)}>−</button>
            <button type="button" className="zoom-btn" aria-label="Teljes kert" title="Teljes kert" onClick={fitView}>⤢</button>
          </div>
        </div>
      </section>

      {ghost && <ProductIcon product={ghost.product} className={`drag-ghost${ghost.blocked ? ' is-blocked' : ''}`} style={{ left: `${ghost.x}px`, top: `${ghost.y}px` }} />}
    </main>
  );
}
