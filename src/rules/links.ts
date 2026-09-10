import type { AccessibilityRule } from '../shared/types';
import { computeAccessibleName } from '../engine/accessible-name';
import { computedRole } from '../engine/roles';
import { nextId, toRef } from '../engine/selector';
import { resultFrom } from '../engine/result';

const WEAK_LINK = new Set([
  'click here',
  'read more',
  'more',
  'learn more',
  'here',
  'details',
  'link',
]);

function isButtonLike(el: Element): boolean {
  if (el.tagName === 'BUTTON') return true;
  if (el instanceof HTMLInputElement && ['button', 'submit', 'reset'].includes(el.type)) return true;
  return computedRole(el) === 'button';
}

function isLinkLike(el: Element): boolean {
  if (el.tagName === 'A') return true;
  return computedRole(el) === 'link';
}

export const linkRules: AccessibilityRule[] = [
  {
    id: 'button-name-missing',
    title: 'Button has no accessible name',
    category: 'links',
    defaultSeverity: 'error',
    wcag: ['4.1.2'],
    whyItMatters: 'Screen reader users may hear only "button" without knowing what the control does.',
    suggestedReview: 'Provide an accessible name describing the control’s purpose.',
    possibleApproaches: ['Visible text', 'aria-label', 'aria-labelledby'],
    run(context) {
      return Array.from(context.document.querySelectorAll('button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]'))
        .filter(isButtonLike)
        .filter((el) => !computeAccessibleName(el).name)
        .map((el) =>
          resultFrom(this, 'error', 'Button has no accessible name.', {
            element: toRef(el, nextId('btn')),
          }),
        );
    },
  },
  {
    id: 'link-name-missing',
    title: 'Link has no accessible name',
    category: 'links',
    defaultSeverity: 'error',
    wcag: ['2.4.4', '4.1.2'],
    whyItMatters: 'Links without names cannot be distinguished in a links list.',
    run(context) {
      return Array.from(context.document.querySelectorAll('a, [role="link"]'))
        .filter(isLinkLike)
        .filter((el) => (el instanceof HTMLAnchorElement ? el.hasAttribute('href') : true))
        .filter((el) => !computeAccessibleName(el).name)
        .map((el) =>
          resultFrom(this, 'error', 'Link has no accessible name.', {
            element: toRef(el, nextId('a')),
          }),
        );
    },
  },
  {
    id: 'empty-link',
    title: 'Empty link',
    category: 'links',
    defaultSeverity: 'error',
    wcag: ['2.4.4'],
    whyItMatters: 'An anchor with href but no content is not understandable.',
    run(context) {
      return Array.from(context.document.querySelectorAll('a[href]'))
        .filter((el) => {
          const name = computeAccessibleName(el).name;
          const text = (el.textContent ?? '').trim();
          return !name && !text && !el.querySelector('img[alt], svg title');
        })
        .map((el) =>
          resultFrom(this, 'error', 'Link is empty.', { element: toRef(el, nextId('a')) }),
        );
    },
  },
  {
    id: 'generic-link-text-review',
    title: 'Link text is generic',
    category: 'links',
    defaultSeverity: 'review',
    wcag: ['2.4.4'],
    whyItMatters:
      'Surrounding context or an accessible name may make generic text understandable — review in place.',
    run(context) {
      return Array.from(context.document.querySelectorAll('a[href]'))
        .map((el) => ({ el, name: computeAccessibleName(el).name }))
        .filter(({ name }) => WEAK_LINK.has(name.trim().toLowerCase()))
        .map(({ el, name }) =>
          resultFrom(this, 'review', `Link text may be generic: "${name}"`, {
            element: toRef(el, nextId('a')),
          }),
        );
    },
  },
  {
    id: 'icon-button-name-review',
    title: 'Icon-only button should be reviewed',
    category: 'links',
    defaultSeverity: 'review',
    wcag: ['4.1.2'],
    whyItMatters: 'Icon buttons often rely on a name that is easy to get wrong.',
    run(context) {
      return Array.from(context.document.querySelectorAll('button, [role="button"]'))
        .filter((el) => {
          const text = (el.textContent ?? '').replace(/\s+/g, '').trim();
          const hasGraphic = Boolean(el.querySelector('svg, img'));
          const name = computeAccessibleName(el);
          return hasGraphic && !text && Boolean(name.name);
        })
        .map((el) =>
          resultFrom(
            this,
            'review',
            'Icon-only button detected. Confirm the accessible name describes the action.',
            { element: toRef(el, nextId('btn')) },
          ),
        );
    },
  },
];
