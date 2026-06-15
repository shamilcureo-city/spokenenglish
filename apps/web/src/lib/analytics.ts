/**
 * Analytics scaffold — the funnel events for the retention gate (activation,
 * D1/D7/D30, K). Currently logs locally (and to console in dev) so it keeps the
 * "runs on your device" promise; wire it to a provider (PostHog / Firebase /
 * Amplitude) at Phase 3 — the call sites won't change.
 */

export type AnalyticsEvent =
  | 'app_open'
  | 'onboarded'
  | 'placement_done'
  | 'session_start'
  | 'session_end'
  | 'lesson_complete'
  | 'level_up'
  | 'unit_complete';

interface LoggedEvent {
  event: AnalyticsEvent;
  at: string;
  props?: Record<string, unknown>;
}

const KEY = 'speakwell-events-v1';

function read(): LoggedEvent[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as LoggedEvent[];
  } catch {
    return [];
  }
}

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  try {
    const all = [...read(), { event, at: new Date().toISOString(), props }].slice(-500);
    localStorage.setItem(KEY, JSON.stringify(all));
    if (import.meta.env.DEV) console.debug('[analytics]', event, props ?? '');
    // TODO (Phase 3): forward to PostHog / Firebase here.
  } catch {
    /* ignore */
  }
}

export function getEvents(): LoggedEvent[] {
  return read();
}
