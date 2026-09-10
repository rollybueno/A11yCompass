import type { AccessibilityRule } from '../shared/types';
import { nativeTabbable } from '../engine/focusable';
import { nextId, toRef } from '../engine/selector';
import { resultFrom } from '../engine/result';

export const keyboardRules: AccessibilityRule[] = [
  {
    id: 'positive-tabindex',
    title: 'Positive tabindex detected',
    category: 'keyboard',
    defaultSeverity: 'warning',
    wcag: ['2.4.3'],
    whyItMatters: 'Positive tabindex values can create unexpected keyboard navigation order.',
    run(context) {
      return context.focusableElements
        .filter((el) => el.tabIndex > 0)
        .map((el) =>
          resultFrom(this, 'warning', `Positive tabindex detected (${el.tabIndex}).`, {
            element: el.element,
            details: { tabindex: el.tabIndex },
          }),
        );
    },
  },
  {
    id: 'hidden-focusable',
    title: 'Hidden element is still focusable',
    category: 'focus',
    defaultSeverity: 'warning',
    wcag: ['2.4.3', '2.4.7'],
    whyItMatters: 'Focus can land on content users cannot see.',
    run(context) {
      return context.focusableElements
        .filter((el) => el.tabIndex >= 0 && (!el.visible || el.ariaHidden))
        .map((el) =>
          resultFrom(this, 'warning', 'A focusable element appears hidden or aria-hidden.', {
            element: el.element,
          }),
        );
    },
  },
  {
    id: 'tabindex-noninteractive-review',
    title: 'tabindex on a non-interactive element',
    category: 'keyboard',
    defaultSeverity: 'review',
    wcag: ['2.1.1'],
    whyItMatters:
      'Making static elements focusable can confuse keyboard users unless a widget pattern is implemented.',
    run(context) {
      return Array.from(context.document.querySelectorAll('[tabindex]'))
        .filter((el) => {
          const value = Number(el.getAttribute('tabindex'));
          if (!Number.isFinite(value) || value < 0) return false;
          return !nativeTabbable(el) && !el.getAttribute('role');
        })
        .map((el) =>
          resultFrom(this, 'review', 'tabindex is set on a non-interactive element.', {
            element: toRef(el, nextId('kb')),
          }),
        );
    },
  },
];
