/**
 * Map metrics — the numbers the "Science Map" surface renders. All pure and
 * recomputed live at `now`, so the forgetting curve is visible (mastery cools as
 * time passes since the last review). Shared by web and native.
 */

import { computeMastery, deriveLifecycle } from './mastery.js';
import { retrievability } from './fsrs.js';
import type { Cefr, Skill, SkillState } from './types.js';

export const CEFR_BANDS: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const CEFR_ORDER: Record<Cefr, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4 };

const DAY_MS = 86_400_000;

/** Live mastery (recomputed at `now`) for a state, or 0 if untouched/missing. */
export function liveMastery(state: SkillState | undefined, now: Date): number {
  if (!state) return 0;
  return computeMastery(state, now);
}

function liveLifecycle(state: SkillState, now: Date): string {
  return deriveLifecycle(computeMastery(state, now), state.stability, state.reps);
}

function stateMap(states: SkillState[]): Map<string, SkillState> {
  return new Map(states.map((s) => [s.skillId, s]));
}

/**
 * Overall FluentMap Score (0..100): a CEFR-weighted mean of live mastery across
 * the whole taxonomy. Foundational (lower-CEFR) skills are weighted more, so the
 * score reflects a solid base before advanced polish.
 */
export function fluentMapScore(states: SkillState[], skills: Skill[], now: Date): number {
  const by = stateMap(states);
  let num = 0;
  let den = 0;
  for (const sk of skills) {
    const w = 5 - CEFR_ORDER[sk.cefr]; // A1→5 ... C1→1
    num += liveMastery(by.get(sk.id), now) * w;
    den += w;
  }
  return den === 0 ? 0 : Math.round((100 * num) / den);
}

export interface BandCoverage {
  band: Cefr;
  total: number;
  mastered: number;
  pct: number; // 0..100
}

/** Per-CEFR-band coverage: how many of each band's skills are mastered. */
export function cefrCoverage(states: SkillState[], skills: Skill[], now: Date): BandCoverage[] {
  const by = stateMap(states);
  return CEFR_BANDS.map((band) => {
    const inBand = skills.filter((sk) => sk.cefr === band);
    const mastered = inBand.filter((sk) => {
      const st = by.get(sk.id);
      return st ? liveLifecycle(st, now) === 'mastered' : false;
    }).length;
    const total = inBand.length;
    return { band, total, mastered, pct: total === 0 ? 0 : Math.round((100 * mastered) / total) };
  });
}

/** Count of skills currently at the "mastered" lifecycle. */
export function countMastered(states: SkillState[], now: Date): number {
  return states.filter((s) => liveLifecycle(s, now) === 'mastered').length;
}

/** Count of touched skills whose review is due now or overdue. */
export function dueCount(states: SkillState[], now: Date): number {
  return states.filter((s) => s.reps > 0 && s.dueAt !== null && new Date(s.dueAt) <= now).length;
}

/**
 * Retention %: mean retrievability across touched skills — "how much of what
 * you've learned is still fresh right now".
 */
export function retentionPercent(states: SkillState[], now: Date): number {
  const touched = states.filter((s) => s.reps > 0 && s.stability > 0);
  if (touched.length === 0) return 0;
  const total = touched.reduce((acc, s) => {
    const elapsed = s.lastReviewedAt
      ? Math.max(0, (now.getTime() - new Date(s.lastReviewedAt).getTime()) / DAY_MS)
      : 0;
    return acc + retrievability(elapsed, s.stability);
  }, 0);
  return Math.round((100 * total) / touched.length);
}

export interface RankedSkill {
  skill: Skill;
  mastery: number;
}

/** The n weakest *touched* skills (lowest live mastery). */
export function weakestSkills(
  states: SkillState[],
  skills: Skill[],
  n: number,
  now: Date,
): RankedSkill[] {
  const skillById = new Map(skills.map((s) => [s.id, s]));
  return states
    .filter((s) => s.reps > 0 && skillById.has(s.skillId))
    .map((s) => ({ skill: skillById.get(s.skillId)!, mastery: computeMastery(s, now) }))
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, n);
}

/** Skills that reached "mastered" on/after `since` (by updatedAt). */
export function masteredSince(states: SkillState[], skills: Skill[], since: Date, now: Date): Skill[] {
  const skillById = new Map(skills.map((s) => [s.id, s]));
  return states
    .filter(
      (s) =>
        liveLifecycle(s, now) === 'mastered' &&
        new Date(s.updatedAt).getTime() >= since.getTime() &&
        skillById.has(s.skillId),
    )
    .map((s) => skillById.get(s.skillId)!);
}

export interface ClusterSummary {
  cluster: string;
  family: Skill['family'];
  total: number;
  touched: number;
  mastered: number;
  avgMastery: number; // 0..1
}

/** Per-cluster rollup for the brain map (grouped, ordered by family then cluster). */
export function clusterSummary(states: SkillState[], skills: Skill[], now: Date): ClusterSummary[] {
  const by = stateMap(states);
  const groups = new Map<string, Skill[]>();
  for (const sk of skills) {
    const key = `${sk.family}::${sk.cluster}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(sk);
  }
  const out: ClusterSummary[] = [];
  for (const [key, group] of groups) {
    const [family, cluster] = key.split('::') as [Skill['family'], string];
    let sum = 0;
    let touched = 0;
    let mastered = 0;
    for (const sk of group) {
      const st = by.get(sk.id);
      const m = liveMastery(st, now);
      sum += m;
      if (st && st.reps > 0) touched += 1;
      if (st && liveLifecycle(st, now) === 'mastered') mastered += 1;
    }
    out.push({ cluster, family, total: group.length, touched, mastered, avgMastery: sum / group.length });
  }
  return out;
}
