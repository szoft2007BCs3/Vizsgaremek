import { useEffect, useRef, useState } from 'react';
import { clamp, getLabels, removeLabel, updateLabel } from '../../lib/store.js';

const DRAG_THRESHOLD = 6;

function labelStyle(label, garden) {
  return {
    left: `${(label.x / garden.length) * 100}%`,
    top: `${(label.y / garden.width) * 100}%`,
    '--size': label.size,
    color: label.color
  };
}

function LabelEditor({ editor, garden, onChange, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => ref.current && ref.current.focus(), 0);
    return () => clearTimeout(timer);
  }, []);

  function keyDown(e) {
    if (e.key === 'Enter') onClose(true);
    if (e.key === 'Escape') onClose(false);
    e.stopPropagation();
  }

  return (
    <input
      ref={ref}
      className="label-input"
      type="text"
      maxLength={60}
      placeholder="Írd be a szöveget…"
      value={editor.text}
      style={labelStyle(editor, garden)}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={keyDown}
      onBlur={() => onClose(true)}
      onPointerDown={(e) => e.stopPropagation()}
    />
  );
}

export default function LabelsLayer({ garden, tool, editor, setEditorText, openEditor, closeEditor, pointToGarden, commitPlan }) {
  const dragRef = useRef(null);
  const [live, setLive] = useState(null);
  const labels = getLabels();

  function startDrag(e, label) {
    if (e.target.closest('.label-remove')) return;
    e.preventDefault();
    const point = pointToGarden(e.clientX, e.clientY);
    dragRef.current = { label, offsetX: point.x - label.x, offsetY: point.y - label.y, x: label.x, y: label.y, moved: false, startX: e.clientX, startY: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function move(e) {
    const drag = dragRef.current;
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return;
    const point = pointToGarden(e.clientX, e.clientY);
    drag.moved = true;
    drag.x = clamp(point.x - drag.offsetX, 0, garden.length);
    drag.y = clamp(point.y - drag.offsetY, 0, garden.width);
    setLive({ id: drag.label.id, x: drag.x, y: drag.y });
  }

  function end() {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setLive(null);
    if (drag.moved) {
      updateLabel(drag.label.id, { x: drag.x, y: drag.y });
      commitPlan();
    } else if (tool === 'text') {
      openEditor({ x: drag.label.x, y: drag.label.y }, drag.label);
    }
  }

  function remove(label) {
    removeLabel(label.id);
    commitPlan();
  }

  return (
    <div className="labels-layer" style={{ '--len': garden.length }}>
      {labels.map((label) => {
        const shown = live && live.id === label.id ? { ...label, x: live.x, y: live.y } : label;
        return (
          <div key={label.id} className="garden-label" style={labelStyle(shown, garden)} onPointerDown={(e) => startDrag(e, label)} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
            {label.text}
            <button type="button" className="label-remove" aria-label="Felirat törlése" onClick={() => remove(label)}>×</button>
          </div>
        );
      })}
      {editor && <LabelEditor editor={editor} garden={garden} onChange={setEditorText} onClose={closeEditor} />}
    </div>
  );
}
