import type {
  AriaElementInfo,
  AuditContext,
  ControlInfo,
  FocusableElementInfo,
  HeadingInfo,
  ImageInfo,
  LandmarkInfo,
} from '../shared/types';
import { computeAccessibleName } from './accessible-name';
import { isAriaHidden, isVisible, queryFocusable, tabIndexValue } from './focusable';
import { computedRole, headingLevel, implicitRole } from './roles';
import { nextId, resetIds, toRef } from './selector';

const LANDMARK_ROLES = new Set([
  'banner',
  'navigation',
  'main',
  'complementary',
  'contentinfo',
  'search',
  'region',
  'form',
]);

const LANDMARK_SELECTOR = [
  'header',
  'nav',
  'main',
  'aside',
  'footer',
  'form',
  'section',
  '[role="banner"]',
  '[role="navigation"]',
  '[role="main"]',
  '[role="complementary"]',
  '[role="contentinfo"]',
  '[role="search"]',
  '[role="region"]',
  '[role="form"]',
].join(',');

const IMAGE_SELECTOR = 'img, svg, canvas, input[type="image"], [role="img"]';

const CONTROL_SELECTOR =
  'input:not([type="hidden"]), select, textarea, button, [role="button"], [role="textbox"], [role="combobox"], [role="checkbox"], [role="radio"], [role="switch"]';

function queryDeep(root: ParentNode, selector: string): Element[] {
  const out: Element[] = [];
  const visit = (node: ParentNode) => {
    if ('matches' in node && (node as Element).matches?.(selector)) {
      out.push(node as Element);
    }
    if ('querySelectorAll' in node) {
      for (const el of Array.from(node.querySelectorAll(selector))) {
        if (!out.includes(el)) out.push(el);
      }
      for (const el of Array.from(node.querySelectorAll('*'))) {
        if (el.shadowRoot) visit(el.shadowRoot);
      }
    }
  };
  visit(root);
  return out;
}

export function collectAuditContext(document: Document): AuditContext {
  resetIds();
  const url = new URL(document.location?.href || 'http://localhost/');

  const headings: HeadingInfo[] = queryDeep(
    document,
    'h1, h2, h3, h4, h5, h6, [role="heading"]',
  ).map((el) => {
    const id = nextId('h');
    return {
      id,
      level: headingLevel(el) ?? 2,
      name: computeAccessibleName(el).name,
      element: toRef(el, id),
    };
  });

  const landmarks: LandmarkInfo[] = queryDeep(document, LANDMARK_SELECTOR)
    .map((el) => {
      const role = computedRole(el);
      if (!LANDMARK_ROLES.has(role)) return null;
      const id = nextId('lm');
      return {
        id,
        role,
        name: computeAccessibleName(el).name,
        element: toRef(el, id),
      } satisfies LandmarkInfo;
    })
    .filter((n): n is LandmarkInfo => Boolean(n));

  const images: ImageInfo[] = queryDeep(document, IMAGE_SELECTOR).map((el) => {
    const id = nextId('img');
    return {
      id,
      alt: el.hasAttribute('alt') ? (el.getAttribute('alt') ?? '') : null,
      hasAltAttribute: el.hasAttribute('alt'),
      name: computeAccessibleName(el),
      src: el.getAttribute('src') ?? undefined,
      role: el.getAttribute('role'),
      element: toRef(el, id),
    };
  });

  const controls: ControlInfo[] = queryDeep(document, CONTROL_SELECTOR).map((el) => {
    const id = nextId('ctl');
    const input = el instanceof HTMLInputElement ? el : null;
    return {
      id,
      tagName: el.tagName.toLowerCase(),
      type: input?.type,
      role: computedRole(el),
      name: computeAccessibleName(el),
      required: el.hasAttribute('required'),
      ariaRequired:
        el.getAttribute('aria-required') === 'true'
          ? true
          : el.getAttribute('aria-required') === 'false'
            ? false
            : null,
      placeholder: el.getAttribute('placeholder') ?? undefined,
      element: toRef(el, id),
    };
  });

  const focusableElements: FocusableElementInfo[] = queryFocusable(document).map((el) => {
    const id = nextId('f');
    const hasTab = el.hasAttribute('tabindex');
    return {
      id,
      name: computeAccessibleName(el),
      role: computedRole(el),
      tabIndex: tabIndexValue(el),
      implicitTabIndex: !hasTab,
      visible: isVisible(el),
      ariaHidden: isAriaHidden(el),
      element: toRef(el, id),
    };
  });

  const ariaElements: AriaElementInfo[] = queryDeep(document, '[role], [aria-hidden], [aria-labelledby], [aria-describedby], [aria-label]').map(
    (el) => {
      const id = nextId('aria');
      return {
        id,
        role: el.getAttribute('role'),
        implicitRole: implicitRole(el),
        ariaHidden: el.getAttribute('aria-hidden') === 'true',
        labelledBy: el.getAttribute('aria-labelledby') ?? undefined,
        describedBy: el.getAttribute('aria-describedby') ?? undefined,
        element: toRef(el, id),
      };
    },
  );

  return {
    document,
    url,
    title: document.title ?? '',
    lang: document.documentElement.getAttribute('lang') ?? '',
    headings,
    landmarks,
    images,
    controls,
    focusableElements,
    ariaElements,
    now: Date.now(),
  };
}

export function elementMap(context: AuditContext): Map<string, Element> {
  const map = new Map<string, Element>();
  const remember = (id: string, selector: string) => {
    const el = context.document.querySelector(selector);
    if (el) map.set(id, el);
  };
  for (const item of [
    ...context.headings,
    ...context.landmarks,
    ...context.images,
    ...context.controls,
    ...context.focusableElements,
    ...context.ariaElements,
  ]) {
    remember(item.element.id, item.element.selector);
  }
  return map;
}
