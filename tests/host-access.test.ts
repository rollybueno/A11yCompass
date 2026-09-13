import { describe, expect, it } from 'vitest';
import { pageAccessError, pageOriginPattern } from '../src/shared/host-access';

describe('pageOriginPattern', () => {
  it('returns an origin match pattern for http(s) pages', () => {
    expect(pageOriginPattern('https://example.com/path?q=1')).toBe('https://example.com/*');
    expect(pageOriginPattern('http://localhost:4173/demo/forms.html')).toBe('http://localhost:4173/*');
  });

  it('rejects file URLs and browser pages', () => {
    expect(pageOriginPattern('file:///tmp/forms.html')).toBeNull();
    expect(pageOriginPattern('chrome://extensions')).toBeNull();
  });
});

describe('pageAccessError', () => {
  it('explains local files and restricted pages', () => {
    expect(pageAccessError('file:///tmp/x.html')).toMatch(/Serve the page over http/);
    expect(pageAccessError('chrome://settings')).toMatch(/normal http\(s\) webpage/);
  });
});
