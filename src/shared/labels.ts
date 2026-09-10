import type { RuleCategory, Severity } from './types';

export const CATEGORY_LABEL: Record<RuleCategory, string> = {
  images: 'Images',
  forms: 'Forms & Labels',
  links: 'Links & Buttons',
  headings: 'Headings',
  landmarks: 'Landmarks',
  aria: 'ARIA',
  keyboard: 'Keyboard',
  focus: 'Focus',
  contrast: 'Contrast',
  document: 'Document Structure',
  tables: 'Tables',
  media: 'Media',
  motion: 'Motion',
  content: 'Content Review',
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  error: 'Error',
  warning: 'Warning',
  review: 'Review',
  info: 'Info',
  passed: 'Passed',
};

export const SEVERITY_MARK: Record<Severity, string> = {
  error: '✕',
  warning: '⚠',
  review: '◇',
  info: 'i',
  passed: '✓',
};

export const OVERLAY_MODES = [
  { id: 'off', label: 'Overlays off' },
  { id: 'headings', label: 'Headings' },
  { id: 'landmarks', label: 'Landmarks' },
  { id: 'tabstops', label: 'Tab stops' },
  { id: 'images', label: 'Images' },
  { id: 'forms', label: 'Form labels' },
  { id: 'aria', label: 'ARIA roles' },
] as const;
