---
name: A11yCompass
description: Cartographic field survey for reviewing web accessibility in a Chrome side panel.
colors:
  ink: "#1c2430"
  ink-soft: "#3d4a5c"
  paper: "#f3efe4"
  paper-raised: "#faf7f0"
  paper-tint: "#efe8d8"
  rule: "#d5cbb8"
  rule-strong: "#b9ad96"
  needle: "#c23b22"
  needle-deep: "#9a2c18"
  survey-teal: "#0f6e6b"
  survey-ochre: "#9a6b12"
  error: "#9f1d2c"
  warning: "#8a5a10"
  review: "#0f6e6b"
  passed: "#2d5a3d"
  info: "#3d4a5c"
  focus-ring: "#1c2430"
typography:
  ui:
    fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif'
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0.01em"
  title:
    fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif'
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  heading:
    fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif'
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  caption:
    fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.01em"
  kicker:
    fontFamily: '"Atkinson Hyperlegible", "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0.04em"
  mono:
    fontFamily: "ui-monospace, \"Cascadia Code\", \"SF Mono\", Menlo, monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
rounded:
  sm: "2px"
  md: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.needle}"
    textColor: "{colors.paper-raised}"
    typography: "{typography.ui}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.needle-deep}"
    textColor: "{colors.paper-raised}"
  button-secondary:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
    height: "44px"
---

## Overview

A11yCompass looks like a survey worksheet clipped to the side of a webpage: chart-paper ground, ruled separators, ink labels, and a compass-needle accent for the current waypoint. It is an Operate surface. Density and scanability outrank decoration. The category default it refuses is a dark scanner dashboard with a fake accessibility score.

THESIS: the live page is terrain; findings are waypoints; humans still walk the ground. OWN-WORLD: Atkinson Hyperlegible on warm chart paper, ink navy type, vermillion needle for the active action and located element, teal/ochre marks for review and warning. STORY: a reviewer starts a review, reads status without a score, opens a finding, locates it on the page. FIRST VIEWPORT: header with mark and page host, review-status legend, Start review, then layer tabs. FORM: cartographic inspection worksheet in a ~400px side panel.

## Colors

Light chart paper (`#f3efe4`) is the working surface because reviewers sit in mixed office daylight for long sessions. Ink (`#1c2430`) is the default text. The needle (`#c23b22`) is reserved for the primary action, the selected issue, and the on-page locate outline. Severity color is semantic, not decorative: error crimson, warning ochre, review teal, passed forest. Do not gray secondary text; use `ink-soft` which stays above 4.5:1 on paper.

## Typography

Atkinson Hyperlegible is the only UI family. It exists because the Braille Institute designed it for low-vision readers, which is a product-specific reason. Body text, tabs, and descriptions are 18px with 1.55 line-height. Labels, selectors, and kickers stay at 16px so nothing in the panel is smaller than comfortable reading size. Monospace is only for selectors, rule IDs, hex colors, and exported snippets.

## Layout

The side panel is a single column: sticky header, status legend, horizontal layer tabs, scrolling body. Tabs are map layers, not a marketing nav. Issue rows are full-width list items with a mark, title, and selector — not icon cards. Overlay chrome on the host page uses the same needle outline and a small ink caption, then restores the page.

## Elevation & Depth

Almost none. Paper-raised sits one step lighter with a 1px `rule` edge. Shadows are rare, offset (`0 1px 2px`), and only for the on-page caption. No glass, no glow, no zero-offset halos.

## Shapes

Square-ish (`2px`–`4px`). Map ticks and hairline rules, not pills. Status marks are typographic (✕ ⚠ ◇ ✓) rather than circular badges.

## Components

Primary button is needle-filled, 44px tall, labeled with a verb. Secondary buttons are outlined in `rule-strong`. Selected issue row uses a 1px ink rule around the row, not a thick colored bar. Focus ring is a 2px ink outline offset 2px. Empty states explain the next action (“Start a review of this page”). Loading uses a short “Surveying page…” status text, not a spinner occupying the canvas.

## Do's and Don'ts

**Do** keep automated counts and manual-review progress visually separate. **Do** say “Related WCAG” not “compliant.” **Do** show the accessible name and its source in the inspector.

**Don't** show a 0–100 accessibility score. **Don't** auto-fix ARIA. **Don't** use traffic-light pill dashboards, Inter, neon-on-black DevTools cosplay, or gradient text.
