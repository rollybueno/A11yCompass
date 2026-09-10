import { contrastRatio, isLargeText } from '../src/engine/contrast';

describe('contrast', () => {
  it('computes a known WCAG pair', () => {
    const ratio = contrastRatio([119, 119, 119], [255, 255, 255]);
    expect(ratio).toBeGreaterThan(4.4);
    expect(ratio).toBeLessThan(4.6);
  });

  it('treats 18.66px bold as large text', () => {
    expect(isLargeText(18.66, 700)).toBe(true);
    expect(isLargeText(18, 400)).toBe(false);
    expect(isLargeText(24, 400)).toBe(true);
  });
});
