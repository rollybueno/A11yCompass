import type { AuditResult, ManualCheckState, ReviewSession } from '../shared/types';
import { CATEGORY_LABEL, SEVERITY_LABEL } from '../shared/labels';
import { wcagLabel } from '../shared/wcag';
import { ruleById } from '../rules';
import { MANUAL_CHECKS } from './checklists';

function group(results: AuditResult[], status: AuditResult['status']): AuditResult[] {
  return results.filter((r) => r.status === status);
}

function issueBlock(result: AuditResult): string {
  const rule = ruleById.get(result.ruleId);
  const wcag = (result.wcag ?? []).map((id) => `- ${wcagLabel(id)}`).join('\n');
  const lines = [
    `### ${rule?.title ?? result.message}`,
    '',
    `Rule: \`${result.ruleId}\``,
    '',
    result.message,
  ];
  if (result.element) {
    lines.push('', `Element: \`${result.element.selector}\``);
  }
  if (wcag) {
    lines.push('', 'Related WCAG:', wcag);
  }
  if (rule?.whyItMatters) {
    lines.push('', `Why this matters: ${rule.whyItMatters}`);
  }
  return lines.join('\n');
}

export function exportMarkdown(session: ReviewSession): string {
  const { results, summary, manual } = session;
  const completed = Object.values(manual).filter((m) => m.status !== 'not-reviewed').length;
  const sections = ['error', 'warning', 'review'] as const;
  const parts = [
    '# Accessibility Review',
    '',
    `URL: ${summary.url}`,
    '',
    '## Summary',
    '',
    `- Errors: ${summary.errors}`,
    `- Warnings: ${summary.warnings}`,
    `- Review: ${summary.review}`,
    `- Passed: ${summary.passed}`,
    `- Manual review: ${completed} / ${MANUAL_CHECKS.length} completed`,
    '',
    'Automated checks cannot determine complete accessibility conformance.',
    '',
  ];

  for (const status of sections) {
    const items = group(results, status);
    if (!items.length) continue;
    parts.push(`## ${SEVERITY_LABEL[status]}s`, '');
    for (const item of items) parts.push(issueBlock(item), '');
  }

  parts.push('## Manual Review', '');
  let current = '';
  for (const check of MANUAL_CHECKS) {
    if (check.category !== current) {
      current = check.category;
      parts.push(`### ${current}`, '');
    }
    const state: ManualCheckState = manual[check.id] ?? { status: 'not-reviewed', note: '' };
    const mark =
      state.status === 'pass' ? 'x' : state.status === 'fail' ? '!' : state.status === 'not-applicable' ? '-' : ' ';
    const suffix =
      state.status === 'fail' ? ' (fail)' : state.status === 'not-applicable' ? ' (n/a)' : '';
    parts.push(`- [${mark}] ${check.label}${suffix}`);
    if (state.note) parts.push('', `  Reviewer note: ${state.note}`, '');
  }

  void CATEGORY_LABEL;
  return parts.join('\n').trim() + '\n';
}

export function exportJson(session: ReviewSession): string {
  return JSON.stringify(
    {
      product: 'A11yCompass',
      disclaimer: 'Automated checks cannot determine complete accessibility conformance.',
      url: session.summary.url,
      title: session.summary.title,
      scannedAt: session.summary.scannedAt,
      summary: session.summary,
      results: session.results,
      manual: session.manual,
      keyboardPath: session.keyboardPath,
    },
    null,
    2,
  );
}
