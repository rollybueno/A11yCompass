import type { AccessibilityRule } from '../shared/types';
import { imageRules } from './images';
import { formRules } from './forms';
import { linkRules } from './links';
import { headingRules } from './headings';
import { landmarkRules } from './landmarks';
import { ariaRules } from './aria';
import { keyboardRules } from './keyboard';
import { contrastRules } from './contrast';
import { documentRules } from './document';

export const rules: AccessibilityRule[] = [
  ...imageRules,
  ...formRules,
  ...linkRules,
  ...headingRules,
  ...landmarkRules,
  ...ariaRules,
  ...keyboardRules,
  ...contrastRules,
  ...documentRules,
];

export const ruleById = new Map(rules.map((rule) => [rule.id, rule]));
