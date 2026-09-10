let idCounter = 0;

export function resetIds(): void {
  idCounter = 0;
}

export function nextId(prefix = 'el'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
}

function nthOfType(el: Element): number {
  const parent = el.parentElement;
  if (!parent) return 1;
  const tag = el.tagName;
  let n = 0;
  for (const child of Array.from(parent.children)) {
    if (child.tagName === tag) n += 1;
    if (child === el) return n;
  }
  return 1;
}

export function uniqueSelector(el: Element): string {
  const doc = el.ownerDocument;
  if (el.id && !/^\d/.test(el.id) && doc.querySelectorAll(`#${cssEscape(el.id)}`).length === 1) {
    return `#${cssEscape(el.id)}`;
  }

  const testid = el.getAttribute('data-testid');
  if (testid && doc.querySelectorAll(`[data-testid="${cssEscape(testid)}"]`).length === 1) {
    return `[data-testid="${cssEscape(testid)}"]`;
  }

  const parts: string[] = [];
  let current: Element | null = el;
  while (current && current.nodeType === 1 && current !== document.documentElement) {
    if (current.id && !/^\d/.test(current.id)) {
      parts.unshift(`#${cssEscape(current.id)}`);
      break;
    }
    const tag = current.tagName.toLowerCase();
    const cls = Array.from(current.classList)
      .filter((c) => c && !c.startsWith('a11ycompass'))
      .slice(0, 2)
      .map((c) => `.${cssEscape(c)}`)
      .join('');
    const nth = nthOfType(current);
    const siblingCount = current.parentElement
      ? Array.from(current.parentElement.children).filter((c) => c.tagName === current!.tagName)
          .length
      : 1;
    const piece = siblingCount > 1 ? `${tag}${cls}:nth-of-type(${nth})` : `${tag}${cls}`;
    parts.unshift(piece);
    current = current.parentElement;
    if (parts.length >= 5) break;
  }
  return parts.join(' > ') || el.tagName.toLowerCase();
}

export function xpathFor(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;
  while (current && current.nodeType === 1) {
    const tag = current.tagName.toLowerCase();
    const parent: Element | null = current.parentElement;
    if (!parent) {
      parts.unshift(`/${tag}`);
      break;
    }
    const node = current;
    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === node.tagName,
    );
    const index = siblings.indexOf(node) + 1;
    parts.unshift(`/${tag}[${index}]`);
    current = parent;
  }
  return parts.join('');
}

export function previewText(el: Element, max = 80): string {
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function htmlPreview(el: Element, max = 160): string {
  const clone = el.cloneNode(true) as Element;
  const doc = el.ownerDocument;
  for (const child of Array.from(clone.querySelectorAll('*'))) {
    if (child.childNodes.length > 3) {
      child.replaceChildren(doc.createTextNode('…'));
    }
  }
  const html = clone.outerHTML.replace(/\s+/g, ' ').trim();
  return html.length > max ? `${html.slice(0, max)}…` : html;
}

export function toRef(el: Element, id?: string): import('../shared/types').ElementReference {
  return {
    id: id ?? nextId(),
    selector: uniqueSelector(el),
    tagName: el.tagName.toLowerCase(),
    text: previewText(el) || undefined,
    xpath: xpathFor(el),
  };
}
