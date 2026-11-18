import { useEffect, useRef } from 'react';
import { drawGrid, drawRulers, readPalette } from '../../lib/view.js';

export function GridCanvas({ garden, view, size }) {
  const ref = useRef(null);

  useEffect(() => {
    if (size.width && size.height) drawGrid(ref.current, garden, view, size, readPalette());
  }, [garden, view, size]);

  return <canvas className="view-canvas" ref={ref}></canvas>;
}

export function RulerCanvas({ garden, view, size }) {
  const ref = useRef(null);

  useEffect(() => {
    if (size.width && size.height) drawRulers(ref.current, garden, view, size, readPalette());
  }, [garden, view, size]);

  return <canvas className="view-canvas" ref={ref}></canvas>;
}
