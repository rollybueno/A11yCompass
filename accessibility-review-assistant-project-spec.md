# Accessibility Review Assistant

**Working title:** Accessibility Review Assistant  
**Tagline:** Guided accessibility review for the web  
**Category:** Developer Tools  
**Primary platform:** Chrome / Manifest V3  
**Future platform:** Firefox / WebExtensions  
**Recommended stack:** TypeScript, React, Vite, Vitest, Playwright  
**Recommended license:** MIT

## Product Summary

Accessibility Review Assistant is an open-source browser extension for developers, designers, QA engineers, content teams, and accessibility reviewers.

Its purpose is not to act like another generic scanner that produces a pass/fail score. Instead, it combines reliable automated checks with guided human review, DOM inspection, visual overlays, keyboard testing, focus analysis, contrast inspection, and exportable reports.

The extension should make a clear distinction between:

- issues that can be detected confidently;
- suspicious patterns that deserve review;
- accessibility questions that require human judgment.

The core principle is:

> Automate what can be checked reliably, guide people through what still needs human review, and make every issue easy to inspect directly on the page.

---

# 1. Main Product Goals

The extension should help a reviewer:

1. Scan the current page for common accessibility problems.
2. Understand why each problem matters.
3. Locate the exact DOM element causing the issue.
4. Inspect the element's role, accessible name, description, focusability, ARIA, and related properties.
5. Review page structure such as headings and landmarks.
6. Test keyboard navigation in a guided workflow.
7. Review focus visibility and focus order.
8. Inspect text contrast.
9. Complete manual accessibility review checklists.
10. Export findings as Markdown, JSON, or CSV.

The extension should **not** claim that a page is fully accessible simply because its automated checks pass.

---

# 2. Target Users

Primary users:

- Frontend developers
- Web developers
- QA engineers
- Accessibility specialists
- Designers
- Content editors
- Technical SEO teams
- Agencies
- Open-source maintainers

It should remain framework-independent and work with rendered webpages built using:

- WordPress
- WooCommerce
- React
- Next.js
- Vue
- Nuxt
- Svelte
- Drupal
- Shopify
- Magento
- Laravel
- Webflow
- Static HTML
- Custom web applications

---

# 3. Core Workflow

```text
Open webpage
    ↓
Open Accessibility Review Assistant
    ↓
Start review
    ↓
Automated rules run
    ↓
Issues are grouped by severity and category
    ↓
Reviewer opens an issue
    ↓
Affected DOM element is highlighted
    ↓
Assistant explains the problem and relevant standard
    ↓
Reviewer completes manual checks
    ↓
Export report
```

Example summary:

```text
Accessibility Review

Automated checks
────────────────────
Errors       6
Warnings     9
Review      14
Passed      31

Manual review
────────────────────
Keyboard      4 / 7 complete
Focus         2 / 5 complete
Content       1 / 4 complete
```

Automated checks and manual-review progress should always remain visually separate.

---

# 4. Why "Review Assistant" Instead of "Scanner"

Some accessibility problems are straightforward to detect automatically:

```text
<img> without alt
button without accessible name
input without accessible name
invalid ARIA role
broken aria-labelledby reference
positive tabindex
duplicate IDs
empty heading
```

Other issues require context and human judgment:

```text
Is the alt text actually useful?
Is the heading hierarchy understandable?
Is focus order logical?
Is the visible focus indicator clear?
Is keyboard interaction intuitive?
Does a modal restore focus correctly?
Is link text meaningful in context?
Are landmark labels understandable?
Does the page remain usable when zoomed?
```

The extension should communicate this uncertainty explicitly.

Example:

```text
Review required

Image alt text:
"product"

The tool can confirm that alt text exists,
but cannot determine whether it adequately
describes this image's purpose in context.

[Locate element]
[Mark reviewed]
```

Never report this as:

```text
✓ Image accessible
```

---

# 5. Main Audit Categories

Suggested categories:

```text
Images
Forms & Labels
Links & Buttons
Headings
Landmarks
ARIA
Keyboard
Focus
Contrast
Document Structure
Tables
Media
Motion
Content Review
```

V1 should prioritize checks that can be implemented reliably in the browser.

---

# 6. Image Accessibility

Inspect:

```html
<img>
<svg>
<canvas>
<input type="image">
[role="img"]
```

Suggested rules:

```text
image-alt-missing
image-alt-filename
image-alt-url
image-alt-generic-review
image-alt-long-review
image-role-img-name-missing
input-image-alt-missing
svg-accessible-name-missing
```

Example:

```html
<img src="/images/team.jpg">
```

Result:

```text
Error

Image is missing an alt attribute.

Element:
<img src="/images/team.jpg">

Why this matters:
Assistive technologies cannot determine
whether the image communicates meaningful content.

[Locate element]
```

## Decorative images

This is valid in some situations:

```html
<img src="divider.svg" alt="">
```

Therefore an empty `alt` should not automatically be treated as a failure.

Result:

