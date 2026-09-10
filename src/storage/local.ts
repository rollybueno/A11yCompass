import {
  DEFAULT_SETTINGS,
  type AccessibilityReviewSettings,
  type ManualCheckState,
} from '../shared/types';

const SETTINGS_KEY = 'a11ycompass.settings';
const MANUAL_KEY = (tabId: number, url: string) => `a11ycompass.manual:${tabId}:${url}`;

export async function loadSettings(): Promise<AccessibilityReviewSettings> {
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(data[SETTINGS_KEY] ?? {}) };
}

export async function saveSettings(settings: AccessibilityReviewSettings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

export async function loadManual(
  tabId: number,
  url: string,
): Promise<Record<string, ManualCheckState>> {
  const key = MANUAL_KEY(tabId, url);
  const data = await chrome.storage.local.get(key);
  return (data[key] as Record<string, ManualCheckState> | undefined) ?? {};
}

export async function saveManual(
  tabId: number,
  url: string,
  manual: Record<string, ManualCheckState>,
): Promise<void> {
  await chrome.storage.local.set({ [MANUAL_KEY(tabId, url)]: manual });
}
