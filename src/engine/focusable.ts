const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable="true"]',
  '[tabindex]',
].join(',');

export function isDisabled(el: Element): boolean {
  if (el.hasAttribute('disabled')) return true;
  if (el.getAttribute('aria-disabled') === 'true') return true;
  return Boolean(el.closest('fieldset[disabled]'));
}

export function isAriaHidden(el: Element): boolean {
  return Boolean(el.closest('[aria-hidden="true"]'));
}

export function isInert(el: Element): boolean {
  return Boolean(el.closest('[inert]'));
}

export function isVisible(el: Element): boolean {
  if (el.hasAttribute('hidden')) return false;
  const win = el.ownerDocument.defaultView;
  if (!win) return true;
  const style = win.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0 || style.position === 'fixed';
}

export function nativeTabbable(el: Element): boolean {
  if (isDisabled(el) || isInert(el)) return false;
  if (el instanceof HTMLAnchorElement) return el.hasAttribute('href');
  if (el instanceof HTMLButtonElement) return true;
  if (el instanceof HTMLInputElement) return el.type !== 'hidden';
  if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLIFrameElement) return true;
  if (el.tagName === 'SUMMARY') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  if (el instanceof HTMLMediaElement) return el.controls;
  return false;
}

export function tabIndexValue(el: Element): number {
  if (el.hasAttribute('tabindex')) {
    const n = Number(el.getAttribute('tabindex'));
    return Number.isFinite(n) ? n : 0;
  }
  return nativeTabbable(el) ? 0 : -1;
}

export function isFocusable(el: Element): boolean {
  if (isDisabled(el) || isInert(el)) return false;
  const index = tabIndexValue(el);
  if (index >= 0) return true;
  return nativeTabbable(el);
}

export function isTabbable(el: Element): boolean {
  if (!isFocusable(el)) return false;
  return tabIndexValue(el) >= 0 && isVisible(el) && !isAriaHidden(el);
}

export function queryFocusable(root: ParentNode): Element[] {
  const found = new Set<Element>();
  const walk = (node: ParentNode) => {
    if ('matches' in node && isFocusable(node as Element)) found.add(node as Element);
    if (!('querySelectorAll' in node)) return;
    for (const el of Array.from(node.querySelectorAll(INTERACTIVE_SELECTOR))) {
      found.add(el);
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  walk(root);
  return Array.from(found);
}

export function queryTabbable(root: ParentNode): Element[] {
  return queryFocusable(root)
    .filter(isTabbable)
    .sort((a, b) => {
      const ta = tabIndexValue(a);
      const tb = tabIndexValue(b);
      const aPos = ta > 0 ? ta : Infinity;
      const bPos = tb > 0 ? tb : Infinity;
      if (aPos !== bPos) return aPos - bPos;
      const pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
}
