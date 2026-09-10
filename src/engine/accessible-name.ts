import { computedRole } from './roles';

const NAME_FROM_CONTENTS = new Set([
  'button',
  'cell',
  'checkbox',
  'columnheader',
  'gridcell',
  'heading',
  'link',
  'listitem',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'row',
  'rowheader',
  'switch',
  'tab',
  'tooltip',
  'treeitem',
]);

export interface NameResult {
  name: string;
  source: string;
}

function visible(el: Element): boolean {
  if (el.getAttribute('aria-hidden') === 'true') return false;
  if (el.hasAttribute('hidden')) return false;
  const win = el.ownerDocument.defaultView;
  if (!win) return true;
  const style = win.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  return true;
}

function flattenIdRefs(doc: Document, ids: string): Element[] {
  return ids
    .split(/\s+/)
    .map((id) => doc.getElementById(id))
    .filter((node): node is HTMLElement => Boolean(node));
}

function hostLabel(el: Element): HTMLLabelElement | null {
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    if (el.labels && el.labels.length) return el.labels[0];
  }
  const id = el.getAttribute('id');
  if (id) {
    const label = el.ownerDocument.querySelector(`label[for="${CSS.escape ? CSS.escape(id) : id}"]`);
    if (label instanceof HTMLLabelElement) return label;
  }
  return el.closest('label');
}

function contentsName(el: Element, visited: Set<Element>): string {
  let out = '';
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? '';
      continue;
    }
    if (!(node instanceof Element)) continue;
    if (!visible(node)) continue;
    if (node.tagName === 'BR') {
      out += ' ';
      continue;
    }
    if (node.tagName === 'IMG' || node.tagName === 'SVG' || node.getAttribute('role') === 'img') {
      const nested = computeAccessibleName(node, visited);
      if (nested.name) out += ` ${nested.name} `;
      continue;
    }
    out += ` ${contentsName(node, visited)} `;
  }
  return out.replace(/\s+/g, ' ').trim();
}

export function computeAccessibleName(
  el: Element,
  visited: Set<Element> = new Set(),
  fromReference = false,
): NameResult {
  if (visited.has(el)) return { name: '', source: 'none' };
  visited.add(el);

  if (!visible(el) && el.getAttribute('aria-hidden') === 'true') {
    return { name: '', source: 'none' };
  }

  const labelledby = el.getAttribute('aria-labelledby');
  if (labelledby && !fromReference) {
    const parts = flattenIdRefs(el.ownerDocument, labelledby)
      .map((ref) => computeAccessibleName(ref, visited, true).name)
      .filter(Boolean);
    if (parts.length) {
      return { name: parts.join(' ').replace(/\s+/g, ' ').trim(), source: `aria-labelledby → ${labelledby}` };
    }
  }

  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel?.trim()) {
    return { name: ariaLabel.trim(), source: 'aria-label' };
  }

  if (el instanceof HTMLInputElement && el.type === 'image') {
    const alt = el.getAttribute('alt');
    if (alt && alt.trim()) return { name: alt.trim(), source: 'alt' };
  }

  if (el.tagName === 'IMG') {
    if (el.hasAttribute('alt')) {
      return { name: (el.getAttribute('alt') ?? '').trim(), source: 'alt' };
    }
    const title = el.getAttribute('title');
    if (title?.trim()) return { name: title.trim(), source: 'title' };
  }

  if (el.tagName === 'SVG') {
    const title = el.querySelector(':scope > title');
    if (title?.textContent?.trim()) {
      return { name: title.textContent.trim(), source: 'svg <title>' };
    }
  }

  const label = hostLabel(el);
  if (label && label !== el) {
    const name = contentsName(label, visited);
    if (name) return { name, source: label.htmlFor ? `label[for=${label.htmlFor}]` : 'wrapping <label>' };
  }

  if (el instanceof HTMLInputElement || el instanceof HTMLButtonElement) {
    const type = el instanceof HTMLInputElement ? el.type : 'button';
    if (type === 'submit' || type === 'reset' || type === 'button') {
      const value = el.getAttribute('value');
      if (value?.trim()) return { name: value.trim(), source: 'value' };
      if (type === 'submit') return { name: 'Submit', source: 'implicit value' };
      if (type === 'reset') return { name: 'Reset', source: 'implicit value' };
    }
  }

  const role = computedRole(el);
  if (
    fromReference ||
    NAME_FROM_CONTENTS.has(role) ||
    el.tagName === 'BUTTON' ||
    el.tagName === 'A' ||
    el.tagName === 'SUMMARY'
  ) {
    const name = contentsName(el, visited);
    if (name) return { name, source: 'contents' };
  }

  const title = el.getAttribute('title');
  if (title?.trim()) return { name: title.trim(), source: 'title' };

  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const placeholder = el.getAttribute('placeholder');
    if (placeholder?.trim()) return { name: placeholder.trim(), source: 'placeholder' };
  }

  return { name: '', source: 'none' };
}

export function computeAccessibleDescription(el: Element): string {
  const describedby = el.getAttribute('aria-describedby');
  if (describedby) {
    const parts = flattenIdRefs(el.ownerDocument, describedby)
      .map((ref) => (ref.textContent ?? '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    if (parts.length) return parts.join(' ');
  }
  const title = el.getAttribute('title');
  const name = computeAccessibleName(el);
  if (title?.trim() && title.trim() !== name.name) return title.trim();
  return '';
}
