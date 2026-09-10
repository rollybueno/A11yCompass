/* A11yCompass side panel
   THESIS: the live page is terrain; findings are waypoints, not a score. Refuses the scanner dashboard.
   OWN-WORLD: Atkinson Hyperlegible on chart paper, ink type, vermillion needle, teal/ochre survey marks.
   STORY: start a review, read status, open a finding, locate it on the page, inspect name/role, export.
   FIRST VIEWPORT: header + host, review-status legend, Start review, layer tabs.
   FORM: cartographic inspection worksheet; seed not used — spec-pinned side panel structure.
*/

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AccessibilityReviewSettings,
  AuditResult,
  InspectorSnapshot,
  KeyboardStep,
  ManualCheckState,
  OverlayMode,
  ReviewSession,
  Severity,
  StructureSnapshot,
} from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/types';
import { CATEGORY_LABEL, OVERLAY_MODES, SEVERITY_LABEL, SEVERITY_MARK } from '../../shared/labels';
import { wcagLabel } from '../../shared/wcag';
import { ruleById } from '../../rules';
import { checksByCategory, MANUAL_CHECKS } from '../../review/checklists';
import { exportJson, exportMarkdown } from '../../review/reporters';
import { loadManual, loadSettings, saveManual, saveSettings } from '../../storage/local';
import { ensureContent, forward, getActiveTab, onContentMessage } from './messaging';

type View = 'overview' | 'issues' | 'structure' | 'keyboard' | 'inspector';

const VIEWS: { id: View; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'issues', label: 'Issues' },
  { id: 'structure', label: 'Structure' },
  { id: 'keyboard', label: 'Keyboard' },
  { id: 'inspector', label: 'Inspector' },
];

function countBy(results: AuditResult[], status: Severity): number {
  return results.filter((r) => r.status === status).length;
}

