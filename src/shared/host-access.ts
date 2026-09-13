const HTTP_ORIGINS = ['http://*/*', 'https://*/*'] as const;

export function pageOriginPattern(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return `${parsed.origin}/*`;
  } catch {
    return null;
  }
}

export function pageAccessError(url: string): string {
  if (url.startsWith('file:')) {
    return 'Local files cannot be reviewed. Serve the page over http(s), then start the review.';
  }
  if (
    /^(chrome|chrome-extension|edge|about|devtools|view-source|chrome-search|chrome-untrusted|brave|opera):/i.test(url) ||
    url.startsWith('https://chrome.google.com/webstore') ||
    url.startsWith('https://chromewebstore.google.com')
  ) {
    return 'This page cannot be reviewed. Open a normal http(s) webpage.';
  }
  return 'A11yCompass needs access to this page to inspect it. Nothing is uploaded.';
}

function originsToRequest(url: string): string[] {
  const origin = pageOriginPattern(url);
  return origin ? [origin] : [...HTTP_ORIGINS];
}

export async function hasPageAccess(url: string): Promise<boolean> {
  if (url && !pageOriginPattern(url)) return false;
  return chrome.permissions.contains({ origins: originsToRequest(url) });
}

export async function requestPageAccess(url: string): Promise<void> {
  if (url && !pageOriginPattern(url)) throw new Error(pageAccessError(url));

  const origins = originsToRequest(url);
  const already = await chrome.permissions.contains({ origins });
  if (already) return;

  const granted = await chrome.permissions.request({ origins });
  if (!granted) throw new Error(pageAccessError(url));
}

export { HTTP_ORIGINS };

