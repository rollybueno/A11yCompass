const VALID_ROLES = new Set([
  'alert',
  'alertdialog',
  'application',
  'article',
  'banner',
  'blockquote',
  'button',
  'caption',
  'cell',
  'checkbox',
  'code',
  'columnheader',
  'combobox',
  'complementary',
  'contentinfo',
  'definition',
  'deletion',
  'dialog',
  'directory',
  'document',
  'emphasis',
  'feed',
  'figure',
  'form',
  'generic',
  'grid',
  'gridcell',
  'group',
  'heading',
  'img',
  'insertion',
  'link',
  'list',
  'listbox',
  'listitem',
  'log',
  'main',
  'marquee',
  'math',
  'menu',
  'menubar',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'meter',
  'navigation',
  'none',
  'note',
  'option',
  'paragraph',
  'presentation',
  'progressbar',
  'radio',
  'radiogroup',
  'region',
  'row',
  'rowgroup',
  'rowheader',
  'scrollbar',
  'search',
  'searchbox',
  'separator',
  'slider',
  'spinbutton',
  'status',
  'strong',
  'subscript',
  'superscript',
  'switch',
  'tab',
  'table',
  'tablist',
  'tabpanel',
  'term',
  'textbox',
  'time',
  'timer',
  'toolbar',
  'tooltip',
  'tree',
  'treegrid',
  'treeitem',
]);

const IMPLICIT: Record<string, string | ((el: Element) => string | null)> = {
  A: (el) => (el.hasAttribute('href') ? 'link' : null),
  ARTICLE: 'article',
  ASIDE: 'complementary',
  BUTTON: 'button',
  DIALOG: 'dialog',
  FOOTER: (el) => (closestLandmarkScope(el) ? null : 'contentinfo'),
  FORM: (el) => (accessibleNameHint(el) ? 'form' : null),
  H1: 'heading',
  H2: 'heading',
  H3: 'heading',
  H4: 'heading',
  H5: 'heading',
  H6: 'heading',
  HEADER: (el) => (closestLandmarkScope(el) ? null : 'banner'),
  HR: 'separator',
  IMG: 'img',
  INPUT: (el) => {
    const type = (el as HTMLInputElement).type || 'text';
    const map: Record<string, string> = {
      button: 'button',
      checkbox: 'checkbox',
      color: 'textbox',
      date: 'textbox',
      'datetime-local': 'textbox',
      email: 'textbox',
      file: 'button',
      hidden: 'none',
      image: 'button',
      month: 'textbox',
      number: 'spinbutton',
      password: 'textbox',
      radio: 'radio',
      range: 'slider',
      reset: 'button',
      search: 'searchbox',
      submit: 'button',
      tel: 'textbox',
      text: 'textbox',
      time: 'textbox',
      url: 'textbox',
      week: 'textbox',
    };
    return map[type] ?? 'textbox';
  },
  LI: 'listitem',
  MAIN: 'main',
  MATH: 'math',
  MENU: 'list',
  METER: 'meter',
  NAV: 'navigation',
  OL: 'list',
  OPTGROUP: 'group',
  OPTION: 'option',
  OUTPUT: 'status',
  PROGRESS: 'progressbar',
  SECTION: (el) => (accessibleNameHint(el) ? 'region' : null),
  SELECT: (el) => ((el as HTMLSelectElement).multiple ? 'listbox' : 'combobox'),
  SUMMARY: 'button',
  SVG: (el) => (el.getAttribute('role') === 'img' ? 'img' : null),
  TABLE: 'table',
  TBODY: 'rowgroup',
  TD: 'cell',
  TEXTAREA: 'textbox',
  TFOOT: 'rowgroup',
  TH: (el) => (el.getAttribute('scope') === 'row' ? 'rowheader' : 'columnheader'),
  THEAD: 'rowgroup',
  TR: 'row',
  UL: 'list',
};

function accessibleNameHint(el: Element): boolean {
  return Boolean(
    el.getAttribute('aria-label') ||
      el.getAttribute('aria-labelledby') ||
      el.getAttribute('title'),
  );
}

function closestLandmarkScope(el: Element): boolean {
  return Boolean(el.parentElement?.closest('article, aside, main, nav, section'));
}

export function isValidRole(role: string): boolean {
  return VALID_ROLES.has(role);
}

export function implicitRole(el: Element): string | null {
  const entry = IMPLICIT[el.tagName];
  if (!entry) return null;
  if (typeof entry === 'function') return entry(el);
  return entry;
}

export function computedRole(el: Element): string {
  const explicit = el.getAttribute('role')?.trim().split(/\s+/)[0];
  if (explicit) return explicit;
  return implicitRole(el) ?? el.tagName.toLowerCase();
}

export function headingLevel(el: Element): number | null {
  if (/^H[1-6]$/.test(el.tagName)) return Number(el.tagName[1]);
  if (el.getAttribute('role') === 'heading') {
    const level = Number(el.getAttribute('aria-level') || '2');
    return Number.isFinite(level) ? level : 2;
  }
  return null;
}
