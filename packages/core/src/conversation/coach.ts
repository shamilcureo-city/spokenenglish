/**
 * The coach character. One friendly persona — "Sunny" — that the live voice IS,
 * and that the app refers to by name everywhere (onboarding, celebrations, the
 * shareable win card). A named partner you talk to every day is far stickier than
 * a faceless "AI": it turns practice into a relationship.
 *
 * Voice note: the live model uses Gemini's "Puck" voice — upbeat and youthful — so
 * "Sunny" (a common, cheerful Indian name, gender-neutral) fits it naturally.
 */
export interface Coach {
  /** What the learner calls them. */
  name: string;
  /** One line of personality, woven into the system instruction. */
  vibe: string;
}

export const COACH: Coach = {
  name: 'Sunny',
  vibe: 'warm, upbeat, and endlessly patient — the friend who makes you feel easy to talk to',
};

/** Convenience for UI copy. */
export const COACH_NAME = COACH.name;