```text
Review

This image has an empty alt attribute.

This may be correct if the image is purely
decorative. Review whether the image conveys
information users need.

[Locate element]
[Decorative]
[Needs description]
```

## Alt-text quality heuristics

Flag suspicious values such as:

```text
alt="image"
alt="photo"
alt="IMG_5842.jpg"
alt="banner.jpg"
alt="click here"
alt="https://example.com/image.jpg"
```

Possible heuristics:

```text
looks like filename
looks like URL
generic single word
duplicates adjacent caption
unusually long
same alt reused across unrelated images
```

These should normally be **Review** findings rather than definitive errors.

---

# 7. Forms and Labels

Inspect:

```html
input
select
textarea
button
label
fieldset
legend
```

The scanner should reason about the **accessible name**, not just whether a `<label>` exists.

Valid patterns can include:

```html
<label for="email">Email</label>
<input id="email">
```

```html
<input aria-label="Email">
```

```html
<span id="email-label">Email</span>
<input aria-labelledby="email-label">
```

Suggested rules:

```text
form-control-name-missing
label-for-invalid
aria-labelledby-target-missing
fieldset-legend-missing-review
duplicate-form-label-review
placeholder-only-label-review
required-state-mismatch
invalid-aria-describedby
```

Example:

```html
<input type="email" placeholder="Email address">
```

Result:

```text
Warning

Form control appears to rely on placeholder
text as its only visible label.

Accessible name:
Email address

Placeholder:
Email address

Review whether a persistent visible label
should be provided.

[Locate element]
```

---

# 8. Accessible Name Inspector

This should be one of the extension's flagship developer features.

When an element is selected:

```text
Accessibility Inspector

Element
<button class="cart-icon">

Role
button

Accessible name
"Shopping cart"

Name source
aria-label

Description
None

Focusable
Yes

Tab index
0

ARIA
aria-label="Shopping cart"
```

For:

```html
<button aria-labelledby="cart-label">
    <svg>...</svg>
</button>

<span id="cart-label">View cart</span>
```

show:

```text
Accessible name
"View cart"

Name source
aria-labelledby → #cart-label
```

The tool should help developers understand *how* the name was derived rather than only showing a pass/fail result.

---

# 9. Links and Buttons

Inspect:

```html
<a>
<button>
[role="button"]
[role="link"]
```

Suggested rules:

```text
button-name-missing
link-name-missing
empty-link
icon-button-name-review
generic-link-text-review
```

Example:

```html
<button>
    <svg>...</svg>
</button>
```

Result:

```text
Error

Button has no accessible name.

Role:
button

Accessible name:
None

[Locate element]
```

Weak link text such as:

```text
Click here
Read more
More
Learn more
Here
Details
```

should usually become a review item, because surrounding context or an accessible name may make it understandable.

---

# 10. Heading Hierarchy

Inspect:

```html
<h1> through <h6>
[role="heading"]
aria-level
```

Build an outline:

```text
H1  Accessibility Guide
│
├── H2  Introduction
│
├── H2  Keyboard
│   ├── H3  Tab Navigation
│   └── H3  Focus
│
└── H2  Forms
```

Potential anomaly:

```text
H1  Accessibility Guide
└── H3  Keyboard Navigation
```

Result:

```text
Review

Heading level jumps from H1 to H3.

Review whether this accurately represents
the document hierarchy.

[Locate H3]
```

A dedicated heading view could show:

```text
H1 Product Documentation
   H2 Getting Started
      H3 Installation
      H3 Configuration
   H2 Features
      H4 Export        ⚠
   H2 Support
```

Clicking any entry should highlight it on the page.

---

# 11. Landmark Inspection

Inspect native landmarks:

```html
<header>
<nav>
<main>
<aside>
<footer>
```

and ARIA landmark roles:

```text
banner
navigation
main
complementary
contentinfo
search
region
form
```

Example:

```text
Landmarks

banner
navigation "Primary"
main
complementary "Related content"
navigation "Footer"
contentinfo
```

Suggested rules:

```text
main-landmark-missing
multiple-main-landmarks
duplicate-landmark-name
navigation-name-missing-review
region-name-missing
landmark-nesting-review
```

## Landmark overlay

Provide a "Show landmarks" mode:

```text
┌─────────────────────────────────┐
│ BANNER                          │
├─────────────────────────────────┤
│ NAVIGATION — Primary            │
├─────────────────────────────────┤
│ MAIN                            │
├──────────────────────┬──────────┤
│                      │ ASIDE    │
├──────────────────────┴──────────┤
│ CONTENTINFO                     │
└─────────────────────────────────┘
```

This makes otherwise invisible semantic structure visually understandable.

---

# 12. ARIA Review

Suggested rules:

```text
aria-attribute-invalid
aria-role-invalid
aria-property-not-allowed
aria-labelledby-target-missing
aria-describedby-target-missing
aria-hidden-focusable
aria-required-children-missing
aria-required-parent-missing
redundant-role
interactive-role-keyboard-review
aria-expanded-target-review
```

Example:

```html
<button role="button">
```

Result:

```text
Info

Redundant ARIA role.

<button> already has an implicit button role.

Found:
role="button"

Prefer native HTML semantics where possible.
```

More important example:

```html
<div role="button">
    Save
</div>
```

Result:

```text
Review

Custom button detected.

Role:
button

Native element:
div

Focusable:
No

Keyboard interaction:
No obvious keyboard support detected.

This control may not be keyboard operable.

[Locate element]
```

Custom ARIA widgets need explicit keyboard behavior; adding an ARIA role alone does not provide the browser behavior of a native HTML control.

---

# 13. aria-hidden and Focusable Content

Example:

```html
<div aria-hidden="true">
    <button>Subscribe</button>
</div>
```

Result:

```text
Error

Focusable content exists inside an
aria-hidden container.

Element:
<button>Subscribe</button>

Ancestor:
<div aria-hidden="true">

Keyboard users may reach content that is
hidden from assistive technologies.

[Locate element]
```

---

# 14. Keyboard Review Mode

Keyboard testing should be a guided review rather than a fake automated certification.

Example start screen:

```text
Keyboard Review

Navigate this page using only the keyboard.

The extension will observe:
- focus sequence
- focused elements
- suspicious focus jumps
- possible keyboard traps
- invisible focus indicators
- custom controls skipped by Tab
```

As the reviewer uses `Tab`:

```text
Keyboard path

1 ✓ Skip to content
2 ✓ Home
3 ✓ Products
4 ⚠ Menu trigger
5 ✓ Search
6 ✓ Login
```

Potential findings:

```text
Positive tabindex changes natural order
Focus moved unexpectedly
Possible keyboard trap
Hidden element received focus
No obvious focus indicator detected
Custom interactive element is not focusable
```

---

# 15. Focus Order

Record the observed sequence:

```text
Focus Order

1  Skip to content
2  Logo
3  Navigation
4  Search
5  Main CTA
6  Footer link   ⚠
7  Hero button   ⚠
```

If order appears inconsistent with DOM or visual order:

```text
Review

Focus order may differ significantly
from the page structure.

Confirm whether keyboard navigation follows
a logical reading and interaction order.
```

This should be a human-review result.

---

# 16. tabindex Review

Suggested rules:

```text
positive-tabindex
negative-tabindex-review
tabindex-noninteractive-review
hidden-focusable
disabled-focus-review
```

Example:

```html
<button tabindex="5">
```

Result:

```text
Warning

Positive tabindex detected.

Found:
tabindex="5"

Positive tabindex values can create
unexpected keyboard navigation order.

[Locate element]
```

---

# 17. Possible Keyboard Trap Detection

True keyboard-trap detection is contextual.

Use assisted heuristics such as:

```text
Focus remained inside the same container
for 15 consecutive Tab / Shift+Tab actions.
```

Result:

```text
Review

Possible keyboard focus trap.

Container:
.modal-dialog

17 consecutive focus movements remained
inside this component.

This may be expected for an open modal.
Confirm that the component can be dismissed
and focus is restored appropriately.
```

The wording matters because intentional focus containment in a modal can be correct.

---

# 18. Focus Visibility Review

Observe the active element and compare relevant computed styles such as:

```text
outline
outline-width
outline-style
outline-color
box-shadow
border
background
```

Potential finding:

```text
Review

No obvious visual style change was detected
when this element received keyboard focus.

Element:
<a class="nav-link">

Review whether keyboard users can clearly
identify the current focus position.

[Locate element]
```

Because focus appearance can be implemented in complex ways, this should remain a heuristic.

## Manual focus review

Provide:

```text
Focus Review

Tab through the page.

For each focused element:

[Clearly visible]
[Hard to see]
[Not visible]
[Skip]
```

Summary:

```text
23 elements reviewed

19  Clear
3   Hard to see
1   Not visible
```

---

# 19. Contrast Review

Inspect foreground and background colors.

Example:

```text
Contrast

Text:
#777777

Background:
#FFFFFF

Ratio:
4.48:1

Font:
16px / 400

Required:
4.5:1

Result:
Fail
```

The implementation should account for:

```text
font size
font weight
opacity
ancestor opacity
background colors
gradients
background images
overlays
```

If the computed background is too complex:

```text
Review

Background image or gradient detected.

Automatic contrast calculation may not
represent every point behind this text.

Review manually.
```

## Contrast inspector

User clicks an element:

```text
Foreground
#6B7280

Background
#FFFFFF

Contrast
4.83:1

Normal text
✓ Pass

Large text
✓ Pass
```

---

# 20. Skip Links

Potential checks:

```text
skip-link-missing-review
skip-link-target-invalid
skip-link-not-focusable
skip-link-hidden-on-focus
```

For:

```html
<a href="#main-content" class="skip-link">
    Skip to content
</a>
```

validate that:

```text
#main-content exists
link receives focus
target is meaningful
```

A missing skip link should normally be a review item because another equivalent bypass mechanism may exist.

---

# 21. Document Structure

Suggested checks:

```text
document-title-missing
document-title-empty
html-lang-missing
duplicate-id
main-landmark-missing
heading-empty
heading-order-review
```

