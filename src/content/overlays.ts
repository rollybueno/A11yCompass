const HOST_ID = 'a11ycompass-overlay-host';
const STYLE = `
:host { all: initial; }
.box {
  position: fixed;
  pointer-events: none;
  z-index: 2147483646;
  box-sizing: border-box;
  border: 2px solid #c23b22;
  background: rgba(194, 59, 34, 0.08);
  outline: 1px solid #faf7f0;
}
.caption {
  position: fixed;
  z-index: 2147483647;
  pointer-events: none;
  max-width: min(360px, 90vw);
  background: #1c2430;
  color: #faf7f0;
  font: 12px/1.35 "Atkinson Hyperlegible", "Segoe UI", sans-serif;
  padding: 6px 8px;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(28, 36, 48, 0.35);
}
.tag {
  position: absolute;
  left: 0;
  top: 0;
  transform: translateY(-100%);
  background: #1c2430;
  color: #faf7f0;
  font: 700 11px/1.2 "Atkinson Hyperlegible", "Segoe UI", sans-serif;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.layer-box { border-color: #0f6e6b; background: rgba(15, 110, 107, 0.08); }
.layer-box .tag { background: #0f6e6b; }
`;

interface OverlayRoot {
  host: HTMLElement;
  shadow: ShadowRoot;
}

function root(): OverlayRoot {
  let host = document.getElementById(HOST_ID) as HTMLElement | null;
  if (!host) {
    host = document.createElement('div');
    host.id = HOST_ID;
    host.setAttribute('data-a11ycompass', 'overlay');
    document.documentElement.appendChild(host);
  }
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
  if (!shadow.querySelector('style')) {
    const style = document.createElement('style');
    style.textContent = STYLE;
    shadow.appendChild(style);
  }
  return { host, shadow };
}

export function clearOverlays(exceptLocate = false): void {
  const { shadow } = root();
  for (const node of Array.from(shadow.querySelectorAll('[data-kind]'))) {
    if (exceptLocate && node.getAttribute('data-kind') === 'locate') continue;
    node.remove();
  }
}

export function destroyOverlays(): void {
  document.getElementById(HOST_ID)?.remove();
}

function placeBox(el: Element, kind: string, tag: string, extraClass = ''): void {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;
  const { shadow } = root();
  const box = document.createElement('div');
  box.className = `box ${extraClass}`.trim();
  box.dataset.kind = kind;
  box.style.top = `${rect.top}px`;
  box.style.left = `${rect.left}px`;
  box.style.width = `${Math.max(rect.width, 4)}px`;
  box.style.height = `${Math.max(rect.height, 4)}px`;
  const label = document.createElement('div');
  label.className = 'tag';
  label.textContent = tag;
  box.appendChild(label);
  shadow.appendChild(box);
}

export function locateElement(el: Element, caption: string): void {
  clearOverlays();
  el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
  const run = () => {
    const rect = el.getBoundingClientRect();
    const { shadow } = root();
    const box = document.createElement('div');
    box.className = 'box';
    box.dataset.kind = 'locate';
    box.style.top = `${rect.top}px`;
    box.style.left = `${rect.left}px`;
    box.style.width = `${Math.max(rect.width, 8)}px`;
    box.style.height = `${Math.max(rect.height, 8)}px`;
    const cap = document.createElement('div');
    cap.className = 'caption';
    cap.dataset.kind = 'locate';
    cap.textContent = caption;
    const top = Math.min(window.innerHeight - 48, Math.max(8, rect.bottom + 8));
    cap.style.top = `${top}px`;
    cap.style.left = `${Math.min(rect.left, window.innerWidth - 280)}px`;
    shadow.appendChild(box);
    shadow.appendChild(cap);
  };
  requestAnimationFrame(run);
  window.setTimeout(() => clearOverlays(), 5000);
}

export function paintLayer(
  items: { el: Element; tag: string }[],
): void {
  clearOverlays();
  for (const item of items) placeBox(item.el, 'layer', item.tag, 'layer-box');
}

export function setInspectCursor(on: boolean): void {
  document.documentElement.style.cursor = on ? 'crosshair' : '';
}
