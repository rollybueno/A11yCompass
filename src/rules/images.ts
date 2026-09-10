import type { AccessibilityRule, AuditResult } from '../shared/types';
import { nextId, toRef } from '../engine/selector';
import { resultFrom } from '../engine/result';

const GENERIC_ALT = new Set([
  'image',
  'img',
  'photo',
  'picture',
  'graphic',
  'icon',
  'banner',
  'placeholder',
  'untitled',
]);

const FILENAME_ALT = /\.(jpe?g|png|gif|webp|svg|avif|bmp)$/i;
const URL_ALT = /^(https?:)?\/\//i;

function looksLikeFilename(value: string): boolean {
  return FILENAME_ALT.test(value.trim()) || /^img[_-]?\d+/i.test(value.trim());
}

export const imageRules: AccessibilityRule[] = [
  {
    id: 'image-alt-missing',
    title: 'Image missing alt attribute',
    category: 'images',
    defaultSeverity: 'error',
    wcag: ['1.1.1'],
    whyItMatters:
      'Assistive technologies cannot determine whether the image communicates meaningful content.',
    suggestedReview: 'Provide an alt attribute that describes the image purpose, or alt="" if decorative.',
    possibleApproaches: ['Descriptive alt text', 'Empty alt for decorative images'],
    run(context) {
      return context.images
        .filter((img) => img.element.tagName === 'img' && !img.hasAltAttribute)
        .map((img) =>
          resultFrom(this, 'error', 'Image is missing an alt attribute.', { element: img.element }),
        );
    },
  },
  {
    id: 'image-alt-empty-review',
    title: 'Image has empty alt attribute',
    category: 'images',
    defaultSeverity: 'review',
    wcag: ['1.1.1'],
    whyItMatters:
      'Empty alt is correct for decorative images, but conceals the image if it conveys information.',
    suggestedReview: 'Confirm the image is purely decorative.',
    run(context) {
      return context.images
        .filter((img) => img.element.tagName === 'img' && img.hasAltAttribute && img.alt === '')
        .map((img) =>
          resultFrom(
            this,
            'review',
            'This image has an empty alt attribute. Review whether it is purely decorative.',
            { element: img.element },
          ),
        );
    },
  },
  {
    id: 'image-alt-filename',
    title: 'Image alt looks like a filename or URL',
    category: 'images',
    defaultSeverity: 'review',
    wcag: ['1.1.1'],
    whyItMatters:
      'The tool can confirm alt text exists, but cannot determine whether it describes the image purpose.',
    suggestedReview: 'Replace filename-like alt text with a short description of the image purpose.',
    run(context) {
      const results: AuditResult[] = [];
      for (const img of context.images) {
        if (img.element.tagName !== 'img' || !img.alt) continue;
        const alt = img.alt.trim();
        if (looksLikeFilename(alt) || URL_ALT.test(alt)) {
          results.push(
            resultFrom(this, 'review', `Image alt text looks like a filename or URL: "${alt}"`, {
              element: img.element,
              details: { alt },
            }),
          );
        }
      }
      return results;
    },
  },
  {
    id: 'image-alt-generic-review',
    title: 'Image alt text is generic',
    category: 'images',
    defaultSeverity: 'review',
    wcag: ['1.1.1'],
    whyItMatters: 'Generic words like "image" or "photo" usually do not describe purpose.',
    run(context) {
      return context.images
        .filter((img) => img.alt && GENERIC_ALT.has(img.alt.trim().toLowerCase()))
        .map((img) =>
          resultFrom(this, 'review', `Image alt text is generic: "${img.alt}"`, {
            element: img.element,
            details: { alt: img.alt },
          }),
        );
    },
  },
  {
    id: 'image-role-img-name-missing',
    title: 'role="img" is missing an accessible name',
    category: 'images',
    defaultSeverity: 'error',
    wcag: ['1.1.1', '4.1.2'],
    whyItMatters: 'Elements with role="img" need an accessible name to replace missing alt semantics.',
    run(context) {
      const results: AuditResult[] = [];
      const nodes = Array.from(context.document.querySelectorAll('[role="img"]'));
      for (const el of nodes) {
        if (el.tagName === 'IMG') continue;
        const img = context.images.find((i) => i.element.selector === toRef(el).selector);
        const name = img?.name.name ?? '';
        if (!name) {
          const id = nextId('img');
          results.push(
            resultFrom(this, 'error', 'Element with role="img" has no accessible name.', {
              element: toRef(el, id),
            }),
          );
        }
      }
      return results;
    },
  },
  {
    id: 'input-image-alt-missing',
    title: 'Image button is missing alt text',
    category: 'images',
    defaultSeverity: 'error',
    wcag: ['1.1.1', '4.1.2'],
    whyItMatters: 'input type="image" uses alt as its accessible name.',
    run(context) {
      return Array.from(context.document.querySelectorAll('input[type="image"]'))
        .filter((el) => !el.getAttribute('alt')?.trim())
        .map((el) =>
          resultFrom(this, 'error', 'Image input is missing alt text.', {
            element: toRef(el, nextId('img')),
          }),
        );
    },
  },
  {
    id: 'svg-accessible-name-missing',
    title: 'SVG has no accessible name',
    category: 'images',
    defaultSeverity: 'review',
    wcag: ['1.1.1'],
    whyItMatters:
      'Meaningful SVG graphics need a name. Decorative SVGs should be hidden from assistive technology.',
    run(context) {
      return context.images
        .filter((img) => img.element.tagName === 'svg' && !img.name.name && img.role !== 'presentation')
        .map((img) =>
          resultFrom(
            this,
            'review',
            'SVG has no accessible name. Review whether it is decorative or needs a description.',
            { element: img.element },
          ),
        );
    },
  },
];
