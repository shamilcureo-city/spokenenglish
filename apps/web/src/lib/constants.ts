/** Mother-tongue options for recap explanations (India-first). */
export const LANGUAGES = [
  'Hindi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Bengali',
  'Gujarati',
  'Punjabi',
  'English',
] as const;

/**
 * COGS cap: free live realtime voice per day. Generous for now (pre-launch) — the
 * point is to establish metering, not to throttle early activation. Live voice
 * costs ~₹3.2/min, so this is the lever that keeps gross margin viable at scale.
 */
export const DAILY_FREE_LIVE_SECONDS = 25 * 60;

/** Auto-end a live session after this much total silence (saves COGS on dead air). */
export const IDLE_MS = 30_000;

/** Hard cap on a single live session (matches the orchestrator's 8-min recycle). */
export const MAX_SESSION_SECONDS = 8 * 60;

/** A whole-day index, so the daily warm-up rotates once per calendar day. */
export function todayIndex(): number {
  const now = new Date();
  // Local midnight-based day number.
  return Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
}
