# Chrome Web Store listing notes

Paste these into the Developer Dashboard. Do not use a GitHub blob or raw URL as the privacy policy. Reviewers expect a dedicated public HTTPS page, not the GitHub file UI.

Privacy policy URL (after the WordPress page is published):

`https://www.rollybueno.com/browser-extension/a11ycompass/privacy`

## Single purpose

Guided accessibility review of the current webpage: automated checks, element location, accessible-name inspection, structure overlays, keyboard review, and a local report.

## Permission justifications

**activeTab** — Identify the tab the reviewer opened the panel from so a review can target that page.

**scripting** — Inject the review script after the reviewer starts a review, so the extension can inspect the live DOM, locate elements, and draw overlays.

**storage** — Save settings and manual-review progress on this device. Nothing is uploaded.

**sidePanel** — Open the review workspace beside the page.

**Host access (`http://*/*`, `https://*/*`, optional)** — Inspect the http(s) page the reviewer chose to review. Access is requested when they start a review or open the panel, not at install. Page content is processed locally and is not uploaded.

## Screenshots

Upload these 1280×800 PNGs from `store/screenshots/`:

- `overview-1280x800.png`
- `issues-1280x800.png`
- `inspector-1280x800.png`

Regenerate with `npx vite store --port 4177` and capture `?view=overview`, `?view=issues`, and `?view=inspector`.

No. The extension does not execute remote code.

## Data use

The extension reads the current page in the browser to run accessibility checks. It does not sell data, does not use it for advertising, and does not send page content to a server.
