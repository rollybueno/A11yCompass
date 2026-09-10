import type { ManualCheck } from '../shared/types';

export const MANUAL_CHECKS: ManualCheck[] = [
  { id: 'kb-reachable', category: 'Keyboard', label: 'All functionality is reachable by keyboard' },
  { id: 'kb-order', category: 'Keyboard', label: 'Focus order is logical' },
  { id: 'kb-visible', category: 'Keyboard', label: 'Focus is clearly visible' },
  { id: 'kb-traps', category: 'Keyboard', label: 'No unexpected keyboard traps' },
  { id: 'kb-escape', category: 'Keyboard', label: 'Escape closes dismissible overlays' },
  { id: 'kb-dialog-contain', category: 'Keyboard', label: 'Dialog focus is contained appropriately' },
  { id: 'kb-dialog-restore', category: 'Keyboard', label: 'Focus returns after dialog closes' },
  { id: 'focus-clear', category: 'Focus', label: 'Focus indicator is easy to see against the background' },
  { id: 'focus-not-obscured', category: 'Focus', label: 'Focused controls are not hidden by sticky headers or cookies banners' },
  { id: 'focus-custom', category: 'Focus', label: 'Custom widgets expose a visible focus treatment' },
  { id: 'focus-skip', category: 'Focus', label: 'Skip link becomes visible on focus' },
  { id: 'focus-order-visual', category: 'Focus', label: 'Tab order matches visual reading order' },
  { id: 'img-purpose', category: 'Images', label: 'Informative images have meaningful text alternatives' },
  { id: 'img-decorative', category: 'Images', label: 'Decorative images are hidden from assistive technology' },
  { id: 'img-complex', category: 'Images', label: 'Complex images have longer descriptions where needed' },
  { id: 'form-labels', category: 'Forms', label: 'Every control has a persistent visible label' },
  { id: 'form-errors', category: 'Forms', label: 'Error messages are clear and associated with controls' },
  { id: 'form-required', category: 'Forms', label: 'Required fields are identified in text, not color alone' },
  { id: 'content-lang', category: 'Content', label: 'Language changes are marked when the page mixes languages' },
  { id: 'content-links', category: 'Content', label: 'Link text makes sense out of context' },
  { id: 'content-headings', category: 'Content', label: 'Headings describe the sections they introduce' },
  { id: 'nav-consistent', category: 'Navigation', label: 'Primary navigation is consistent across pages in this flow' },
  { id: 'modal-name', category: 'Modals', label: 'Dialogs have an accessible name and expected keyboard behavior' },
  { id: 'media-captions', category: 'Media', label: 'Video has accurate captions if media is present' },
  { id: 'zoom-reflow', category: 'Zoom/Reflow', label: 'Content remains usable at 200% zoom / 320px width' },
  { id: 'motion-reduce', category: 'Motion', label: 'Motion can be reduced or is not essential' },
];

export function checksByCategory(): Map<string, ManualCheck[]> {
  const map = new Map<string, ManualCheck[]>();
  for (const check of MANUAL_CHECKS) {
    const list = map.get(check.category) ?? [];
    list.push(check);
    map.set(check.category, list);
  }
  return map;
}
