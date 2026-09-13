# A11yCompass

**Guided accessibility review for the web.**

A11yCompass is an open-source Chrome extension (Manifest V3) for developers, QA, and accessibility reviewers. It combines automated checks with guided manual testing, element inspection, keyboard and focus review, structural overlays, and exportable reports.

The project does not claim that automated scanning can determine whether a website is fully accessible. It distinguishes high-confidence failures from issues that still need human judgment and helps reviewers inspect them on the live page.

## Install (unpacked)

1. Use Node 20 or 22.
2. `npm install`
3. `npm run build`
4. In Chrome, open `chrome://extensions`, enable Developer mode, Load unpacked, and select `.output/chrome-mv3`.

`npm run dev` starts a development build with reload.

## Use

1. Open a normal http(s) webpage. Demo fixtures in `demo/` should be served over http (for example `npx serve demo`).
2. Click the A11yCompass icon — the side panel is the main workspace. Chrome will ask for access to that page; nothing is uploaded.
3. Start a review.
4. Filter issues, locate the element, inspect accessible name and role, view headings and landmarks, run keyboard review, mark manual checks, and export Markdown or JSON.

Permissions: `activeTab`, `scripting`, `storage`, `sidePanel`, and optional host access to the http(s) page you choose to review. The review script is injected after you start a review. Reviews stay on your device. See [PRIVACY.md](PRIVACY.md) and [STORE.md](STORE.md).

If an already-loaded unpacked build still cannot scan live pages, click **Reload** on `chrome://extensions` so the new optional host permissions apply.

## What V1.0 covers

Automated rules for images, forms, links and buttons, headings, landmarks, ARIA, keyboard/focus, contrast, and document structure — plus Locate, Inspector, overlays, manual checklists, and Markdown/JSON export.

It will not auto-fix ARIA, generate alt text, or report a WCAG compliance score.

## Demo pages

Synthetic fixtures with known issues (labeled as such):

- `demo/forms.html`
- `demo/headings.html`
- `demo/navigation.html`
- `demo/contrast.html`

Serve them over http (for example `npx serve demo`), then run a review. Local `file://` pages are not reviewed in the store build.

## Development

```bash
npm test
npm run compile
npm run lint
```

## License

MIT
