import type { AccessibilityRule } from '../shared/types';
import { computeAccessibleName } from '../engine/accessible-name';
import { nextId, toRef } from '../engine/selector';
import { resultFrom } from '../engine/result';

const NAMED_TYPES = new Set([
  'text',
  'email',
  'password',
  'search',
  'tel',
  'url',
  'number',
  'date',
  'datetime-local',
  'month',
  'week',
  'time',
  'color',
  'file',
  'checkbox',
  'radio',
]);

function isFormControl(el: Element): boolean {
  if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) {
    return NAMED_TYPES.has(el.type) || !el.type;
  }
  return false;
}

export const formRules: AccessibilityRule[] = [
  {
    id: 'form-control-name-missing',
    title: 'Form control missing accessible name',
    category: 'forms',
    defaultSeverity: 'error',
    wcag: ['4.1.2', '1.3.1'],
    whyItMatters:
      'Screen reader users may hear only the control type without knowing what to enter or select.',
    suggestedReview: 'Provide a persistent accessible name via a label, aria-label, or aria-labelledby.',
    possibleApproaches: ['<label for>', 'Wrapping <label>', 'aria-label', 'aria-labelledby'],
    run(context) {
      return Array.from(
        context.document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="reset"]):not([type="button"]):not([type="image"]), select, textarea'),
      )
        .filter(isFormControl)
        .filter((el) => !computeAccessibleName(el).name)
        .map((el) =>
          resultFrom(this, 'error', 'Form control has no accessible name.', {
            element: toRef(el, nextId('ctl')),
          }),
        );
    },
  },
  {
    id: 'label-for-invalid',
    title: 'Label for attribute does not match a control',
    category: 'forms',
    defaultSeverity: 'error',
    wcag: ['1.3.1'],
    whyItMatters: 'A label[for] that points nowhere is not associated with a control.',
    run(context) {
      return Array.from(context.document.querySelectorAll('label[for]'))
        .filter((label) => {
          const id = label.getAttribute('for');
          return !id || !context.document.getElementById(id);
        })
        .map((el) =>
          resultFrom(this, 'error', `label[for] does not match an element id.`, {
            element: toRef(el, nextId('ctl')),
            details: { htmlFor: el.getAttribute('for') },
          }),
        );
    },
  },
  {
    id: 'aria-labelledby-target-missing',
    title: 'aria-labelledby target is missing',
    category: 'forms',
    defaultSeverity: 'error',
    wcag: ['4.1.2', '1.3.1'],
    whyItMatters: 'Broken name references leave the control unnamed.',
    run(context) {
      const results = [];
      for (const el of Array.from(context.document.querySelectorAll('[aria-labelledby]'))) {
        const ids = (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean);
        const missing = ids.filter((id) => !context.document.getElementById(id));
        if (missing.length) {
          results.push(
            resultFrom(this, 'error', `aria-labelledby references missing id(s): ${missing.join(', ')}`, {
              element: toRef(el, nextId('ctl')),
              details: { missing },
            }),
          );
        }
      }
      return results;
    },
  },
  {
    id: 'placeholder-only-label-review',
    title: 'Control appears to rely on placeholder as its only label',
    category: 'forms',
    defaultSeverity: 'warning',
    wcag: ['1.3.1', '2.4.6'],
    whyItMatters:
      'Placeholder text disappears while typing and is a weak substitute for a persistent visible label.',
    suggestedReview: 'Review whether a persistent visible label should be provided.',
    run(context) {
      return context.controls
        .filter((ctl) => ctl.placeholder && ctl.name.source === 'placeholder')
        .map((ctl) =>
          resultFrom(
            this,
            'warning',
            'Form control appears to rely on placeholder text as its only visible label.',
            {
              element: ctl.element,
              details: { accessibleName: ctl.name.name, placeholder: ctl.placeholder },
            },
          ),
        );
    },
  },
  {
    id: 'required-state-mismatch',
    title: 'Required state may be mismatched',
    category: 'forms',
    defaultSeverity: 'review',
    wcag: ['4.1.2'],
    whyItMatters: 'Visual required markers and ARIA required state should agree.',
    run(context) {
      return context.controls
        .filter((ctl) => ctl.required && ctl.ariaRequired === false)
        .map((ctl) =>
          resultFrom(
            this,
            'review',
            'Control has a required attribute but aria-required="false".',
            { element: ctl.element },
          ),
        );
    },
  },
];
