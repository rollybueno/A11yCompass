export const WCAG: Record<string, string> = {
  '1.1.1': '1.1.1 Non-text Content',
  '1.3.1': '1.3.1 Info and Relationships',
  '1.3.2': '1.3.2 Meaningful Sequence',
  '1.4.3': '1.4.3 Contrast (Minimum)',
  '1.4.11': '1.4.11 Non-text Contrast',
  '2.1.1': '2.1.1 Keyboard',
  '2.1.2': '2.1.2 No Keyboard Trap',
  '2.4.1': '2.4.1 Bypass Blocks',
  '2.4.2': '2.4.2 Page Titled',
  '2.4.3': '2.4.3 Focus Order',
  '2.4.4': '2.4.4 Link Purpose (In Context)',
  '2.4.6': '2.4.6 Headings and Labels',
  '2.4.7': '2.4.7 Focus Visible',
  '3.1.1': '3.1.1 Language of Page',
  '4.1.1': '4.1.1 Parsing',
  '4.1.2': '4.1.2 Name, Role, Value',
};

export function wcagLabel(id: string): string {
  return WCAG[id] ?? id;
}
