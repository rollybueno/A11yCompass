import type { AccessibilityRule } from '../shared/types';
import { resultFrom } from '../engine/result';

export const headingRules: AccessibilityRule[] = [
  {
    id: 'heading-empty',
    title: 'Empty heading',
    category: 'headings',
    defaultSeverity: 'error',
    wcag: ['1.3.1', '2.4.6'],
    whyItMatters: 'Empty headings add noise to the document outline without describing a section.',
    run(context) {
      return context.headings
        .filter((h) => !h.name.trim())
        .map((h) => resultFrom(this, 'error', 'Heading is empty.', { element: h.element }));
    },
  },
  {
    id: 'heading-level-jump',
    title: 'Heading level jumps',
    category: 'headings',
    defaultSeverity: 'review',
    wcag: ['1.3.1'],
    whyItMatters:
      'A skipped heading level may still be correct, but often means the outline does not match the page structure.',
    suggestedReview: 'Review whether the levels accurately represent the document hierarchy.',
    run(context) {
      const results = [];
      let previous = 0;
      for (const heading of context.headings) {
        if (!heading.name.trim()) {
          previous = heading.level;
          continue;
        }
        if (previous && heading.level > previous + 1) {
          results.push(
            resultFrom(
              this,
              'review',
              `Heading level jumps from H${previous} to H${heading.level}.`,
              {
                element: heading.element,
                details: { from: previous, to: heading.level },
              },
            ),
          );
        }
        previous = heading.level;
      }
      return results;
    },
  },
];
