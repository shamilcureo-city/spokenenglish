import type { SkillFamily, SkillLifecycle } from '@fluentmap/core/science';

/** Map a skill's live mastery + lifecycle to its node colour on the brain map. */
export function masteryColor(mastery: number, state: SkillLifecycle): string {
  if (state === 'new' || mastery < 0.02) return '#2b3040'; // untouched (grey)
  if (state === 'mastered') return '#f4c430'; // gold
  if (mastery >= 0.6) return '#34d399'; // review (green)
  return '#f59e0b'; // learning (amber)
}

export const FAMILY_LABEL: Record<SkillFamily, string> = {
  grammar: 'Grammar',
  function: 'Functions',
  lexis: 'Vocabulary',
  phoneme: 'Pronunciation',
};

export const FAMILY_ORDER: SkillFamily[] = ['grammar', 'function', 'lexis', 'phoneme'];
