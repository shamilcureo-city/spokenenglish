/**
 * Thin client for the local dev API (the token proxy + scene-building + recap).
 * Base URL is configurable via VITE_FUNCTIONS_URL (defaults to the local server).
 */

import type {
  ConversationMode,
  Lesson,
  Placement,
  Recap,
  Turn,
} from '@fluentmap/core/conversation';

const env = import.meta.env as Record<string, string | undefined>;
export const FUNCTIONS_URL = env.VITE_FUNCTIONS_URL ?? 'http://localhost:8787';

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${FUNCTIONS_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    throw new Error(String(data.error));
  }
  return data as T;
}

/** Token proxy: start-session → redeem-session → the Live WebSocket URL. */
export async function resolveWsUrl(): Promise<string> {
  const startRes = await fetch(`${FUNCTIONS_URL}/start-session`, { method: 'POST' });
  const start = await startRes.json();
  if (start.error) throw new Error(start.error);

  const redeemRes = await fetch(`${FUNCTIONS_URL}/redeem-session?token=${start.token}`);
  const redeem = await redeemRes.json();
  if (redeem.error) throw new Error(redeem.error);
  return redeem.wsUrl as string;
}

/** Score a finished conversation → the confidence-first recap. */
export function getRecap(input: {
  transcript: Turn[];
  mode: ConversationMode;
  supportLanguage: string;
  lesson?: Lesson;
}): Promise<Recap> {
  return postJson<Recap>('/recap', input);
}

/** A short spoken check → a starting level + unit. */
export function placement(input: { transcript: Turn[]; supportLanguage: string }): Promise<Placement> {
  return postJson<Placement>('/placement', input);
}
