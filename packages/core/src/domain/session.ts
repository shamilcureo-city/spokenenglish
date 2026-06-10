/**
 * Session runtime helpers — ported from the original `session.js`. The streak
 * calculator and elapsed/resume helpers are pure and clock-injected.
 */

const DAY_MS = 86_400_000;

const dateKey = (iso: string): string => new Date(iso).toISOString().slice(0, 10);

/**
 * Daily streak: +1 on a consecutive day, unchanged on the same day, reset to 1
 * after a gap.
 */
export function calculateStreak(
  previousStreak: number,
  lastCompletedAt: string | null,
  completedAt: string,
): number {
  if (!lastCompletedAt) return 1;
  const last = dateKey(lastCompletedAt);
  const now = dateKey(completedAt);
  if (last === now) return Math.max(1, previousStreak);
  const diffDays = Math.round((Date.parse(now) - Date.parse(last)) / DAY_MS);
  return diffDays === 1 ? previousStreak + 1 : 1;
}

/** Minutes elapsed since `startedAt`, to 0.1 precision. */
export function getSessionElapsedMinutes(startedAt: string, now: Date): number {
  const mins = (now.getTime() - new Date(startedAt).getTime()) / 60000;
  return Math.max(0, Math.round(mins * 10) / 10);
}

/** A session can be resumed if it started less than 24h ago. */
export function shouldResumeSession(startedAt: string, now: Date): boolean {
  return now.getTime() - new Date(startedAt).getTime() < DAY_MS;
}
