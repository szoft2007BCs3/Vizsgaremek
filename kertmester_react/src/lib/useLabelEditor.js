import { useRef, useState } from 'react';
import { addLabel, removeLabel, updateLabel } from './store.js';

export function useLabelEditor({ getNewSize, getColor, commitPlan }) {
  const [editor, setEditor] = useState(null);
  const current = useRef(null);

  function set(next) {
    current.current = next;
    setEditor(next);
  }

  function close(save) {
    const active = current.current;
    if (!active) return;
    set(null);
    if (!save) return;
    const text = active.text.trim();
    if (active.label) {
      if (text === active.label.text) return;
      if (text) updateLabel(active.label.id, { text });
      else removeLabel(active.label.id);
    } else if (text) {
      addLabel(text, active.x, active.y, active.color, active.size);
    } else {
      return;
    }
    commitPlan();
  }

  function open(point, label) {
    close(true);
    set({
      label,
      x: label ? label.x : point.x,
      y: label ? label.y : point.y,
      size: label ? label.size : getNewSize(),
      color: label ? label.color : getColor(),
      text: label ? label.text : ''
    });
  }

  function setText(text) {
    if (current.current) set({ ...current.current, text });
  }

  return { editor, open, close, setText };
}
