import type { ContentToHostMessage, HostToContentMessage } from '../../shared/messages';
import { requestPageAccess } from '../../shared/host-access';

export async function getActiveTab(): Promise<{ tabId: number; url: string; title: string }> {
  const response = await chrome.runtime.sendMessage({ type: 'GET_TAB' });
  if (response?.type === 'ERROR') throw new Error(response.message);
  return response;
}

export async function ensureContent(tabId: number): Promise<void> {
  const response = await chrome.runtime.sendMessage({ type: 'ENSURE_CONTENT', tabId });
  if (response?.type === 'ERROR') throw new Error(response.message);
}

export async function attachToTab(tab: { tabId: number; url: string }): Promise<void> {
  await requestPageAccess(tab.url);
  await ensureContent(tab.tabId);
}

export async function forward(tabId: number, message: HostToContentMessage): Promise<void> {
  await chrome.runtime.sendMessage({ type: 'FORWARD', tabId, message });
}

export function onContentMessage(handler: (message: ContentToHostMessage, tabId?: number) => void): () => void {
  const listener = (message: ContentToHostMessage, sender: chrome.runtime.MessageSender) => {
    handler(message, sender.tab?.id);
  };
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}