Example:

```text
Document

✓ Title
✓ Language
✓ Main landmark
⚠ Heading level jump
✕ 3 duplicate IDs
```

---

# 22. Tables

Inspect:

```html
<table>
<caption>
<th>
<td>
scope
headers
```

Potential rules:

```text
table-caption-missing-review
table-header-missing
table-header-association-review
layout-table-review
complex-table-review
```

Example:

```text
Review

Data table does not contain a caption.

Rows:
18

Columns:
5

Headers:
Detected

Review whether the table needs a caption
to explain its purpose.
```

---

# 23. Media

Potential checks:

```text
video-captions-review
audio-transcript-review
autoplay-audio-review
media-controls-review
```

Example:

```text
Review

Video element detected.

Caption tracks:
1

Language:
en

The extension can confirm that a track exists,
but cannot determine whether captions are
accurate or synchronized.

[Mark reviewed]
```

---

# 24. Motion and Animation

Potential review checks:

```text
autoplay-animation-review
prefers-reduced-motion-review
flashing-content-review
carousel-autoplay-review
```

Possible information:

```text
Animations detected:
12

prefers-reduced-motion media query:
Detected
```

Do not claim a page passes reduced-motion requirements merely because a media query exists.

---

# 25. Issue Detail Design

Each issue should use a consistent format.

Example:

```text
Missing accessible name

Severity
Error

Category
Forms & Controls

Rule
button-name-missing

Element
<button class="search-toggle">
    <svg>...</svg>
</button>

Accessible role
button

Accessible name
None

Why this matters
Screen reader users may hear only "button"
without knowing what the control does.

Suggested review
Provide an accessible name describing
the control's purpose.

Possible approaches
- Visible text
- aria-label
- aria-labelledby

[Locate element]
[Copy selector]
[Copy issue]
```

---

# 26. Avoid One-Click Accessibility Fixes

The extension should not automatically apply changes such as:

```text
Fix all missing ARIA labels
```

Blindly generating:

```html
aria-label="Button"
```

can make accessibility worse.

Instead, provide:

```text
Suggested approaches
```

and explain appropriate native HTML or ARIA techniques.

---

# 27. DOM Element Highlighting

Every element-related issue should support:

```text
Locate element
```

The extension should:

- scroll the element into view;
- draw a temporary outline;
- display rule and severity;
- avoid permanent page modifications;
- restore the original state afterward.

Example overlay:

```text
┌─────────────────────────────────┐
│ button.search-toggle            │
│ Missing accessible name         │
└─────────────────────────────────┘
```

---

# 28. Page Overlay Modes

Suggested overlays:

```text
Issues
Headings
Landmarks
Focus order
Tab stops
Images
Form labels
ARIA roles
```

Examples:

```text
[H1] Accessibility Testing
[H2] Automated Checks
[H2] Manual Testing
[H3] Keyboard
```

```text
[1] Logo
[2] Products
[3] Search
[4] Login
```

```text
[BANNER]
[NAVIGATION]
[MAIN]
[CONTENTINFO]
```

These visual modes are also excellent for portfolio screenshots and demos.

---

# 29. Side Panel UI

A browser side panel is a better primary interface than a tiny popup.

Example:

```text
┌──────────────────────────────────┐
│ Accessibility Review        ⚙    │
├──────────────────────────────────┤
│ Errors                        6  │
│ Warnings                      9  │
│ Review                       14  │
│ Passed                       31  │
├──────────────────────────────────┤
│ Overview | Issues | Structure    │
│ Keyboard | Inspector             │
├──────────────────────────────────┤
│ ✕ Button has no name             │
│   button.search-toggle           │
│                                  │
│ ⚠ Heading level jump             │
│   H2 → H4                        │
│                                  │
│ ◇ Review image alt               │
│   "product image"                │
└──────────────────────────────────┘
```

---

# 30. Main Views

## Overview

```text
Page summary
Issue counts
Manual-review progress
Quick actions
```

## Issues

Filters:

```text
All
Errors
Warnings
Review
Passed
```

Categories:

```text
Images
Forms
ARIA
Keyboard
Structure
Contrast
```

## Structure

```text
Headings
Landmarks
Page regions
```

## Keyboard

```text
Tab sequence
Focus visibility
Possible traps
Manual checklist
```

## Inspector

```text
role
accessible name
description
focusability
tabindex
ARIA
semantic element
contrast
```

---

# 31. Inspector Mode

User activates:

```text
Inspect element
```

Then selects any page element.

Example:

```text
Element

<button class="menu-toggle">

Role
button

Name
"Menu"

Name source
aria-label

Description
None

Focusable
Yes

tabindex
implicit

ARIA
aria-label="Menu"
aria-expanded="false"
aria-controls="main-menu"

Potential issues
None detected
```

This gives the project a specialized accessibility DevTools feel.

---

# 32. Guided Manual Review

Example keyboard checklist:

