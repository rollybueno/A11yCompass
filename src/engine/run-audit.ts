import type { AuditContext, AuditResult } from '../shared/types';
import { rules } from '../rules';

export async function runAudit(
  context: AuditContext,
  options: { includePassed?: boolean; runContrast?: boolean } = {},
): Promise<AuditResult[]> {
  const out: AuditResult[] = [];
  for (const rule of rules) {
    if (!options.runContrast && rule.category === 'contrast') continue;
    const results = await rule.run(context);
    for (const result of results) {
      if (!options.includePassed && result.status === 'passed') continue;
      out.push(result);
    }
  }
  return out;
}
