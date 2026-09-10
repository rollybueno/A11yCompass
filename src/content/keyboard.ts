import type { KeyboardStep } from '../shared/types';
import { computeAccessibleName } from '../engine/accessible-name';
import { computedRole } from '../engine/roles';
import { uniqueSelector } from '../engine/selector';
import { locateElement } from './overlays';

const TRAP_THRESHOLD = 15;

export interface KeyboardObserver {
  stop: () => void;
}

export function startKeyboardObserver(
  onStep: (step: KeyboardStep) => void,
): KeyboardObserver {
  let index = 0;
  const recent: Element[] = [];
  let last = 0;

  const handler = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    window.setTimeout(() => {
      const el = document.activeElement;
      if (!(el instanceof Element) || el === document.body) return;
      index += 1;
      recent.push(el);
      if (recent.length > TRAP_THRESHOLD) recent.shift();

      const name = computeAccessibleName(el).name || el.tagName.toLowerCase();
      const warnings: string[] = [];
      const style = getComputedStyle(el);
      const outlineNone =
        (style.outlineStyle === 'none' || style.outlineWidth === '0px') &&
        style.boxShadow === 'none';
      if (outlineNone) warnings.push('No obvious focus indicator detected');
      if (Number(el.getAttribute('tabindex')) > 0) warnings.push('Positive tabindex changes natural order');

      if (recent.length >= TRAP_THRESHOLD) {
        const containers = recent.map((node) => node.closest('dialog, [role="dialog"], [role="alertdialog"], .modal, .modal-dialog'));
        if (containers.every((c) => c && c === containers[0])) {
          warnings.push(`Possible keyboard trap inside ${containers[0]!.className || containers[0]!.tagName.toLowerCase()}`);
        }
      }

      const step: KeyboardStep = {
        index,
        name,
        selector: uniqueSelector(el),
        role: computedRole(el),
        warning: warnings[0],
      };
      onStep(step);
      locateElement(el, `${index}  ${name}${warnings[0] ? `  ⚠ ${warnings[0]}` : ''}`);
      last = Date.now();
    }, 0);
  };

  document.addEventListener('keydown', handler, true);
  void last;

  return {
    stop() {
      document.removeEventListener('keydown', handler, true);
    },
  };
}