```text
Keyboard Review

□ All functionality is reachable by keyboard
□ Focus order is logical
□ Focus is clearly visible
□ No unexpected keyboard traps
□ Escape closes dismissible overlays
□ Dialog focus is contained appropriately
□ Focus returns after dialog closes
```

Each item can be:

```text
Pass
Fail
Not applicable
Not reviewed
```

Optional reviewer notes should be supported.

Potential manual-review categories:

```text
Keyboard
Focus
Images
Forms
Content
Navigation
Modals
Media
Zoom/Reflow
Motion
```

---

# 33. Review Status Model

```text
not-reviewed
pass
fail
not-applicable
```

Example note:

```text
Focus disappears on the search button
when navigating with the keyboard.
```

Notes should be included in exported reports.

---

# 34. Severity Model

## Error

High-confidence automated failure.

Examples:

```text
Button has no accessible name
Image has no alt attribute
Invalid ARIA role
Broken aria-labelledby reference
```

## Warning

Likely accessibility problem.

Examples:

```text
Positive tabindex
Generic link text
Missing main landmark
```

## Review

Needs human judgment.

Examples:

```text
Alt-text quality
Heading hierarchy
Focus visibility
Modal behavior
Keyboard interaction
```

## Info

Useful contextual information.

Example:

```text
22 focusable elements detected
```

## Passed

A specific automated condition passed.

---

# 35. Avoid a Misleading Accessibility Score

Do not make this the main product metric:

```text
Accessibility: 92/100
```

It can imply a level of certainty automation does not provide.

Prefer:

```text
Review Status

Automated checks
31 passed
6 errors
9 warnings

Manual review
11 / 23 completed
```

If a score is eventually added, name it something narrow like:

```text
Automated Check Score
```

Never call it:

```text
WCAG Compliance Score
```

---

# 36. WCAG Mapping

Rules can show related WCAG criteria.

Example:

```text
Rule
button-name-missing

Related WCAG
4.1.2 Name, Role, Value
```

Contrast example:

```text
Rule
text-contrast-insufficient

Related WCAG
1.4.3 Contrast (Minimum)
```

Use wording such as:

```text
Related WCAG criteria
```

rather than implying the tool alone can determine complete WCAG conformance.

Primary standards and guidance:

- WCAG 2.2
- WAI-ARIA
- ARIA Authoring Practices Guide
- Native HTML accessibility semantics

---

# 37. Rule Engine

Use individual rule modules.

```ts
export interface AccessibilityRule {
    id: string;
    title: string;
    category: RuleCategory;
    defaultSeverity: Severity;
    wcag?: string[];

    run(
        context: AuditContext
    ): Promise<AuditResult[]>;
}
```

Example:

```ts
export const imageAltMissingRule: AccessibilityRule = {
    id: 'image-alt-missing',
    title: 'Image missing alt attribute',
    category: 'images',
    defaultSeverity: 'error',
    wcag: ['1.1.1'],

    async run(context) {
        const images = [
            ...context.document.querySelectorAll('img')
        ];

        return images
            .filter((image) => !image.hasAttribute('alt'))
            .map((image) => ({
                passed: false,
                element: image,
                message: 'Image is missing an alt attribute.'
            }));
    }
};
```

---

# 38. Audit Context

Build a reusable context rather than repeatedly walking the DOM.

```ts
interface AuditContext {
    document: Document;
    url: URL;
    headings: HeadingInfo[];
    landmarks: LandmarkInfo[];
    images: ImageInfo[];
    controls: ControlInfo[];
    focusableElements: FocusableElementInfo[];
    ariaElements: AriaElementInfo[];
}
```

---

# 39. Result Model

```ts
interface AuditResult {
    id: string;
    ruleId: string;
    status:
        | 'error'
        | 'warning'
        | 'review'
        | 'info'
        | 'passed';

    message: string;
    element?: ElementReference;
    wcag?: string[];
    details?: Record<string, unknown>;
}
```

---

# 40. Element References

Do not try to persist actual DOM nodes outside the content-script context.

Use references:

```ts
interface ElementReference {
    selector: string;
    tagName: string;
    text?: string;
    xpath?: string;
}
```

Prefer stable selectors such as:

```text
#search-toggle
```

over unnecessarily long selectors.

---

# 41. Suggested Rule IDs

```text
image-alt-missing
image-alt-filename
button-name-missing
link-name-missing
form-control-name-missing
heading-empty
heading-level-jump
main-landmark-missing
aria-hidden-focusable
aria-role-invalid
aria-labelledby-target-missing
positive-tabindex
possible-focus-trap
focus-visible-review
text-contrast-insufficient
duplicate-id
```

These IDs can later have dedicated documentation:

```text
/docs/rules/button-name-missing
```

---

# 42. Architecture

