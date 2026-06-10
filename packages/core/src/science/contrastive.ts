/**
 * Contrastive analysis engine — diagnoses *why* a learner made an error by
 * attributing it to a likely mother-tongue (L1) transfer pattern, and surfaces
 * the correction explanation in that mother tongue.
 *
 * Flow (per the architecture):
 *   1. `candidateRules(text, l1)` — cheap, L1-restricted regex pre-filter →
 *      candidate rule ids.
 *   2. The Gemini scoring pass picks the single best `ruleId` from candidates.
 *   3. `tagError({ l1, ruleId })` → the skill, the cause, and the mother-tongue
 *      explanation for the correction + its review item.
 *
 * PURE. Rules can be injected for testing; defaults to the seed KB.
 */

import { L1_TRANSFER_RULES } from './l1-rules.js';
import type { L1, L1TransferRule } from './types.js';

export interface TaggedError {
  skillId: string;
  l1RuleId: string;
  title: string;
  cause: string;
  /** Resolved in the learner's mother tongue (falls back to the English cause). */
  explanation: string;
}

/** Rules whose regex triggers fire for `text`, restricted to the learner's L1. */
export function candidateRules(
  text: string,
  l1: L1,
  rules: L1TransferRule[] = L1_TRANSFER_RULES,
): L1TransferRule[] {
  return rules
    .filter((r) => r.l1 === l1)
    .filter((r) =>
      r.triggers.some(
        (t) => t.kind === 'regex' && !!t.pattern && new RegExp(t.pattern, 'i').test(text),
      ),
    );
}

export function getRule(
  id: string,
  rules: L1TransferRule[] = L1_TRANSFER_RULES,
): L1TransferRule | undefined {
  return rules.find((r) => r.id === id);
}

/** The mother-tongue explanation, falling back to the English cause. */
export function resolveExplanation(rule: L1TransferRule, l1: L1): string {
  return rule.explanations[l1] ?? rule.cause;
}

/**
 * Attribute an error to a transfer rule and produce the correction metadata.
 *
 * Provide an explicit `ruleId` (chosen by the scoring pass) for the authoritative
 * path; otherwise the first matching candidate for `text` is used as a heuristic.
 * Returns `null` when nothing matches.
 */
export function tagError(input: {
  l1: L1;
  ruleId?: string | null;
  text?: string;
  rules?: L1TransferRule[];
}): TaggedError | null {
  const rules = input.rules ?? L1_TRANSFER_RULES;

  let rule: L1TransferRule | undefined;
  if (input.ruleId) {
    rule = getRule(input.ruleId, rules);
  } else if (input.text) {
    rule = candidateRules(input.text, input.l1, rules)[0];
  }
  if (!rule) return null;

  return {
    skillId: rule.skillId,
    l1RuleId: rule.id,
    title: rule.title,
    cause: rule.cause,
    explanation: resolveExplanation(rule, input.l1),
  };
}

/** All distinct skill ids referenced by the KB (for cross-checking the taxonomy). */
export function referencedSkillIds(rules: L1TransferRule[] = L1_TRANSFER_RULES): string[] {
  return [...new Set(rules.map((r) => r.skillId))];
}
