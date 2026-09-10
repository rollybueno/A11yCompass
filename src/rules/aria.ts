import type { AccessibilityRule } from '../shared/types';
import { isFocusable } from '../engine/focusable';
import { computedRole, implicitRole, isValidRole } from '../engine/roles';
import { nextId, toRef } from '../engine/selector';
import { resultFrom } from '../engine/result';

const INTERACTIVE_ROLES = new Set([
  'button',
  'link',
  'checkbox',
  'radio',
  'switch',
  'tab',
  'menuitem',
  'slider',
  'textbox',
  'combobox',
  'searchbox',
  'spinbutton',
]);

export const ariaRules: AccessibilityRule[] = [
  {
    id: 'aria-role-invalid',
    title: 'Invalid ARIA role',
    category: 'aria',
    defaultSeverity: 'error',
    wcag: ['4.1.2'],
    whyItMatters: 'Unknown roles are ignored, so the intended semantics never reach assistive technology.',
    run(context) {
      return context.ariaElements
        .filter((a) => a.role && !isValidRole(a.role.split(/\s+/)[0]))
        .map((a) =>
          resultFrom(this, 'error', `Invalid ARIA role: "${a.role}"`, { element: a.element }),
        );
    },
  },
  {
    id: 'aria-describedby-target-missing',
    title: 'aria-describedby target is missing',
    category: 'aria',
    defaultSeverity: 'error',
    wcag: ['1.3.1', '4.1.2'],
    whyItMatters: 'Broken description references hide helper text from assistive technology.',
    run(context) {
      return context.ariaElements
        .filter((a) => a.describedBy)
        .flatMap((a) => {
          const missing = a.describedBy!.split(/\s+/).filter((id) => !context.document.getElementById(id));
          if (!missing.length) return [];
          return [
            resultFrom(this, 'error', `aria-describedby references missing id(s): ${missing.join(', ')}`, {
              element: a.element,
            }),
          ];
        });
    },
  },
  {
    id: 'aria-hidden-focusable',
    title: 'Focusable content inside aria-hidden',
    category: 'aria',
    defaultSeverity: 'error',
    wcag: ['4.1.2', '2.4.3'],
    whyItMatters:
      'Keyboard users may reach content that is hidden from assistive technologies.',
    run(context) {
      const hidden = Array.from(context.document.querySelectorAll('[aria-hidden="true"]'));
      const results = [];
      for (const root of hidden) {
        const candidates = [root, ...Array.from(root.querySelectorAll('*'))];
        for (const el of candidates) {
          if (isFocusable(el)) {
            results.push(
              resultFrom(this, 'error', 'Focusable content exists inside an aria-hidden container.', {
                element: toRef(el, nextId('aria')),
              }),
            );
          }
        }
      }
      return results;
    },
  },
  {
    id: 'redundant-role',
    title: 'Redundant ARIA role',
    category: 'aria',
    defaultSeverity: 'info',
    wcag: ['4.1.2'],
    whyItMatters: 'Prefer native HTML semantics where possible.',
    run(context) {
      return Array.from(context.document.querySelectorAll('[role]'))
        .filter((el) => {
          const role = el.getAttribute('role');
          const implicit = implicitRole(el);
          return Boolean(role && implicit && role === implicit);
        })
        .map((el) =>
          resultFrom(
            this,
            'info',
            `Redundant ARIA role. <${el.tagName.toLowerCase()}> already has an implicit ${implicitRole(el)} role.`,
            { element: toRef(el, nextId('aria')) },
          ),
        );
    },
  },
  {
    id: 'interactive-role-keyboard-review',
    title: 'Custom interactive widget may not be keyboard operable',
    category: 'aria',
    defaultSeverity: 'review',
    wcag: ['2.1.1', '4.1.2'],
    whyItMatters:
      'Adding an ARIA role does not provide the keyboard behavior of a native HTML control.',
    run(context) {
      return Array.from(context.document.querySelectorAll('[role]'))
        .filter((el) => INTERACTIVE_ROLES.has(computedRole(el)))
        .filter((el) => !['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY'].includes(el.tagName))
        .filter((el) => !isFocusable(el))
        .map((el) =>
          resultFrom(
            this,
            'review',
            `Custom ${computedRole(el)} detected on <${el.tagName.toLowerCase()}> and it is not focusable.`,
            { element: toRef(el, nextId('aria')) },
          ),
        );
    },
  },
];
