import type { AccessibilityRule } from '../shared/types';
import { resultFrom } from '../engine/result';

export const landmarkRules: AccessibilityRule[] = [
  {
    id: 'main-landmark-missing',
    title: 'Main landmark is missing',
    category: 'landmarks',
    defaultSeverity: 'warning',
    wcag: ['1.3.1', '2.4.1'],
    whyItMatters: 'A main landmark lets keyboard and screen-reader users skip to primary content.',
    run(context) {
      const mains = context.landmarks.filter((l) => l.role === 'main');
      if (mains.length === 0) {
        return [
          resultFrom(this, 'warning', 'No main landmark was found on this page.'),
        ];
      }
      return [];
    },
  },
  {
    id: 'multiple-main-landmarks',
    title: 'Multiple main landmarks',
    category: 'landmarks',
    defaultSeverity: 'warning',
    wcag: ['1.3.1'],
    whyItMatters: 'More than one main landmark makes it unclear which region is primary.',
    run(context) {
      const mains = context.landmarks.filter((l) => l.role === 'main');
      if (mains.length > 1) {
        return mains.map((m) =>
          resultFrom(this, 'warning', 'Multiple main landmarks were found.', { element: m.element }),
        );
      }
      return [];
    },
  },
  {
    id: 'navigation-name-missing-review',
    title: 'Additional navigation landmark has no name',
    category: 'landmarks',
    defaultSeverity: 'review',
    wcag: ['1.3.1'],
    whyItMatters: 'When a page has more than one navigation region, names distinguish them.',
    run(context) {
      const navs = context.landmarks.filter((l) => l.role === 'navigation');
      if (navs.length < 2) return [];
      return navs
        .filter((n) => !n.name)
        .map((n) =>
          resultFrom(this, 'review', 'This navigation landmark has no accessible name.', {
            element: n.element,
          }),
        );
    },
  },
  {
    id: 'region-name-missing',
    title: 'Region landmark is missing an accessible name',
    category: 'landmarks',
    defaultSeverity: 'warning',
    wcag: ['1.3.1'],
    whyItMatters: 'role="region" only becomes a landmark when it has an accessible name.',
    run(context) {
      return context.landmarks
        .filter((l) => l.role === 'region' && !l.name)
        .map((l) =>
          resultFrom(this, 'warning', 'Region landmark has no accessible name.', {
            element: l.element,
          }),
        );
    },
  },
];
