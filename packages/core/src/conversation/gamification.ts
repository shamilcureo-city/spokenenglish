/**
 * Gamification — pure scoring + XP/level math + a HUMANE streak.
 * Turns a finished lesson into stars + XP (the "earned lesson" reward loop) and
 * powers the daily-habit mechanics (see METHOD.md → the habit loop).
 */

import type { Recap } from './types.js';
import type { Lesson } from './curriculum.js';

export interface LessonScore {
  /** 1–3 stars. */
  stars: number;
  /** XP earned this attempt. */
  xp: number;
  /** Which of the lesson's target phrases the learner actually used. */
  usedMoves: string[];
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Which target phrases the learner actually used (loose match on the distinctive core). */
export function usedMoves(
  lesson: Lesson,
  transcript: { speaker: 'ai' | 'learner'; text: string }[],
): string[] {
  const said = norm(transcript.filter((t) => t.speaker === 'learner').map((t) => t.text).join(' '));
  if (!said) return [];
  return lesson.phrases.filter((p) => {
    // Match on the first 2–3 distinctive words of the phrase (ignores "…", punctuation, casing).
    const core = norm(p).split(' ').slice(0, 3).join(' ');
    return core.length > 2 && said.includes(core);
  });
}

/**
 * Score a finished lesson → stars (1–3) + XP. Blends delivery (the recap's
 * dimensions) with whether they actually used the target moves, so both
 * "spoke well" and "used the lesson" matter.
 */
export function scoreLesson(
  recap: Recap,
  lesson: Lesson,
  transcript: { speaker: 'ai' | 'learner'; text: string }[],
): LessonScore {
  const moves = usedMoves(lesson, transcript);
  const d = recap.dimensions;
  const deliveryAvg = (d.clarity + d.concision + d.confidence + d.structure + d.filler) / 5 / 100; // 0..1
  const moveRatio = lesson.phrases.length ? moves.length / lesson.phrases.length : 0;
  const blend = 0.5 * deliveryAvg + 0.5 * moveRatio; // 0..1
  const stars = blend >= 0.66 ? 3 : blend >= 0.4 ? 2 : 1;
  const xp = 10 + stars * 5 + moves.length * 2; // base + star bonus + per-move
  return { stars, xp, usedMoves: moves };
}

/** XP awarded for a daily free-talk (rewards the habit, lighter than a lesson). */
export const WARMUP_XP = 8;

/* ── XP → level (simple, predictable: 100 XP per level) ── */
export const XP_PER_LEVEL = 100;

export function levelForXp(xp: number): number {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
}

export function xpIntoLevel(xp: number): { level: number; into: number; needed: number; pct: number } {
  const level = levelForXp(xp);
  const into = Math.max(0, xp) - (level - 1) * XP_PER_LEVEL;
  return { level, into, needed: XP_PER_LEVEL, pct: Math.round((into / XP_PER_LEVEL) * 100) };
}

/**
 * A HUMANE streak: counts consecutive practised days ending today (or yesterday),
 * but **bridges a single missed day** (a built-in freeze) so one slip doesn't nuke
 * the habit — only a second consecutive miss ends the run. `dayKeys` are yyyy-mm-dd
 * local dates; `shift(n)` returns the key for n days ago (injected, clock-free).
 */
export function humaneStreak(dayKeys: string[], shift: (daysAgo: number) => string): number {
  const set = new Set(dayKeys);
  let i = set.has(shift(0)) ? 0 : set.has(shift(1)) ? 1 : -1;
  if (i < 0) return 0;
  let streak = 0;
  let usedFreeze = false;
  for (; ; i++) {
    if (set.has(shift(i))) {
      streak++;
      continue;
    }
    // Missed day i — bridge it once if the day before it was practised.
    if (!usedFreeze && set.has(shift(i + 1))) {
      usedFreeze = true;
      continue;
    }
    break;
  }
  return streak;
}
