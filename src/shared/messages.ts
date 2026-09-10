import type {
  AuditResult,
  InspectorSnapshot,
  KeyboardStep,
  OverlayMode,
  StructureSnapshot,
} from './types';

export type HostToContentMessage =
  | { type: 'PING' }
  | { type: 'RUN_AUDIT' }
  | { type: 'LOCATE'; elementId: string }
  | { type: 'CLEAR_LOCATE' }
  | { type: 'COPY_SELECTOR'; elementId: string }
  | { type: 'INSPECT_START' }
  | { type: 'INSPECT_STOP' }
  | { type: 'SET_OVERLAY'; mode: OverlayMode['id'] }
  | { type: 'KEYBOARD_START' }
  | { type: 'KEYBOARD_STOP' }
  | { type: 'GET_STRUCTURE' };

export type ContentToHostMessage =
  | { type: 'PONG' }
  | { type: 'AUDIT_COMPLETE'; results: AuditResult[]; url: string; title: string; structure: StructureSnapshot }
  | { type: 'AUDIT_ERROR'; message: string }
  | { type: 'LOCATED' }
  | { type: 'SELECTOR'; selector: string }
  | { type: 'INSPECTOR_SNAPSHOT'; snapshot: InspectorSnapshot }
  | { type: 'INSPECT_CANCELLED' }
  | { type: 'KEYBOARD_STEP'; step: KeyboardStep }
  | { type: 'KEYBOARD_RESET' }
  | { type: 'STRUCTURE'; structure: StructureSnapshot }
  | { type: 'OVERLAY_SET'; mode: OverlayMode['id'] };

export type SidepanelToBackground =
  | { type: 'GET_TAB' }
  | { type: 'ENSURE_CONTENT'; tabId: number }
  | { type: 'FORWARD'; tabId: number; message: HostToContentMessage }
  | { type: 'OPEN_SIDE_PANEL' };

export type BackgroundToSidepanel =
  | { type: 'TAB'; tabId: number; url: string; title: string }
  | { type: 'CONTENT_READY'; tabId: number }
  | { type: 'FORWARD_FROM_CONTENT'; tabId: number; message: ContentToHostMessage }
  | { type: 'ERROR'; message: string };
