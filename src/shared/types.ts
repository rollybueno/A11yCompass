export type Severity = 'error' | 'warning' | 'review' | 'info' | 'passed';

export type RuleCategory =
  | 'images'
  | 'forms'
  | 'links'
  | 'headings'
  | 'landmarks'
  | 'aria'
  | 'keyboard'
  | 'focus'
  | 'contrast'
  | 'document'
  | 'tables'
  | 'media'
  | 'motion'
  | 'content';

export interface ElementReference {
  id: string;
  selector: string;
  tagName: string;
  text?: string;
  xpath?: string;
}

export interface NameComputation {
  name: string;
  source: string;
}

export interface HeadingInfo {
  id: string;
  level: number;
  name: string;
  element: ElementReference;
}

export interface LandmarkInfo {
  id: string;
  role: string;
  name: string;
  element: ElementReference;
}

export interface ImageInfo {
  id: string;
  alt: string | null;
  hasAltAttribute: boolean;
  name: NameComputation;
  src?: string;
  role?: string | null;
  element: ElementReference;
}

export interface ControlInfo {
  id: string;
  tagName: string;
  type?: string;
  role: string;
  name: NameComputation;
  required: boolean;
  ariaRequired: boolean | null;
  placeholder?: string;
  element: ElementReference;
}

export interface FocusableElementInfo {
  id: string;
  name: NameComputation;
  role: string;
  tabIndex: number;
  implicitTabIndex: boolean;
  visible: boolean;
  ariaHidden: boolean;
  element: ElementReference;
}

export interface AriaElementInfo {
  id: string;
  role: string | null;
  implicitRole: string | null;
  ariaHidden: boolean;
  labelledBy?: string;
  describedBy?: string;
  element: ElementReference;
}

export interface AuditContext {
  document: Document;
  url: URL;
  title: string;
  lang: string;
  headings: HeadingInfo[];
  landmarks: LandmarkInfo[];
  images: ImageInfo[];
  controls: ControlInfo[];
  focusableElements: FocusableElementInfo[];
  ariaElements: AriaElementInfo[];
  now: number;
}

export interface AuditResult {
  id: string;
  ruleId: string;
  status: Severity;
  message: string;
  element?: ElementReference;
  wcag?: string[];
  details?: Record<string, unknown>;
}

export interface AccessibilityRule {
  id: string;
  title: string;
  category: RuleCategory;
  defaultSeverity: Severity;
  wcag?: string[];
  whyItMatters: string;
  suggestedReview?: string;
  possibleApproaches?: string[];
  run(context: AuditContext): AuditResult[] | Promise<AuditResult[]>;
}

export interface ManualCheck {
  id: string;
  category: string;
  label: string;
}

export type ReviewStatus = 'not-reviewed' | 'pass' | 'fail' | 'not-applicable';

export interface ManualCheckState {
  status: ReviewStatus;
  note: string;
}

export interface KeyboardStep {
  index: number;
  name: string;
  selector: string;
  role: string;
  warning?: string;
}

export interface InspectorSnapshot {
  selector: string;
  tagName: string;
  htmlPreview: string;
  role: string;
  name: NameComputation;
  description: string;
  focusable: boolean;
  tabIndex: string;
  aria: Record<string, string>;
  contrast?: ContrastReport;
  issues: string[];
}

export interface ContrastReport {
  foreground: string;
  background: string;
  ratio: number;
  fontSizePx: number;
  fontWeight: number;
  largeText: boolean;
  required: number;
  result: 'pass' | 'fail' | 'review';
  note?: string;
}

export interface StructureSnapshot {
  headings: HeadingInfo[];
  landmarks: LandmarkInfo[];
}

export interface OverlayMode {
  id: 'off' | 'issues' | 'headings' | 'landmarks' | 'tabstops' | 'images' | 'forms' | 'aria';
  label: string;
}

export interface AccessibilityReviewSettings {
  includePassedRules: boolean;
  showWcagReferences: boolean;
  highlightOnSelection: boolean;
  runContrastChecks: boolean;
  enableKeyboardObserver: boolean;
}

export const DEFAULT_SETTINGS: AccessibilityReviewSettings = {
  includePassedRules: false,
  showWcagReferences: true,
  highlightOnSelection: true,
  runContrastChecks: true,
  enableKeyboardObserver: true,
};

export interface AuditSummary {
  url: string;
  title: string;
  scannedAt: string;
  errors: number;
  warnings: number;
  review: number;
  info: number;
  passed: number;
}

export interface ReviewSession {
  tabId: number;
  url: string;
  title: string;
  scannedAt: string;
  results: AuditResult[];
  summary: AuditSummary;
  structure: StructureSnapshot;
  manual: Record<string, ManualCheckState>;
  keyboardPath: KeyboardStep[];
  settings: AccessibilityReviewSettings;
}
