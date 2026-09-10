import type { AccessibilityRule, AuditResult } from '../shared/types';

export function resultFrom(
  rule: AccessibilityRule,
  status: AuditResult['status'],
  message: string,
  extra: Partial<AuditResult> = {},
): AuditResult {
  return {
    id: `${rule.id}:${extra.element?.id ?? extra.id ?? Math.random().toString(36).slice(2, 8)}`,
    ruleId: rule.id,
    status,
    message,
    wcag: rule.wcag,
    ...extra,
  };
}
