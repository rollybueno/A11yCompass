# A11yCompass design

A11yCompass shares SilipSEO’s company visual language: cool backgrounds, white rounded cards, blue actions, system typography, and a left navigation rail. Keep the compass product mark and accessibility review terminology.

## Theme

- Canvas: `#fbfcfe`; inset surfaces: `#f5f7fb`; cards: `#ffffff`.
- Text: `#0f172a`; secondary text: `#606b7c`.
- Borders: `#e4e8ef`; control borders: `#d9e1ec`.
- Accent and focus: `#2563eb`; selected background: `#eef4ff`.
- Primary action: vertical gradient from `#2f77f0` to `#1d63d8`.
- Error: `#c92929`; warning: `#996000`; review: `#2563eb`; passed: `#237c35`.

## Typography and shape

Use SilipSEO’s font stack: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif. Inter is used when available locally; no external font request is needed. Body text, buttons, navigation, and inputs are 16px; product title and section headings are 20px; supporting text and field labels are 14px; selectors and technical metadata are 13px. Monospace is reserved for selectors and code.

Cards have 9–10px corners, buttons 7–8px, and form controls 6px. Surfaces use subtle one-pixel borders. Keep a visible 3px blue keyboard focus outline with a 2px offset and respect reduced-motion preferences.

## Layout and components

The white header contains the product identity and settings. Automated metric cards and a separate manual-review progress line precede a full-width review button. Navigation and findings occupy the remaining viewport with independently scrollable regions.

Match SilipSEO’s 126px navigation rail, narrowing to 105px below 420px and widening to 148px at 560px. Below 320px, navigation wraps above the content to preserve room for findings and zoomed text.

Use rounded finding cards with labeled severity and circular status marks, pale-blue selection, and inline expandable details. Apply the same controls and surfaces to settings, structure, keyboard review, inspector, and exports. The popup shares these tokens. Shadow DOM overlays explicitly use the same blue accent, green structure marks, dark captions, and system font stack.

## Product semantics

Keep automated findings and manual-review completion separate. Preserve keyboard navigation, skip link, live status announcements, and labels. Explain empty and failed states. Show the accessible name and its source in the inspector. Use “Related WCAG”; do not imply compliance or introduce an accessibility score.

The source reference is the sibling SilipSEO extension’s `src/sidepanel/styles.css` and `src/sidepanel/app.ts`. Update this document when the shared brand styling changes.
