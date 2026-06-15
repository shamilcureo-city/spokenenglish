/**
 * The course — a leveled, communicative (function-based) spoken-English syllabus.
 * Pure DATA + helpers, so new lessons ship without code. Three levels → units →
 * lessons; each lesson is one communication move practised live (Learn → Speak →
 * Feedback). `LESSONS` is in course order; the helpers gate unlocking sequentially
 * and respect a placement starting unit.
 */

import { LESSONS } from './lessons.data.js';

export type LevelId = 'foundation' | 'intermediate' | 'advanced';

export interface Level {
  id: LevelId;
  title: string;
  subtitle: string;
}

export interface Unit {
  id: string;
  levelId: LevelId;
  title: string;
  subtitle: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  levelId: LevelId;
  title: string;
  /** The communicative goal, e.g. "Disagree politely". */
  fn: string;
  /** CEFR-style can-do statement. */
  canDo: string;
  /** 5–8 target phrases/moves taught in the "Learn" step. */
  phrases: string[];
  /** How the AI partner sets up & runs the live practice (the primary variant). */
  scenario: string;
  /** Extra scenario variations, so a redo of the same lesson feels fresh. */
  variants?: string[];
  /** Optional plain-English tip about a common mistake. */
  l1Note?: string;
}

export const LEVELS: Level[] = [
  { id: 'foundation', title: 'Foundation', subtitle: 'Everyday survival & confidence' },
  { id: 'intermediate', title: 'Intermediate', subtitle: 'Connect, discuss & work-ready' },
  { id: 'advanced', title: 'Advanced', subtitle: 'Influence, nuance & impact' },
];

export const UNITS: Unit[] = [
  // Foundation
  { id: 'f1', levelId: 'foundation', title: 'First contact', subtitle: 'Hellos, introductions, goodbyes' },
  { id: 'f2', levelId: 'foundation', title: 'Everyday life', subtitle: 'Routine, likes, family' },
  { id: 'f3', levelId: 'foundation', title: 'Out & about', subtitle: 'Order, shop, directions' },
  { id: 'f4', levelId: 'foundation', title: 'Getting things done', subtitle: 'Requests, permission, calls' },
  { id: 'f5', levelId: 'foundation', title: 'Past & future', subtitle: 'What you did & will do' },
  // Intermediate
  { id: 'i1', levelId: 'intermediate', title: 'Small talk', subtitle: 'Break the ice & keep it going' },
  { id: 'i2', levelId: 'intermediate', title: 'Opinions & discussion', subtitle: 'Give views, agree, disagree' },
  { id: 'i3', levelId: 'intermediate', title: 'Storytelling', subtitle: 'Narrate with detail & feeling' },
  { id: 'i4', levelId: 'intermediate', title: 'At work', subtitle: 'Introduce, describe, meet' },
  { id: 'i5', levelId: 'intermediate', title: 'Phone & online', subtitle: 'Calls, clarity, confirming' },
  { id: 'i6', levelId: 'intermediate', title: 'Handling problems', subtitle: 'Complain, apologise, fix' },
  // Advanced
  { id: 'a1', levelId: 'advanced', title: 'Present & explain', subtitle: 'Structure, clarity, Q&A' },
  { id: 'a2', levelId: 'advanced', title: 'Persuade & negotiate', subtitle: 'Make a case, push back' },
  { id: 'a3', levelId: 'advanced', title: 'Meetings & leadership', subtitle: 'Run, align, give feedback' },
  { id: 'a4', levelId: 'advanced', title: 'Interviews', subtitle: 'Answer well, sell strengths' },
  { id: 'a5', levelId: 'advanced', title: 'Fluency & nuance', subtitle: 'Natural phrasing & diplomacy' },
];

// Lesson data is generated into ./lessons.data.ts; re-exported here for the public API.
export { LESSONS };

/* ── lookups ── */
const LESSON_INDEX = new Map(LESSONS.map((l, i) => [l.id, i]));