```text
Accessibility Review Assistant
│
├── Browser UI
│   ├── popup
│   └── side panel
│
├── Content Script
│   ├── DOM collector
│   ├── accessibility collector
│   ├── focus observer
│   ├── keyboard observer
│   └── overlay renderer
│
├── Audit Engine
│   └── Rules
│       ├── images
│       ├── forms
│       ├── headings
│       ├── landmarks
│       ├── aria
│       ├── keyboard
│       ├── focus
│       ├── contrast
│       ├── links
│       ├── tables
│       └── document
│
├── Inspector
│   ├── role
│   ├── name
│   ├── description
│   ├── focusability
│   └── styles
│
├── Manual Review Engine
│   ├── checklists
│   ├── status
│   └── notes
│
├── Report Engine
│   ├── Markdown
│   ├── JSON
│   └── CSV
│
└── Storage
    ├── settings
    └── reviews
```

---

# 43. Suggested Repository Structure

```text
accessibility-review/
├── .github/
│   ├── workflows/
│   └── ISSUE_TEMPLATE/
├── src/
│   ├── background/
│   ├── content/
│   │   ├── scanner/
│   │   ├── overlays/
│   │   ├── keyboard/
│   │   └── focus/
│   ├── sidepanel/
│   ├── popup/
│   ├── inspector/
│   ├── rules/
│   │   ├── aria/
│   │   ├── forms/
│   │   ├── headings/
│   │   ├── images/
│   │   ├── keyboard/
│   │   ├── landmarks/
│   │   ├── links/
│   │   ├── contrast/
│   │   └── document/
│   ├── review/
│   ├── reporters/
│   ├── storage/
│   ├── types/
│   └── utils/
├── tests/
│   ├── fixtures/
│   ├── rules/
│   └── e2e/
├── public/
├── manifest.json
├── package.json
├── README.md
├── CONTRIBUTING.md
├── PRIVACY.md
├── LICENSE
└── CHANGELOG.md
```

The final repo name should be chosen after branding research.

---

# 44. Technology Stack

Recommended:

```text
TypeScript
React
Vite
Manifest V3
WebExtensions APIs
Vitest
Playwright
ESLint
Prettier
```

An existing accessibility library such as `axe-core` could potentially be used for selected checks, but the project should not become merely an alternate UI around another scanner.

The portfolio value should come from the original workflow:

```text
rule engine
manual review system
element inspector
keyboard review
focus analysis
visual overlays
report generation
local-first architecture
```

---

# 45. Browser Permissions

Aim for minimal permissions.

Possible V1:

```json
{
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "sidePanel"
  ]
}
```

The reviewer explicitly launches the extension against the current page.

Avoid broad permissions such as:

```json
{
  "host_permissions": [
    "<all_urls>"
  ]
}
```

unless a future site-wide feature genuinely requires them.

---

# 46. Privacy

A strong product feature:

> **Accessibility reviews happen locally in your browser.**

V1 should ideally require:

```text
No account
No cloud backend
No browsing-history collection
No page-content upload
No required analytics
```

Suggested privacy statement:

```text
The extension analyzes only the webpage you
choose to review.

Page content and accessibility findings are
processed locally and are not sent to a remote server.

Reports remain on your device unless you
explicitly export or copy them.
```

---

# 47. Local Storage

Store only:

```text
extension settings
rule preferences
manual-review progress
local reports/history
```

Example:

```ts
interface AccessibilityReviewSettings {
    includePassedRules: boolean;
    showWcagReferences: boolean;
    highlightOnSelection: boolean;
    runContrastChecks: boolean;
    enableKeyboardObserver: boolean;
}
```

---

# 48. Report Export

Core formats:

```text
Markdown
JSON
CSV
Copy to clipboard
```

Markdown should be first-class because it can be pasted into:

```text
GitHub
GitLab
Jira
Linear
Slack
Pull requests
Issue trackers
```

Example:

```markdown
# Accessibility Review

URL: https://example.com/checkout/

## Summary

- Errors: 6
- Warnings: 9
- Review: 14
- Passed: 31
- Manual review: 12 / 23 completed

## Errors

### Button has no accessible name

Rule: `button-name-missing`

Related WCAG:
- 4.1.2 Name, Role, Value

### Image missing alt attribute

Rule: `image-alt-missing`

## Manual Review

### Keyboard

- [x] Primary navigation reachable
- [x] Focus order logical
- [ ] Search button has visible focus
- [x] No unexpected keyboard trap

Reviewer note:

Search icon receives focus but no visible
focus indicator is displayed.
```

---

# 49. Testing Strategy

False positives will damage trust, so testing needs to be strong.

## Unit tests

Each rule gets fixtures:

```text
image-alt-missing

✓ img without alt → error
✓ img alt="" → not missing-alt error
✓ img alt="Team photo" → pass
```

## DOM fixture tests

Create pages with:

```text
forms
landmarks
ARIA widgets
headings
tables
modals
images
focus scenarios
contrast cases
```

## End-to-end tests

Using Playwright:

```text
load fixture page
run extension
scan page
verify result
click Locate
verify overlay
```

---

# 50. Accessibility of the Extension Itself

This is non-negotiable.

The extension UI itself should be:

```text
keyboard operable
screen-reader friendly
high contrast
properly labelled
logically structured
focus visible
usable at zoom
reduced-motion friendly
```

This provides an excellent portfolio story:

> The accessibility review tool is itself built and tested accessibly.

