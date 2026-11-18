export const ICONS = {
  'pen': <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
  'eraser': <><path d="M20 20H9L4 15a2 2 0 0 1 0-2.8l8.2-8.2a2 2 0 0 1 2.8 0l5 5a2 2 0 0 1 0 2.8L12 20"/><path d="M7 11l6 6"/></>,
  'spray': <><rect x="4" y="10" width="9" height="11" rx="1.5"/><path d="M6.5 10V6.5h4V10"/><path d="M17 5h.01M20 8h.01M17 11h.01M20 4h.01"/></>,
  'bucket': <><path d="M4 12l8-8 8 8-8 8z"/><path d="M4 12h16"/><path d="M21 16c.9 1.3 1.4 2.2 1.4 2.9a1.4 1.4 0 0 1-2.8 0c0-.7.5-1.6 1.4-2.9z"/></>,
  'hand': <><path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 10V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M14 10.5V6.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.6-2.2L3 14.2a1.6 1.6 0 0 1 2.4-2L8 15"/></>,
  'reshape': <><path d="M4 18l4-11 8 3 4 8z"/><circle cx="8" cy="7" r="1.6" fill="currentColor"/><circle cx="16" cy="10" r="1.6" fill="currentColor"/></>,
  'text': <><path d="M5 6V4h14v2"/><path d="M12 4v16"/><path d="M9 20h6"/></>,
  'line': <><path d="M5 19L19 5"/></>,
  'ellipse': <><ellipse cx="12" cy="12" rx="9" ry="6"/></>,
  'rectangle': <><rect x="3.5" y="6" width="17" height="12" rx="1"/></>,
  'fillToggle': <><rect x="3.5" y="6" width="17" height="12" rx="1" fill="currentColor"/></>,
  'zone-freehand': <><path d="M5 14c-1-4 2-8 7-8s8 2 7 6-4 6-8 6-5-1-6-4z"/></>,
  'zone-rectangle': <><rect x="3.5" y="6" width="17" height="12" rx="1"/></>,
  'zone-ellipse': <><ellipse cx="12" cy="12" rx="9" ry="6"/></>,
  'zoneFillBtn': <><rect x="3.5" y="6" width="17" height="12" rx="1" fill="currentColor"/></>,
  'matureToggle': <><path d="M12 21v-7"/><circle cx="12" cy="9" r="6"/></>,
  'undoBtn': <><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></>,
  'clearBtn': <><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></>,
};

export function Icon({ name }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}