function download(filename: string, text: string, type: string): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function App() {
  const [tab, setTab] = useState<{ tabId: number; url: string; title: string } | null>(null);
  const [settings, setSettings] = useState<AccessibilityReviewSettings>(DEFAULT_SETTINGS);
  const [results, setResults] = useState<AuditResult[]>([]);
  const [structure, setStructure] = useState<StructureSnapshot | null>(null);
  const [scannedAt, setScannedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('overview');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [manual, setManual] = useState<Record<string, ManualCheckState>>({});
  const [keyboardPath, setKeyboardPath] = useState<KeyboardStep[]>([]);
  const [keyboardOn, setKeyboardOn] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [snapshot, setSnapshot] = useState<InspectorSnapshot | null>(null);
  const [overlay, setOverlay] = useState<OverlayMode['id']>('off');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const host = useMemo(() => {
    if (!tab?.url) return tab?.tabId ? 'This page' : 'No page';
    try {
      return new URL(tab.url).hostname || 'This page';
    } catch {
      return 'This page';
    }
  }, [tab]);

  const selected = results.find((r) => r.id === selectedId) ?? null;
  const selectedRule = selected ? ruleById.get(selected.ruleId) : undefined;

  const refreshTab = useCallback(async () => {
    const next = await getActiveTab();
    setTab(next);
    return next;
  }, []);

  useEffect(() => {
    void loadSettings().then(setSettings);
    void refreshTab().catch((err: Error) => setError(err.message));
  }, [refreshTab]);

  useEffect(() => {
    if (!tab) return;
    void loadManual(tab.tabId, tab.url).then(setManual);
  }, [tab]);

  useEffect(() => {
    return onContentMessage((message) => {
      if (message.type === 'AUDIT_COMPLETE') {
        setResults(message.results);
        setStructure(message.structure);
        setScannedAt(new Date().toISOString());
        setBusy(false);
        setError(null);
        setView('issues');
      }
      if (message.type === 'AUDIT_ERROR') {
        setBusy(false);
        setError(message.message);
      }
      if (message.type === 'INSPECTOR_SNAPSHOT') {
        setSnapshot(message.snapshot);
        setInspecting(false);
        setView('inspector');
      }
      if (message.type === 'INSPECT_CANCELLED') setInspecting(false);
      if (message.type === 'KEYBOARD_STEP') {
        setKeyboardPath((path) => [...path, message.step]);
      }
      if (message.type === 'SELECTOR' && message.selector) {
        void navigator.clipboard.writeText(message.selector);
        setCopied(message.selector);
        window.setTimeout(() => setCopied(null), 2000);
      }
      if (message.type === 'STRUCTURE') setStructure(message.structure);
    });
  }, []);

  const startReview = async () => {
    setError(null);
    setBusy(true);
    try {
      const active = await refreshTab();
      await ensureContent(active.tabId);
      await forward(active.tabId, { type: 'RUN_AUDIT' });
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : 'Could not start review.');
    }
  };

  const locate = async (result: AuditResult) => {
    if (!tab || !result.element) return;
    setSelectedId(result.id);
    try {
      await forward(tab.tabId, { type: 'LOCATE', elementId: result.element.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not locate element.');
    }
  };

  const copySelector = async (result: AuditResult) => {
    if (!tab || !result.element) return;
    try {
      await forward(tab.tabId, { type: 'COPY_SELECTOR', elementId: result.element.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not copy selector.');
    }
  };

  const updateManual = async (id: string, patch: Partial<ManualCheckState>) => {
    if (!tab) return;
    const next = {
      ...manual,
      [id]: {
        ...(manual[id] ?? { status: 'not-reviewed' as const, note: '' }),
        ...patch,
      },
    };
    setManual(next);
    await saveManual(tab.tabId, tab.url, next);
  };

  const session = (): ReviewSession | null => {
    if (!tab || !scannedAt) return null;
    return {
      tabId: tab.tabId,
      url: tab.url,
      title: tab.title,
      scannedAt,
      results,
      summary: {
        url: tab.url,
        title: tab.title,
        scannedAt,
        errors: countBy(results, 'error'),
        warnings: countBy(results, 'warning'),
        review: countBy(results, 'review'),
        info: countBy(results, 'info'),
        passed: countBy(results, 'passed'),
      },
      structure: structure ?? { headings: [], landmarks: [] },
      manual,
      keyboardPath,
      settings,
    };
  };

  const visibleResults = results.filter((r) => {
    if (!settings.includePassedRules && r.status === 'passed') return false;
    if (severityFilter !== 'all' && r.status !== severityFilter) return false;
    if (categoryFilter !== 'all') {
      const rule = ruleById.get(r.ruleId);
      if (rule?.category !== categoryFilter) return false;
    }
    return true;
  });

  const manualDone = Object.values(manual).filter((m) => m.status !== 'not-reviewed').length;
  const categories = Array.from(
    new Set(results.map((r) => ruleById.get(r.ruleId)?.category).filter(Boolean)),
  );

  return (
    <div className="sheet">
      <a className="skip" href="#main">
        Skip to findings
      </a>
      <header className="mast">
        <div className="brand">
          <span className="compass" aria-hidden="true" />
          <div>
            <p className="product">A11yCompass</p>
            <p className="host" title={tab?.url}>
              {host}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-expanded={settingsOpen}
          aria-controls="settings-panel"
          onClick={() => setSettingsOpen((v) => !v)}
        >
          Settings
        </button>
      </header>

      {settingsOpen && (
        <section id="settings-panel" className="settings" aria-label="Settings">
          {(
            [
              ['includePassedRules', 'Include passed checks in the issue list'],
              ['showWcagReferences', 'Show related WCAG criteria'],
              ['highlightOnSelection', 'Highlight on the page when an issue is selected'],
              ['runContrastChecks', 'Run contrast checks'],
              ['enableKeyboardObserver', 'Enable keyboard path recording'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="check">
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={async (event) => {
                  const next = { ...settings, [key]: event.target.checked };
                  setSettings(next);
                  await saveSettings(next);
                }}
              />
              {label}
            </label>
          ))}
        </section>
      )}

      <section className="legend" aria-label="Review status">
        <p className="kicker">Review status</p>
        <dl className="counts">
          <div>
            <dt>Automated</dt>
            <dd>
              {scannedAt ? (
                <>
                  <b>{countBy(results, 'error')}</b> errors · <b>{countBy(results, 'warning')}</b> warnings ·{' '}
                  <b>{countBy(results, 'review')}</b> review
                </>
              ) : (
                'Not surveyed yet'
              )}
            </dd>
          </div>
          <div>
            <dt>Manual</dt>
            <dd>
              {manualDone} / {MANUAL_CHECKS.length} completed
            </dd>
          </div>
        </dl>
        <div className="actions">
          <button type="button" className="primary" onClick={() => void startReview()} disabled={busy}>
            {busy ? 'Surveying page…' : scannedAt ? 'Re-run review' : 'Start review'}
          </button>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>

      <nav className="layers" aria-label="Review layers">
        {VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={view === item.id ? 'layer is-active' : 'layer'}
            aria-current={view === item.id ? 'page' : undefined}
            onClick={() => setView(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main id="main">
        {view === 'overview' && (
          <Overview
            scannedAt={scannedAt}
            results={results}
            manualDone={manualDone}
            onOpenIssues={() => setView('issues')}
            onExportMd={() => {
              const s = session();
              if (s) download('accessibility-review.md', exportMarkdown(s), 'text/markdown');
            }}
            onExportJson={() => {
              const s = session();
              if (s) download('accessibility-review.json', exportJson(s), 'application/json');
            }}
            onCopy={() => {
              const s = session();
              if (!s) return;
              void navigator.clipboard.writeText(exportMarkdown(s));
              setCopied('report');
              window.setTimeout(() => setCopied(null), 2000);
            }}
            copied={copied === 'report'}
          />
        )}

        {view === 'issues' && (
          <Issues
            results={visibleResults}
            selectedId={selectedId}
            selected={selected}
            selectedRule={selectedRule}
            showWcag={settings.showWcagReferences}
            severityFilter={severityFilter}
            categoryFilter={categoryFilter}
            categories={categories as string[]}
            onFilterSeverity={setSeverityFilter}
            onFilterCategory={setCategoryFilter}
            onSelect={(item) => {
              setSelectedId(item.id);
              if (settings.highlightOnSelection) void locate(item);
            }}
            onLocate={(item) => void locate(item)}
            onCopy={(item) => void copySelector(item)}
            copiedSelector={copied}
          />
        )}

        {view === 'structure' && (
          <Structure
            structure={structure}
            overlay={overlay}
            onOverlay={async (mode) => {
              if (!tab) return;
              setOverlay(mode);
              try {
                await ensureContent(tab.tabId);
                await forward(tab.tabId, { type: 'SET_OVERLAY', mode });
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not set overlay.');
              }
            }}
            onLocate={async (id) => {
              if (!tab) return;
              await forward(tab.tabId, { type: 'LOCATE', elementId: id });
            }}
          />
        )}

        {view === 'keyboard' && (
          <KeyboardView
            path={keyboardPath}
            on={keyboardOn}
            manual={manual}
            onToggle={async () => {
              if (!tab) return;
              try {
                await ensureContent(tab.tabId);
                if (keyboardOn) {
                  await forward(tab.tabId, { type: 'KEYBOARD_STOP' });
                  setKeyboardOn(false);
                } else {
                  setKeyboardPath([]);
                  await forward(tab.tabId, { type: 'KEYBOARD_START' });
                  setKeyboardOn(true);
                  setView('keyboard');
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not start keyboard review.');
              }
            }}
            onReset={() => setKeyboardPath([])}
            onManual={updateManual}
          />
        )}

        {view === 'inspector' && (
          <InspectorView
            snapshot={snapshot}
            inspecting={inspecting}
            onInspect={async () => {
              if (!tab) return;
              try {
                await ensureContent(tab.tabId);
                setInspecting(true);
                await forward(tab.tabId, { type: 'INSPECT_START' });
              } catch (err) {
                setInspecting(false);
                setError(err instanceof Error ? err.message : 'Could not start inspector.');
              }
            }}
            onCancel={async () => {
              if (!tab) return;
              await forward(tab.tabId, { type: 'INSPECT_STOP' });
              setInspecting(false);
            }}
          />
        )}
      </main>
    </div>
  );
}

function Overview({
  scannedAt,
  results,
  manualDone,
  onOpenIssues,
  onExportMd,
  onExportJson,
  onCopy,
  copied,
}: {
  scannedAt: string | null;
  results: AuditResult[];
  manualDone: number;
  onOpenIssues: () => void;
  onExportMd: () => void;
  onExportJson: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  if (!scannedAt) {
    return (
      <div className="empty">
        <p>Survey this page the way you would walk a site: automated waypoints first, then human review.</p>
        <p>Start a review to collect errors, warnings, and items that still need judgment.</p>
      </div>
    );
  }
  return (
    <div className="stack">
      <p className="lede">
        Automated checks found {countBy(results, 'error')} errors and {countBy(results, 'review')} items that need a
        person. This is not a compliance score.
      </p>
      <button type="button" className="text-btn" onClick={onOpenIssues}>
        Open issue list
      </button>
      <div className="export">
        <button type="button" className="secondary" onClick={onExportMd}>
          Export Markdown
        </button>
        <button type="button" className="secondary" onClick={onExportJson}>
          Export JSON
        </button>
        <button type="button" className="secondary" onClick={onCopy}>
          {copied ? 'Copied' : 'Copy Markdown'}
        </button>
      </div>
      <p className="quiet">Manual review {manualDone} / {MANUAL_CHECKS.length}</p>
    </div>
  );
}

function Issues({
  results,
  selectedId,
  selected,
  selectedRule,
  showWcag,
  severityFilter,
  categoryFilter,
  categories,
  onFilterSeverity,
  onFilterCategory,
  onSelect,
  onLocate,
  onCopy,
  copiedSelector,
}: {
  results: AuditResult[];
  selectedId: string | null;
  selected: AuditResult | null;
  selectedRule: ReturnType<typeof ruleById.get>;
  showWcag: boolean;
  severityFilter: 'all' | Severity;
  categoryFilter: string;
  categories: string[];
  onFilterSeverity: (v: 'all' | Severity) => void;
  onFilterCategory: (v: string) => void;
  onSelect: (item: AuditResult) => void;
  onLocate: (item: AuditResult) => void;
  onCopy: (item: AuditResult) => void;
  copiedSelector: string | null;
}) {
  useEffect(() => {
    if (!selectedId) return;
    document.getElementById(`issue-${selectedId}`)?.scrollIntoView({ block: 'start' });
  }, [selectedId]);

  return (
    <div className="split">
      <div className="filters">
        <label>
          Severity
          <select
            value={severityFilter}
            onChange={(e) => onFilterSeverity(e.target.value as 'all' | Severity)}
          >
            <option value="all">All</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="review">Review</option>
            <option value="info">Info</option>
            <option value="passed">Passed</option>
          </select>
        </label>
        <label>
          Category
          <select value={categoryFilter} onChange={(e) => onFilterCategory(e.target.value)}>
            <option value="all">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c as keyof typeof CATEGORY_LABEL] ?? c}
              </option>
            ))}
          </select>
        </label>
      </div>
      {results.length === 0 ? (
        <p className="empty">No findings in this filter. Run a review or change the filters.</p>
      ) : (
        <ul className="waypoints">
          {results.map((item) => {
            const rule = ruleById.get(item.ruleId);
            const open = item.id === selectedId && selected && selectedRule && item.id === selected.id;
            return (
              <li key={item.id} id={`issue-${item.id}`} className={open ? 'waypoint-item is-open' : 'waypoint-item'}>
                <button
                  type="button"
                  className={item.id === selectedId ? 'waypoint is-selected' : 'waypoint'}
                  aria-expanded={item.id === selectedId}
                  aria-controls={open ? `review-${item.id}` : undefined}
                  onClick={() => onSelect(item)}
                >
                  <span className={`mark mark-${item.status}`} aria-hidden="true">
                    {SEVERITY_MARK[item.status]}
                  </span>
                  <span>
                    <span className="waypoint-title">{rule?.title ?? item.message}</span>
                    <span className="waypoint-meta">
                      {SEVERITY_LABEL[item.status]}
                      {item.element ? ` · ${item.element.selector}` : ''}
                    </span>
                  </span>
                </button>
                {open && selected && selectedRule && (
                  <IssueDossier
                    id={`review-${item.id}`}
                    selected={selected}
                    selectedRule={selectedRule}
                    showWcag={showWcag}
                    onLocate={onLocate}
                    onCopy={onCopy}
                    copiedSelector={copiedSelector}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function IssueDossier({
  id,
  selected,
  selectedRule,
  showWcag,
  onLocate,
  onCopy,
  copiedSelector,
}: {
  id: string;
  selected: AuditResult;
  selectedRule: NonNullable<ReturnType<typeof ruleById.get>>;
  showWcag: boolean;
  onLocate: (item: AuditResult) => void;
  onCopy: (item: AuditResult) => void;
  copiedSelector: string | null;
}) {
  return (
        <article id={id} className="dossier" aria-live="polite">
          <header>
            <p className={`mark mark-${selected.status}`}>
              {SEVERITY_MARK[selected.status]} {SEVERITY_LABEL[selected.status]}
            </p>
            <h2>{selectedRule.title}</h2>
          </header>
          <p>{selected.message}</p>
          <dl>
            <div>
              <dt>Category</dt>
              <dd>{CATEGORY_LABEL[selectedRule.category]}</dd>
            </div>
            <div>
              <dt>Rule</dt>
              <dd>
                <code>{selected.ruleId}</code>
              </dd>
            </div>
            {selected.element && (
              <div>
                <dt>Element</dt>
                <dd>
                  <code>{selected.element.selector}</code>
                </dd>
              </div>
            )}
            {showWcag && selectedRule.wcag && (
              <div>
                <dt>Related WCAG</dt>
                <dd>{selectedRule.wcag.map(wcagLabel).join('; ')}</dd>
              </div>
            )}
          </dl>
          <p>
            <strong>Why this matters.</strong> {selectedRule.whyItMatters}
          </p>
          {selectedRule.suggestedReview && (
            <p>
              <strong>Suggested review.</strong> {selectedRule.suggestedReview}
            </p>
          )}
          {selectedRule.possibleApproaches && (
            <div>
              <p>
                <strong>Possible approaches</strong>
              </p>
              <ul>
                {selectedRule.possibleApproaches.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="export">
            {selected.element && (
              <>
                <button type="button" className="secondary" onClick={() => onLocate(selected)}>
                  Locate element
                </button>
                <button type="button" className="secondary" onClick={() => onCopy(selected)}>
                  {copiedSelector && copiedSelector.includes(selected.element.selector)
                    ? 'Copied'
                    : 'Copy selector'}
                </button>
              </>
            )}
          </div>
        </article>
  );
}

function Structure({
  structure,
  overlay,
  onOverlay,
  onLocate,
}: {
  structure: StructureSnapshot | null;
  overlay: OverlayMode['id'];
  onOverlay: (mode: OverlayMode['id']) => void;
  onLocate: (id: string) => void;
}) {
  if (!structure) {
    return <p className="empty">Start a review to map headings and landmarks.</p>;
  }
  return (
    <div className="stack">
      <label>
        Page overlay
        <select value={overlay} onChange={(e) => onOverlay(e.target.value as OverlayMode['id'])}>
          {OVERLAY_MODES.map((mode) => (
            <option key={mode.id} value={mode.id}>
              {mode.label}
            </option>
          ))}
        </select>
      </label>
      <section>
        <h2 className="kicker">Headings</h2>
        <ol className="outline">
          {structure.headings.map((h) => (
            <li key={h.id} style={{ marginLeft: (h.level - 1) * 12 }}>
              <button type="button" className="text-btn" onClick={() => onLocate(h.element.id)}>
                H{h.level} {h.name || '(empty)'}
              </button>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h2 className="kicker">Landmarks</h2>
        <ul className="outline">
          {structure.landmarks.map((l) => (
            <li key={l.id}>
              <button type="button" className="text-btn" onClick={() => onLocate(l.element.id)}>
                {l.role.toUpperCase()}
                {l.name ? ` — ${l.name}` : ''}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function KeyboardView({
  path,
  on,
  manual,
  onToggle,
  onReset,
  onManual,
}: {
  path: KeyboardStep[];
  on: boolean;
  manual: Record<string, ManualCheckState>;
  onToggle: () => void;
  onReset: () => void;
  onManual: (id: string, patch: Partial<ManualCheckState>) => void;
}) {
  const grouped = checksByCategory();
  return (
    <div className="stack">
      <p>
        Navigate this page using only the keyboard. A11yCompass records the focus path. It does not certify that the
        page is keyboard accessible.
      </p>
      <div className="export">
        <button type="button" className="primary" onClick={onToggle}>
          {on ? 'Stop keyboard review' : 'Start keyboard review'}
        </button>
        <button type="button" className="secondary" onClick={onReset} disabled={!path.length}>
          Clear path
        </button>
      </div>
      {on && (
        <p className="quiet" role="status">
          Tab through the page. Focus is listed below.
        </p>
      )}
      <ol className="path">
        {path.map((step) => (
          <li key={`${step.index}-${step.selector}`}>
            <span className={step.warning ? 'warn' : ''}>
              {step.index} {step.warning ? '⚠' : '✓'} {step.name}
            </span>
            <code>{step.selector}</code>
          </li>
        ))}
      </ol>
      {[...grouped.entries()].map(([category, checks]) => (
        <section key={category} className="checklist">
          <h2>{category}</h2>
          {checks.map((check) => {
            const state = manual[check.id] ?? { status: 'not-reviewed', note: '' };
            return (
              <fieldset key={check.id}>
                <legend>{check.label}</legend>
                <div className="seg">
                  {(['pass', 'fail', 'not-applicable', 'not-reviewed'] as const).map((status) => (
                    <label key={status}>
                      <input
                        type="radio"
                        name={check.id}
                        checked={state.status === status}
                        onChange={() => onManual(check.id, { status })}
                      />
                      {status === 'not-reviewed'
                        ? 'Not reviewed'
                        : status === 'not-applicable'
                          ? 'N/A'
                          : status[0].toUpperCase() + status.slice(1)}
                    </label>
                  ))}
                </div>
                <label className="note">
                  Note
                  <textarea
                    value={state.note}
                    onChange={(e) => onManual(check.id, { note: e.target.value })}
                    rows={2}
                  />
                </label>
              </fieldset>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function InspectorView({
  snapshot,
  inspecting,
  onInspect,
  onCancel,
}: {
  snapshot: InspectorSnapshot | null;
  inspecting: boolean;
  onInspect: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="stack">
      <p>Pick an element on the page to see role, accessible name, name source, and contrast.</p>
      <div className="export">
        {!inspecting ? (
          <button type="button" className="primary" onClick={onInspect}>
            Inspect element
          </button>
        ) : (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel inspect
          </button>
        )}
      </div>
      {inspecting && (
        <p className="quiet" role="status">
          Click an element on the page.
        </p>
      )}
      {snapshot ? (
        <dl className="inspect">
          <div>
            <dt>Element</dt>
            <dd>
              <code>{snapshot.htmlPreview}</code>
            </dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{snapshot.role}</dd>
          </div>
          <div>
            <dt>Accessible name</dt>
            <dd>{snapshot.name.name ? `“${snapshot.name.name}”` : 'None'}</dd>
          </div>
          <div>
            <dt>Name source</dt>
            <dd>{snapshot.name.source}</dd>
          </div>
          <div>
            <dt>Description</dt>
            <dd>{snapshot.description}</dd>
          </div>
          <div>
            <dt>Focusable</dt>
            <dd>{snapshot.focusable ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt>Tab index</dt>
            <dd>{snapshot.tabIndex}</dd>
          </div>
          <div>
            <dt>ARIA</dt>
            <dd>
              {Object.keys(snapshot.aria).length
                ? Object.entries(snapshot.aria)
                    .map(([k, v]) => `${k}="${v}"`)
                    .join(', ')
                : 'None'}
            </dd>
          </div>
          {snapshot.contrast && (
            <div>
              <dt>Contrast</dt>
              <dd>
                {snapshot.contrast.foreground} on {snapshot.contrast.background} · {snapshot.contrast.ratio}:1 ·{' '}
                {snapshot.contrast.result}
                {snapshot.contrast.note ? ` — ${snapshot.contrast.note}` : ''}
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="empty">No element selected.</p>
      )}
    </div>
  );
}