Manual testing should include real assistive technologies where possible, such as:

```text
NVDA
VoiceOver
Orca
```

Automated testing should never replace actual assistive-technology testing.

---

# 51. MVP Scope

A strong V1 could include roughly 20–25 automated rules plus manual-review workflows.

## Images

```text
✓ missing alt
✓ suspicious filename alt
✓ role=img missing accessible name
```

## Forms

```text
✓ control missing accessible name
✓ broken label association
✓ invalid aria-labelledby
✓ placeholder-only review
```

## Interactive Controls

```text
✓ button missing name
✓ link missing name
✓ empty link
```

## Structure

```text
✓ document title
✓ html lang
✓ empty heading
✓ heading hierarchy review
✓ main landmark
✓ landmark labels
```

## ARIA

```text
✓ invalid role
✓ invalid ARIA reference
✓ aria-hidden focusable
✓ redundant native role
```

## Keyboard / Focus

```text
✓ positive tabindex
✓ hidden focusable
✓ keyboard review mode
✓ focus visibility review
```

## Contrast

```text
✓ straightforward text contrast
✓ manual review for complex backgrounds
```

## Reporting

```text
✓ Markdown
✓ JSON
```

## Developer UX

```text
✓ Locate element
✓ Copy selector
✓ Accessibility Inspector
```

---

# 52. V1.1

Potential additions:

```text
CSV export
review history
custom rule toggles
dark mode
keyboard shortcuts
improved contrast detection
better selector generation
more WCAG references
```

---

# 53. V1.5

Add:

```text
keyboard review sessions
focus sequence recording
focus visibility ratings
modal review
image review
form review
```

Add overlay modes:

```text
headings
landmarks
tab order
ARIA roles
form labels
```

---

# 54. V2

Introduce **Review Sessions**.

Example:

```text
New Review

Project:
Checkout flow

Pages:
/
 /cart/
 /checkout/
 /order-confirmation/

Target:
WCAG 2.2 AA
```

Result:

```text
Checkout Review

Pages reviewed
3 / 4

Automated issues
18

Manual failures
4

Needs review
9
```

This creates a lightweight accessibility QA workflow without requiring a cloud platform.

---

# 55. V2 Component Review

Allow:

```text
Review this component
```

Examples:

```text
navigation menu
modal
accordion
tabs
carousel
form
date picker
```

Then provide component-specific review guidance.

Example:

```text
Dialog Review

Automated
✓ role="dialog"
✓ accessible name
✓ aria-modal="true"

Manual
□ Focus moves into dialog
□ Tab remains inside while open
□ Escape closes dialog
□ Focus returns to trigger
```

This would significantly differentiate the product from ordinary accessibility scanners.

---

# 56. V3 Possibility

Split the architecture:

```text
@project/core
@project/rules
@project/browser
@project/cli
```

Then support:

```bash
npx accessibility-review audit https://example.com/
```

Possible output:

```text
Accessibility Review

6 errors
8 warnings
11 manual-review items

✕ button-name-missing
✕ image-alt-missing
⚠ positive-tabindex
◇ review heading hierarchy

Automated checks cannot determine complete
accessibility conformance.
```

A future CI integration could fail only on high-confidence automated errors.

---

# 57. What Not to Put in V1

Avoid:

```text
AI-generated alt text
automatic ARIA fixes
full WCAG certification
cloud accounts
team dashboards
enterprise reports
GitHub OAuth
Jira integration
CI/CD
whole-site crawling
PDF accessibility testing
native mobile testing
screen-reader simulation
automated legal-compliance claims
```

These increase complexity and dilute the product.

---

# 58. Do Not Build a Fake Screen Reader

A browser extension cannot faithfully reproduce:

```text
NVDA
JAWS
VoiceOver
TalkBack
Orca
```

Do not label a feature:

```text
Screen Reader Simulator
```

Instead expose:

```text
Accessible role
Accessible name
Accessible description
State
Properties
```

and encourage testing with real assistive technology.

---

# 59. Do Not Promise Compliance

Avoid language such as:

```text
Make your website WCAG compliant
Guarantee accessibility
ADA compliance scanner
One-click accessibility fix
```

Prefer:

```text
Review accessibility issues
Find common accessibility problems
Assist manual accessibility testing
Inspect accessible semantics
Support WCAG-oriented reviews
```

---

# 60. Main Differentiators

The extension should differentiate itself through workflow.

### Review, not scan-only

```text
Automated checks
+
Manual review
```

### Explain uncertainty

```text
Error
Warning
Review
```

### Deep element inspection

```text
role
name
description
focusability
ARIA
contrast
```

### Visual overlays

```text
headings
landmarks
focus order
tab stops
ARIA roles
```

### Guided keyboard testing

Record and review actual keyboard navigation.

### Developer-friendly reports

Markdown-first.

### Local-first privacy

No page data uploaded by default.

---

# 61. Portfolio Story

Avoid presenting the project merely as:

> I built an accessibility scanner.

A stronger description is:

