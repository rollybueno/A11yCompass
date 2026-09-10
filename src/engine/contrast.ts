import type { ContrastReport } from '../shared/types';

type FillStyleCanvas = { fillStyle: string };

const colorCanvas: FillStyleCanvas =
  (typeof document !== 'undefined'
    ? (document.createElement('canvas').getContext('2d') as FillStyleCanvas | null)
    : null) ?? { fillStyle: '#000' };

export function parseColor(input: string): [number, number, number, number] | null {
  if (!input || input === 'transparent') return [0, 0, 0, 0];
  const ctx = colorCanvas;
  ctx.fillStyle = '#000';
  ctx.fillStyle = input;
  const computed = String(ctx.fillStyle);
  if (computed.startsWith('rgba')) {
    const m = computed.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a] = m[1].split(',').map((n) => Number(n.trim()));
    return [r, g, b, Number.isFinite(a) ? a : 1];
  }
  if (computed.startsWith('rgb')) {
    const m = computed.match(/rgb\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b] = m[1].split(',').map((n) => Number(n.trim()));
    return [r, g, b, 1];
  }
  if (computed.startsWith('#')) {
    let hex = computed.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const n = Number.parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  return null;
}

function srgbChannel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(srgbChannel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function toHex(rgb: [number, number, number, number?]): string {
  const [r, g, b] = rgb;
  return `#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function composite(
  fg: [number, number, number, number],
  bg: [number, number, number, number],
): [number, number, number, number] {
  const a = fg[3] + bg[3] * (1 - fg[3]);
  if (a === 0) return [0, 0, 0, 0];
  const r = (fg[0] * fg[3] + bg[0] * bg[3] * (1 - fg[3])) / a;
  const g = (fg[1] * fg[3] + bg[1] * bg[3] * (1 - fg[3])) / a;
  const b = (fg[2] * fg[3] + bg[2] * bg[3] * (1 - fg[3])) / a;
  return [r, g, b, a];
}

export function resolveBackground(el: Element): {
  color: [number, number, number, number];
  complex: boolean;
} {
  let current: Element | null = el;
  let acc: [number, number, number, number] = [0, 0, 0, 0];
  let complex = false;
  const win = el.ownerDocument.defaultView;

  while (current) {
    const style = win?.getComputedStyle(current);
    if (style) {
      const image = style.backgroundImage;
      if (image && image !== 'none') complex = true;
      const parsed = parseColor(style.backgroundColor);
      if (parsed) {
        acc = composite(acc, parsed);
      }
      const opacity = Number(style.opacity);
      if (Number.isFinite(opacity) && opacity < 1) {
        acc = [acc[0], acc[1], acc[2], acc[3] * opacity];
      }
    }
    if (acc[3] >= 0.99) break;
    current = current.parentElement;
  }
  if (acc[3] < 0.99) acc = composite(acc, [255, 255, 255, 1]);
  return { color: acc, complex };
}

export function isLargeText(fontSizePx: number, fontWeight: number): boolean {
  if (fontWeight >= 700) return fontSizePx >= 18.66;
  return fontSizePx >= 24;
}

export function inspectContrast(el: Element): ContrastReport | undefined {
  const win = el.ownerDocument.defaultView;
  if (!win) return undefined;
  const style = win.getComputedStyle(el);
  const fg = parseColor(style.color);
  if (!fg) return undefined;
  const bg = resolveBackground(el);
  const fontSizePx = Number.parseFloat(style.fontSize) || 16;
  const fontWeight = Number.parseInt(style.fontWeight, 10) || 400;
  const largeText = isLargeText(fontSizePx, fontWeight);
  const required = largeText ? 3 : 4.5;
  const ratio = contrastRatio([fg[0], fg[1], fg[2]], [bg.color[0], bg.color[1], bg.color[2]]);
  const result: ContrastReport['result'] = bg.complex ? 'review' : ratio >= required ? 'pass' : 'fail';
  return {
    foreground: toHex(fg),
    background: toHex(bg.color),
    ratio: Math.round(ratio * 100) / 100,
    fontSizePx,
    fontWeight,
    largeText,
    required,
    result,
    note: bg.complex
      ? 'Background image or gradient detected. Automatic contrast may not represent every point behind this text.'
      : undefined,
  };
}

export function hasDirectText(el: Element): boolean {
  return Array.from(el.childNodes).some(
    (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0,
  );
}
