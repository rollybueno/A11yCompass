# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are frontend developers, QA engineers, accessibility specialists, designers, and content editors reviewing a live webpage in Chrome. They are sitting beside the page under mixed office light, often with DevTools nearby, and need to inspect a rendered page regardless of the stack that produced it (WordPress, React, Vue, Shopify, static HTML, and similar).

## Product Purpose

A11yCompass is a browser extension that helps a reviewer find common accessibility problems on the current page, understand why each finding matters, locate the affected DOM element, inspect accessible semantics, complete guided manual checks, and export a report.

Success is a complete review session on a normal webpage: automated findings, element location, name/role inspection, heading and landmark structure, keyboard and focus review, manual pass/fail marks, and Markdown or JSON export. Success is not a compliance certificate.

Assumptions inferred from `accessibility-review-assistant-project-spec.md` and the repository name `A11yCompass`.

## Positioning

The product is a review assistant, not a scanner. It separates high-confidence automated failures from warnings and from findings that still need human judgment. It does not present a WCAG compliance score, one-click ARIA fixes, or a fake screen-reader simulator.

## Operating Context

- Chrome Manifest V3 side panel is the primary workspace; the toolbar popup only launches that panel.
- Reviews run against the active tab after the reviewer explicitly starts them.
- Findings, notes, and reports stay on the device unless the reviewer exports or copies them.
- Reports are written for GitHub, GitLab, Jira, Linear, pull requests, and issue trackers.
- Overlay modes (headings, landmarks, tab stops, and similar) are part of inspecting the live page.

## Capabilities and Constraints

Confirmed for V1.0:

- Automated rules for images, forms, links and buttons, headings, landmarks, ARIA, keyboard/focus, contrast, and document structure.
- Severity model: error, warning, review, info, passed.
- Accessibility Inspector for role, accessible name, name source, description, focusability, tabindex, ARIA, and contrast.
- Locate element, copy selector, heading/landmark structure, overlay modes.
- Guided keyboard and focus review with manual checklist status and notes.
- Export Markdown and JSON.
- Permissions limited to `activeTab`, `scripting`, `storage`, `sidePanel`, and http(s) host access for on-demand injection from the side panel.

Out of V1.0:

- AI-generated alt text, automatic ARIA patches, cloud accounts, whole-site crawling, CI, PDF/mobile testing, legal-compliance claims, Firefox packaging (planned later).

Undecided: public Chrome Web Store listing copy beyond the spec’s suggested positioning; final store screenshots.

## Brand Commitments

- Product name: **A11yCompass** (repository name). Spec working title “Accessibility Review Assistant” is descriptive, not the shipped name.
- Tagline: Guided accessibility review for the web.
- Voice: precise, non-certifying, explains uncertainty. Prefer “Related WCAG criteria” over conformance claims.
- License: MIT, as recommended by the spec.

## Evidence on Hand

- Product specification: `accessibility-review-assistant-project-spec.md`.
- No existing UI, logo, or customer quotes. Demo fixture pages are synthetic and must be labeled as such.

## Product Principles

1. Automate only what can be checked reliably; ask humans to review what needs judgment.
2. Every issue must be explainable and locatable on the page.
3. Prefer native HTML over unnecessary ARIA; never auto-apply generic labels.
4. Keep page content local by default.
5. The extension UI itself must be accessible.

## Accessibility & Inclusion

The extension UI must be keyboard operable, screen-reader friendly, high contrast, properly labelled, logically structured, focus visible, usable at zoom, and reduced-motion friendly. Automated checks of the host page never replace testing with real assistive technology.
