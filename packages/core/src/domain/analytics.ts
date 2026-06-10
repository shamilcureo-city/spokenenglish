/**
 * Activation & engagement analytics — ported (lean) from the original
 * `analytics.js`. The activation funnel turns a learner's journey into concrete,
 * nudge-able steps. Pure.
 */

export interface FunnelStep {
  key: string;
  label: string;
  complete: boolean;
}

export interface ActivationInput {
  hasProfile: boolean;
  assessed: boolean;
  enrolled: boolean;
  practiced: boolean;
  reviewed: boolean;
  habit: boolean; // reached a 7-day streak
}

/** The six-step activation funnel, onboarding → habit. */
export function activationFunnel(input: ActivationInput): FunnelStep[] {
  return [
    { key: 'profile', label: 'Set up your profile', complete: input.hasProfile },
    { key: 'assess', label: 'Took the assessment', complete: input.assessed },
    { key: 'enroll', label: 'Started a course', complete: input.enrolled },
    { key: 'practice', label: 'Practised a lesson', complete: input.practiced },
    { key: 'review', label: 'Did a spaced review', complete: input.reviewed },
    { key: 'habit', label: '7-day streak', complete: input.habit },
  ];
}

/** 0..100 — how far through activation the learner is. */
export function activationScore(funnel: FunnelStep[]): number {
  if (funnel.length === 0) return 0;
  return Math.round((100 * funnel.filter((s) => s.complete).length) / funnel.length);
}

/** The next incomplete step (the nudge), or null if fully activated. */
export function nextStep(funnel: FunnelStep[]): FunnelStep | null {
  return funnel.find((s) => !s.complete) ?? null;
}
