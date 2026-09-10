import type { ContentToHostMessage, HostToContentMessage } from '../shared/messages';
import type { AuditResult } from '../shared/types';
import { collectAuditContext } from '../engine/collect-context';
import { runAudit } from '../engine/run-audit';
import { snapshotElement } from './inspector';
import { startKeyboardObserver, type KeyboardObserver } from './keyboard';
import { applyOverlay } from './layers';
import { clearOverlays, locateElement, setInspectCursor } from './overlays';
import { ruleById } from '../rules';

let lastResults: AuditResult[] = [];
let inspectHandler: ((event: Event) => void) | null = null;
let keyboard: KeyboardObserver | null = null;

function resolveElement(id?: string, selector?: string): Element | null {
  if (selector) {
    try {
      const el = document.querySelector(selector);
      if (el) return el;
    } catch {
      /* ignore invalid selectors */
    }
  }
  if (!id) return null;
  const result = lastResults.find((r) => r.element?.id === id);
  if (result?.element?.selector) {
    try {
      return document.querySelector(result.element.selector);
    } catch {
      return null;
    }
  }
  return null;
}

function reply(message: ContentToHostMessage): void {
  void chrome.runtime.sendMessage(message);
}

async function handle(message: HostToContentMessage): Promise<void> {
  switch (message.type) {
    case 'PING':
      reply({ type: 'PONG' });
      return;
    case 'RUN_AUDIT': {
      try {
        const context = collectAuditContext(document);
        lastResults = await runAudit(context, { includePassed: false, runContrast: true });
        reply({
          type: 'AUDIT_COMPLETE',
          results: lastResults,
          url: location.href,
          title: document.title,
          structure: { headings: context.headings, landmarks: context.landmarks },
        });
      } catch (error) {
        reply({
          type: 'AUDIT_ERROR',
          message: error instanceof Error ? error.message : 'Audit failed',
        });
      }
      return;
    }
    case 'LOCATE': {
      const el = resolveElement(message.elementId);
      const result = lastResults.find((r) => r.element?.id === message.elementId);
      const rule = result ? ruleById.get(result.ruleId) : undefined;
      if (el) {
        locateElement(
          el,
          `${result?.element?.tagName ?? el.tagName.toLowerCase()}  ${rule?.title ?? result?.message ?? ''}`.trim(),
        );
        reply({ type: 'LOCATED' });
      }
      return;
    }
    case 'CLEAR_LOCATE':
      clearOverlays();
      return;
    case 'COPY_SELECTOR': {
      const el = resolveElement(message.elementId);
      const result = lastResults.find((r) => r.element?.id === message.elementId);
      reply({ type: 'SELECTOR', selector: result?.element?.selector ?? (el ? el.tagName.toLowerCase() : '') });
      return;
    }
    case 'INSPECT_START': {
      setInspectCursor(true);
      inspectHandler = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.id === 'a11ycompass-overlay-host') return;
        setInspectCursor(false);
        document.removeEventListener('click', inspectHandler!, true);
        inspectHandler = null;
        locateElement(target, uniquePreview(target));
        reply({ type: 'INSPECTOR_SNAPSHOT', snapshot: snapshotElement(target) });
      };
      document.addEventListener('click', inspectHandler, true);
      return;
    }
    case 'INSPECT_STOP':
      setInspectCursor(false);
      if (inspectHandler) document.removeEventListener('click', inspectHandler, true);
      inspectHandler = null;
      reply({ type: 'INSPECT_CANCELLED' });
      return;
    case 'SET_OVERLAY':
      applyOverlay(message.mode);
      reply({ type: 'OVERLAY_SET', mode: message.mode });
      return;
    case 'KEYBOARD_START':
      keyboard?.stop();
      keyboard = startKeyboardObserver((step) => reply({ type: 'KEYBOARD_STEP', step }));
      return;
    case 'KEYBOARD_STOP':
      keyboard?.stop();
      keyboard = null;
      return;
    case 'GET_STRUCTURE': {
      const context = collectAuditContext(document);
      reply({
        type: 'STRUCTURE',
        structure: { headings: context.headings, landmarks: context.landmarks },
      });
    }
  }
}

function uniquePreview(el: Element): string {
  const name = snapshotElement(el);
  return `<${name.tagName}>  ${name.role}  “${name.name.name || 'none'}”`;
}

declare global {
  interface Window {
    __a11ycompassStarted?: boolean;
  }
}

export function startContentRuntime(): void {
  if (window.__a11ycompassStarted) return;
  window.__a11ycompassStarted = true;

  chrome.runtime.onMessage.addListener(
    (message: HostToContentMessage, _sender, sendResponse) => {
      if (message.type === 'PING') {
        sendResponse({ type: 'PONG' });
        return false;
      }
      void handle(message);
      return false;
    },
  );
}
