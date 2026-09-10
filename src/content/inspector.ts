import type { InspectorSnapshot } from '../shared/types';
import { computeAccessibleDescription, computeAccessibleName } from '../engine/accessible-name';
import { inspectContrast } from '../engine/contrast';
import { isFocusable, tabIndexValue } from '../engine/focusable';
import { computedRole } from '../engine/roles';
import { htmlPreview, uniqueSelector } from '../engine/selector';

export function snapshotElement(el: Element): InspectorSnapshot {
  const name = computeAccessibleName(el);
  const aria: Record<string, string> = {};
  for (const attr of Array.from(el.attributes)) {
    if (attr.name === 'role' || attr.name.startsWith('aria-')) {
      aria[attr.name] = attr.value;
    }
  }
  const hasTab = el.hasAttribute('tabindex');
  return {
    selector: uniqueSelector(el),
    tagName: el.tagName.toLowerCase(),
    htmlPreview: htmlPreview(el),
    role: computedRole(el),
    name,
    description: computeAccessibleDescription(el) || 'None',
    focusable: isFocusable(el),
    tabIndex: hasTab ? String(tabIndexValue(el)) : 'implicit',
    aria,
    contrast: inspectContrast(el),
    issues: [],
  };
}
