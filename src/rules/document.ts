import type { AccessibilityRule } from '../shared/types';
import { nextId, toRef } from '../engine/selector';
import { resultFrom } from '../engine/result';

export const documentRules: AccessibilityRule[] = [
  {
    id: 'document-title-missing',
    title: 'Document title is missing or empty',
    category: 'document',
    defaultSeverity: 'error',
    wcag: ['2.4.2'],
    whyItMatters: 'The title is the first name users hear when they enter the page or switch tabs.',
    run(context) {
      if (!context.title.trim()) {
        return [resultFrom(this, 'error', 'Document title is missing or empty.')];
      }
      return [];
    },
  },
  {
    id: 'html-lang-missing',
    title: 'html lang is missing',
    category: 'document',
    defaultSeverity: 'error',
    wcag: ['3.1.1'],
    whyItMatters: 'Assistive technologies use lang to choose pronunciation.',
    run(context) {
      if (!context.lang.trim()) {
        return [resultFrom(this, 'error', 'The html element has no lang attribute.')];
      }
      return [];
    },
  },
  {
    id: 'duplicate-id',
    title: 'Duplicate id attributes',
    category: 'document',
    defaultSeverity: 'error',
    wcag: ['4.1.2'],
    whyItMatters: 'Duplicate ids break label associations and ARIA references.',
    run(context) {
      const seen = new Map<string, Element[]>();
      for (const el of Array.from(context.document.querySelectorAll('[id]'))) {
        const id = el.id;
        if (!id) continue;
        const list = seen.get(id) ?? [];
        list.push(el);
        seen.set(id, list);
      }
      const results = [];
      for (const [id, els] of seen) {
        if (els.length < 2) continue;
        for (const el of els) {
          results.push(
            resultFrom(this, 'error', `Duplicate id "${id}" found ${els.length} times.`, {
              element: toRef(el, nextId('id')),
            }),
          );
        }
      }
      return results;
    },
  },
  {
    id: 'skip-link-missing-review',
    title: 'No skip link detected',
    category: 'document',
    defaultSeverity: 'review',
    wcag: ['2.4.1'],
    whyItMatters:
      'A missing skip link is not always a failure — another bypass mechanism may exist.',
    run(context) {
      const links = Array.from(context.document.querySelectorAll('a[href^="#"]'));
      const skip = links.find((a) => /skip/i.test((a.textContent ?? '') + (a.getAttribute('aria-label') ?? '')));
      if (!skip) {
        return [
          resultFrom(
            this,
            'review',
            'No skip link was detected. Review whether another bypass mechanism exists.',
          ),
        ];
      }
      const href = skip.getAttribute('href') ?? '';
      const id = href.slice(1);
      if (id && !context.document.getElementById(id)) {
        return [
          resultFrom(this, 'error', `Skip link target "${href}" does not exist.`, {
            element: toRef(skip, nextId('skip')),
          }),
        ];
      }
      return [];
    },
  },
];
