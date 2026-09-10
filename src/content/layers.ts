import type { OverlayMode } from '../shared/types';
import { collectAuditContext } from '../engine/collect-context';
import { computeAccessibleName } from '../engine/accessible-name';
import { queryTabbable } from '../engine/focusable';
import { computedRole, headingLevel } from '../engine/roles';
import { uniqueSelector } from '../engine/selector';
import { paintLayer } from './overlays';

export function applyOverlay(mode: OverlayMode['id']): void {
  if (mode === 'off' || mode === 'issues') {
    paintLayer([]);
    return;
  }
  const context = collectAuditContext(document);
  if (mode === 'headings') {
    paintLayer(
      context.headings.map((h) => ({
        el: document.querySelector(h.element.selector)!,
        tag: `H${h.level}  ${h.name || '(empty)'}`,
      })).filter((x) => x.el),
    );
    return;
  }
  if (mode === 'landmarks') {
    paintLayer(
      context.landmarks.map((l) => ({
        el: document.querySelector(l.element.selector)!,
        tag: `${l.role.toUpperCase()}${l.name ? ` — ${l.name}` : ''}`,
      })).filter((x) => x.el),
    );
    return;
  }
  if (mode === 'tabstops') {
    paintLayer(
      queryTabbable(document).map((el, i) => ({
        el,
        tag: `[${i + 1}] ${computeAccessibleName(el).name || uniqueSelector(el)}`,
      })),
    );
    return;
  }
  if (mode === 'images') {
    paintLayer(
      context.images.map((img) => ({
        el: document.querySelector(img.element.selector)!,
        tag: img.hasAltAttribute ? `alt="${img.alt}"` : 'alt missing',
      })).filter((x) => x.el),
    );
    return;
  }
  if (mode === 'forms') {
    paintLayer(
      context.controls.map((c) => ({
        el: document.querySelector(c.element.selector)!,
        tag: c.name.name || 'unnamed',
      })).filter((x) => x.el),
    );
    return;
  }
  if (mode === 'aria') {
    paintLayer(
      Array.from(document.querySelectorAll('[role]')).map((el) => ({
        el,
        tag: `role="${el.getAttribute('role')}"`,
      })),
    );
  }
  void headingLevel;
  void computedRole;
}
