/**
 * Concept-mastery memory (redesign Phase 2) — the retention moat.
 *
 * Every spoken attempt leaves evidence: a phrase the learner tried (how clearly it
 * landed) and the individual words that tripped them up. We track a running mastery
 * per concept (an EMA of outcomes) so we can resurface the WEAKEST things first and
 * show real improvement over time — the thing Speak does and no other voice app
 * bothers to. Pure + platform-agnostic; persisted by the app (and, later, synced).
 */

import type { UtteranceScore } from './pronunciation.js';

export type ConceptKind = 'phrase' | 'word';

export interface MasteryItem {
  /** Stable id, e.g. "phrase:could-i-get" or "word:village". */
  id: string;
  /** Human label to show + (for phrases) to re-practise. */
  label: string;
  kind: ConceptKind;
  /** 0..1 running mastery (EMA of outcomes); higher = more reliable. */
  mastery: number;
  /** How many times we've seen it. */
  attempts: number;
}

export interface Evidence {
  id: string;
  label: string;
  kind: ConceptKind;
  /** 0..1 outcome of this attempt. */
  outcome: number;
}

export type MasteryState = Record<string, MasteryItem>;

/** EMA weight on the newest attempt — responsive but not jumpy. */
const ALPHA = 0.45;
/** New concepts start from a neutral prior, so one lucky/unlucky sample can't pin
 *  mastery to an extreme — "mastered" then needs a couple of good attempts. */
const NEUTRAL_PRIOR = 0.5;
/** At/above this, a concept counts as "mastered". */
export const MASTERED = 0.8;

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/** Fold new evidence into the mastery state (immutably). */
export function recordEvidence(state: MasteryState, evidence: Evidence[]): MasteryState {
  if (evidence.length === 0) return state;
  const next: MasteryState = { ...state };
  for (const e of evidence) {
    const outcome = Math.max(0, Math.min(1, e.outcome));
    const prev = next[e.id];
    const base = prev ? prev.mastery : NEUTRAL_PRIOR;
    const mastery = base * (1 - ALPHA) + outcome * ALPHA;
    next[e.id] = {
      id: e.id,
      label: e.label,
      kind: e.kind,
      mastery,
      attempts: (prev?.attempts ?? 0) + 1,
    };
  }
  return next;
}

/** Derive evidence from one scored say-it attempt (phrase + the words worth tracking). */
export function evidenceFromUtterance(phrase: string, score: UtteranceScore): Evidence[] {
  const ev: Evidence[] = [
    { id: `phrase:${slugify(phrase)}`, label: phrase.trim(), kind: 'phrase', outcome: score.intelligible / 100 },
  ];
  for (const w of score.words) {
    if (w.word.length < 4) continue; // skip short function words ("a", "in", "to")
    ev.push({
      id: `word:${w.word.toLowerCase()}`,
      label: w.word,
      kind: 'word',
      outcome: w.status === 'good' ? 1 : w.status === 'close' ? 0.5 : 0,
    });
  }
  return ev;
}

/** The weakest concepts to resurface, weakest-first (only those not yet mastered). */
export function weakestConcepts(
  state: MasteryState,
  n = 5,
  opts?: { kind?: ConceptKind; threshold?: number },
): MasteryItem[] {
  const thr = opts?.threshold ?? MASTERED;
  return Object.values(state)
    .filter((m) => (opts?.kind ? m.kind === opts.kind : true) && m.mastery < thr)
    .sort((a, b) => a.mastery - b.mastery || b.attempts - a.attempts)
    .slice(0, Math.max(0, n));
}

/**
 * Keep the store bounded (localStorage is ~5 MB). When over `max`, drop the
 * most-mastered concepts first — they're the least useful to resurface, and the
 * weakest (the moat) are always kept.
 */
export function pruneMastery(state: MasteryState, max = 500): MasteryState {
  const all = Object.values(state);
  if (all.length <= max) return state;
  const kept = all.sort((a, b) => a.mastery - b.mastery).slice(0, max);
  const next: MasteryState = {};
  for (const m of kept) next[m.id] = m;
  return next;
}

export interface MasteryStats {
  tracked: number;
  mastered: number;
  working: number;
}

export function masteryStats(state: MasteryState, threshold = MASTERED): MasteryStats {
  const all = Object.values(state);
  const mastered = all.filter((m) => m.mastery >= threshold).length;
  return { tracked: all.length, mastered, working: all.length - mastered };
}