export function lessonById(id: string): Lesson | undefined {
  const i = LESSON_INDEX.get(id);
  return i === undefined ? undefined : LESSONS[i];
}
export function unitById(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}
export function unitsByLevel(levelId: LevelId): Unit[] {
  return UNITS.filter((u) => u.levelId === levelId);
}
export function lessonsByUnit(unitId: string): Lesson[] {
  return LESSONS.filter((l) => l.unitId === unitId);
}
export function lessonsByLevel(levelId: LevelId): Lesson[] {
  return LESSONS.filter((l) => l.levelId === levelId);
}
export function firstLessonOfUnit(unitId: string): Lesson | undefined {
  return LESSONS.find((l) => l.unitId === unitId);
}

/** All scenario variants of a lesson (primary first). */
export function scenarios(lesson: Lesson): string[] {
  return [lesson.scenario, ...(lesson.variants ?? [])];
}

/** Pick a scenario for a given attempt (0-based) so redos rotate through the variants. */
export function pickScenario(lesson: Lesson, attempt = 0): string {
  const all = scenarios(lesson);
  const n = all.length;
  return all[((Math.trunc(attempt) % n) + n) % n]!;
}

function placementStartIndex(startUnitId?: string): number {
  if (!startUnitId) return 0;
  const i = LESSONS.findIndex((l) => l.unitId === startUnitId);
  return i < 0 ? 0 : i;
}

/** The next lesson to do: first incomplete from the placement start, else from the top. */
export function nextLesson(completedIds: string[], startUnitId?: string): Lesson | undefined {
  const done = new Set(completedIds);
  const start = placementStartIndex(startUnitId);
  for (let i = start; i < LESSONS.length; i++) if (!done.has(LESSONS[i]!.id)) return LESSONS[i];
  for (let i = 0; i < start; i++) if (!done.has(LESSONS[i]!.id)) return LESSONS[i];
  return undefined; // course complete
}

/** Furthest unlocked index = the current lesson's index (sequential gate + placement). */
function unlockedThrough(completedIds: string[], startUnitId?: string): number {
  const nl = nextLesson(completedIds, startUnitId);
  const ptr = nl ? LESSON_INDEX.get(nl.id)! : LESSONS.length - 1;
  return Math.max(placementStartIndex(startUnitId), ptr);
}

export function isLessonUnlocked(id: string, completedIds: string[], startUnitId?: string): boolean {
  const idx = LESSON_INDEX.get(id);
  if (idx === undefined) return false;
  return idx <= unlockedThrough(completedIds, startUnitId);
}

export interface Progress {
  done: number;
  total: number;
  pct: number;
}

export function levelProgress(levelId: LevelId, completedIds: string[]): Progress {
  const done = new Set(completedIds);
  const inLevel = lessonsByLevel(levelId);
  const d = inLevel.filter((l) => done.has(l.id)).length;
  const total = inLevel.length;
  return { done: d, total, pct: total ? Math.round((d / total) * 100) : 0 };
}

export function courseProgress(completedIds: string[]): Progress {
  const done = new Set(completedIds);
  const d = LESSONS.filter((l) => done.has(l.id)).length;
  return { done: d, total: LESSONS.length, pct: LESSONS.length ? Math.round((d / LESSONS.length) * 100) : 0 };
}

/**
 * Weak spots to resurface for review: completed lessons whose best score is under
 * 3 stars, weakest first (ties broken by course order). For the "review & improve"
 * nudge — spaced re-practice of exactly what didn't land.
 */
export function weakLessons(
  lessonStars: Record<string, number>,
  completedIds: string[],
  limit = 3,
): Lesson[] {
  return completedIds
    .map((id) => ({ lesson: lessonById(id), stars: lessonStars[id] ?? 0 }))
    .filter((x): x is { lesson: Lesson; stars: number } => !!x.lesson && x.stars < 3)
    .sort((a, b) => a.stars - b.stars || LESSON_INDEX.get(a.lesson.id)! - LESSON_INDEX.get(b.lesson.id)!)
    .slice(0, Math.max(0, limit))
    .map((x) => x.lesson);
}
