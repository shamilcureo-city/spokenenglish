/**
 * Thin client for the edge functions. Base URL is configurable via
 * VITE_FUNCTIONS_URL (defaults to the local Supabase functions endpoint).
 */

import type { AssembledSession, AssessmentScore } from '@fluentmap/core/scoring';

const env = import.meta.env as Record<string, string | undefined>;
export const FUNCTIONS_URL = env.VITE_FUNCTIONS_URL ?? 'http://localhost:54321/functions/v1';

export interface Turn {
  speaker: 'ai' | 'learner';
  text: string;
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

export interface ScoreSessionPayload {
  sessionId: string;
  userId: string;
  l1: string;
  lessonTitle?: string;
  transcript: Turn[];
}

/** Score a finished lesson → summary + the skill/L1 evidence the engine ingests. */
export async function scoreSession(payload: ScoreSessionPayload): Promise<AssembledSession> {
  const res = await fetch(`${FUNCTIONS_URL}/score-session`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as AssembledSession;
}

/** Score the standardized 5-minute assessment → CEFR sub-scores + summary. */
export async function scoreAssessment(
  transcript: Turn[],
  supportLanguage: string,
): Promise<AssessmentScore> {
  const res = await fetch(`${FUNCTIONS_URL}/score-assessment`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ transcript, supportLanguage }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as AssessmentScore;
}