> I built a browser-based accessibility review environment that combines automated rules, DOM inspection, guided manual testing, keyboard and focus analysis, semantic overlays, and developer-oriented reporting.

This demonstrates:

```text
TypeScript
React
Browser Extensions
Manifest V3
WebExtensions
DOM analysis
ARIA semantics
Accessible-name logic
CSS/computed styles
Color contrast calculations
Keyboard event handling
Focus management
Rule-engine architecture
Data modeling
Report generation
Playwright
UX design
Privacy-conscious architecture
Open-source maintenance
```

---

# 62. Demo Strategy

Create intentionally broken fixture pages:

```text
/demo/forms
/demo/navigation
/demo/modal
/demo/headings
/demo/contrast
```

Each page contains known issues.

Portfolio demonstration:

```text
Scan
→ Detect
→ Locate
→ Explain
→ Review
→ Export
```

This gives visitors a predictable live demonstration without depending on third-party websites.

---

# 63. Suggested README Introduction

> **Accessibility Review Assistant** is an open-source browser extension for developers and QA teams who want a more practical way to review web accessibility. It combines automated checks with guided manual testing, element inspection, keyboard and focus review, structural overlays, and exportable reports.
>
> The project does not claim that automated scanning can determine whether a website is fully accessible. Instead, it distinguishes high-confidence failures from issues requiring human judgment and helps reviewers investigate them directly in the browser.

---

# 64. Store Positioning

**Category:**

```text
Developer Tools
```

**Short description:**

```text
Review web accessibility with automated checks, guided manual testing, DOM inspection, and keyboard tools.
```

**Long positioning:**

> Review accessibility issues directly on live webpages. Inspect accessible names, forms, headings, landmarks, ARIA, keyboard navigation, focus behavior, contrast, and more. The extension combines automated checks with guided manual review rather than treating accessibility as a simple pass/fail scan.

---

# 65. Suggested GitHub Topics

```text
accessibility
a11y
browser-extension
chrome-extension
firefox-extension
webextensions
wcag
wai-aria
aria
developer-tools
qa
testing
frontend
typescript
react
playwright
open-source
```

---

# 66. Naming Direction

The final product name should communicate ideas such as:

```text
review
inspect
access
focus
clarity
a11y
semantics
guide
lens
check
```

Avoid names implying:

```text
certification
legal compliance
guaranteed accessibility
automatic remediation
```

A useful naming format is:

```text
<Product Name>
Accessibility review for the web
```

Before committing, check the Chrome Web Store, GitHub, npm, domains, and existing accessibility products.

---

# 67. Recommended Development Milestones

## Milestone 1 — Prove the engine

Build:

```text
Manifest V3 extension
content script
rule runner
basic output
```

Implement five rules:

```text
image-alt-missing
button-name-missing
form-control-name-missing
aria-hidden-focusable
positive-tabindex
```

Then add:

```text
Locate element
```

## Milestone 2 — Build the review UI

Add:

```text
side panel
issue grouping
issue detail view
element highlighting
headings
landmarks
ARIA checks
```

## Milestone 3 — Add differentiators

Build:

```text
Accessibility Inspector
Keyboard Review
Focus Review
Structure overlays
Manual review status
Markdown export
```

At this point the extension is portfolio-ready.

## Milestone 4 — Public release

Complete:

```text
unit tests
Playwright tests
privacy policy
README
screenshots
store metadata
extension icons
keyboard accessibility review
screen-reader testing
Chrome Web Store packaging
```

---

# 68. Definition of V1 Done

V1 is complete when a user can:

```text
1. Open a normal webpage.
2. Start an accessibility review.
3. See reliable automated findings.
4. Filter findings by category and severity.
5. Click an issue and locate the DOM element.
6. Inspect role, accessible name, and description.
7. View heading and landmark structure.
8. Run guided keyboard and focus review.
9. Mark manual checks as pass/fail.
10. Export findings as Markdown or JSON.
```

Everything else can wait.

---

# 69. Product Principles

```text
Automate what can be automated reliably.

Ask humans to review what requires judgment.

Explain why each issue matters.

Show the affected element.

Prefer native HTML over unnecessary ARIA.

Never claim automated WCAG compliance.

Keep page data local by default.

Make the accessibility tool itself accessible.
```

This philosophy is what can turn the project from another scanner into a genuinely useful **Accessibility Review Assistant**.

---

# 70. Official References

Implementation guidance and educational content should primarily reference authoritative sources.

## WCAG 2.2

https://www.w3.org/WAI/WCAG22/

## WAI-ARIA

https://www.w3.org/WAI/standards-guidelines/aria/

## ARIA Authoring Practices Guide

https://www.w3.org/WAI/ARIA/apg/

## Accessible Names and Descriptions

https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/

## Keyboard Interface Guidance

https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/

## Chrome Extensions Documentation

https://developer.chrome.com/docs/extensions/

## Chrome Scripting API

https://developer.chrome.com/docs/extensions/reference/api/scripting

## Chrome Side Panel API

https://developer.chrome.com/docs/extensions/reference/api/sidePanel
