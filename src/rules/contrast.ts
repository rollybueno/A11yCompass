import type { AccessibilityRule } from '../shared/types';
import { hasDirectText, inspectContrast } from '../engine/contrast';
import { nextId, toRef } from '../engine/selector';
import { resultFrom } from '../engine/result';

const TEXT_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, a, button, label, span, td, th, caption, figcaption, summary, dt, dd';

export const contrastRules: AccessibilityRule[] = [
  {
    id: 'text-contrast-insufficient',
    title: 'Text contrast is insufficient',
    category: 'contrast',
    defaultSeverity: 'error',
    wcag: ['1.4.3'],
    whyItMatters: 'Low-contrast text is difficult or impossible to read for many people.',
    run(context) {
      const results = [];
      const seen = new Set<Element>();
      for (const el of Array.from(context.document.querySelectorAll(TEXT_SELECTOR))) {
        if (!hasDirectText(el) || seen.has(el)) continue;
        seen.add(el);
        const report = inspectContrast(el);
        if (!report) continue;
        if (report.result === 'fail') {
          results.push(
            resultFrom(
              this,
              'error',
              `Contrast ${report.ratio}:1 is below the required ${report.required}:1.`,
              {
                element: toRef(el, nextId('c')),
                details: { ...report },
              },
            ),
          );
        }
      }
      return results;
    },
  },
  {
    id: 'text-contrast-complex-review',
    title: 'Contrast over a complex background needs review',
    category: 'contrast',
    defaultSeverity: 'review',
    wcag: ['1.4.3'],
    whyItMatters:
      'Automatic contrast calculation may not represent every point behind text on images or gradients.',
    run(context) {
      const results = [];
      for (const el of Array.from(context.document.querySelectorAll(TEXT_SELECTOR))) {
        if (!hasDirectText(el)) continue;
        const report = inspectContrast(el);
        if (report?.result === 'review') {
          results.push(
            resultFrom(this, 'review', report.note ?? 'Background image or gradient detected.', {
              element: toRef(el, nextId('c')),
              details: { ...report },
            }),
          );
        }
      }
      return results;
    },
  },
];
