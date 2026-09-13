import type { BackgroundToSidepanel, HostToContentMessage, SidepanelToBackground } from '../shared/messages';
import { hasPageAccess, pageAccessError, pageOriginPattern } from '../shared/host-access';

const injected = new Set<number>();

function injectErrorMessage(url: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (
    !pageOriginPattern(url) ||
    /chrome:\/\//i.test(message) ||
    /chrome-extension:\/\//i.test(message) ||
    /Cannot access/i.test(message)
  ) {
    return pageAccessError(url);
  }
  return message || 'Could not attach to this page. Reload the extension and try again.';
}

async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const lastFocused = await chrome.windows.getLastFocused({
    windowTypes: ['normal'],
  });
  if (lastFocused.id != null) {
    const inWindow = await chrome.tabs.query({ active: true, windowId: lastFocused.id });
    if (inWindow[0]?.id) return inWindow[0];
  }

  const focused = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (focused[0]?.id) return focused[0];

  const current = await chrome.tabs.query({ active: true, currentWindow: true });
  if (current[0]?.id) return current[0];

  throw new Error('No active tab.');
}

async function ping(tabId: number): Promise<boolean> {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    return response?.type === 'PONG';
  } catch {
    return false;
  }
}

async function ensureContent(tabId: number): Promise<void> {
  const tab = await chrome.tabs.get(tabId);
  const url = tab.url ?? '';
  if (!(await hasPageAccess(url))) {
    throw new Error(pageAccessError(url));
  }

  if (await ping(tabId)) {
    injected.add(tabId);
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['page-audit.js'],
      injectImmediately: true,
    });
  } catch (error) {
    throw new Error(injectErrorMessage(url, error));
  }

  injected.add(tabId);
  const started = Date.now();
  while (Date.now() - started < 4000) {
    if (await ping(tabId)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Review script did not start on this page. Reload the extension and try again.');
}

async function disableGlobalPanel(): Promise<void> {
  await chrome.sidePanel.setOptions({ enabled: false });
}

async function pinPanelToTab(tabId: number): Promise<void> {
  await chrome.sidePanel.setOptions({
    tabId,
    path: 'sidepanel.html',
    enabled: true,
  });
}

export default defineBackground(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  void disableGlobalPanel();
  chrome.runtime.onInstalled.addListener(() => void disableGlobalPanel());
  chrome.runtime.onStartup.addListener(() => void disableGlobalPanel());

  chrome.tabs.onRemoved.addListener((tabId: number) => injected.delete(tabId));
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading') injected.delete(tabId);
  });

  chrome.runtime.onMessage.addListener(
    (
      message: SidepanelToBackground | { type: string },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (payload: BackgroundToSidepanel) => void,
    ) => {
      const respond = (payload: BackgroundToSidepanel) => sendResponse(payload);

      if (message.type === 'OPEN_SIDE_PANEL') {
        void getActiveTab()
          .then(async (tab) => {
            if (!tab.id) return;
            await pinPanelToTab(tab.id);
            await chrome.sidePanel.open({ tabId: tab.id });
          })
          .catch(() => undefined);
        return false;
      }

      if (message.type === 'GET_TAB') {
        void getActiveTab()
          .then((tab) => {
            if (!tab.id) {
              respond({ type: 'ERROR', message: 'No active tab.' });
              return;
            }
            respond({
              type: 'TAB',
              tabId: tab.id,
              url: tab.url ?? '',
              title: tab.title ?? '',
            });
          })
          .catch((error: Error) => respond({ type: 'ERROR', message: error.message }));
        return true;
      }

      if (message.type === 'ENSURE_CONTENT') {
        const { tabId } = message as Extract<SidepanelToBackground, { type: 'ENSURE_CONTENT' }>;
        void ensureContent(tabId)
          .then(() => respond({ type: 'CONTENT_READY', tabId }))
          .catch((error: Error) => respond({ type: 'ERROR', message: error.message }));
        return true;
      }

      if (message.type === 'FORWARD') {
        const { tabId, message: inner } = message as Extract<
          SidepanelToBackground,
          { type: 'FORWARD' }
        >;
        void chrome.tabs
          .sendMessage(tabId, inner as HostToContentMessage)
          .catch((error: Error) => respond({ type: 'ERROR', message: error.message }));
        return false;
      }

      return false;
    },
  );
});
