/**
 * Personalization inputs — the learner's main goal + a few interests. These don't
 * change the curriculum; they flavour HOW the live partner talks (examples,
 * scenarios, free-talk angles) so practice feels like it's about *their* life.
 * Pure data + a helper that turns them into a line for the system instruction.
 */

export type GoalId = 'work' | 'travel' | 'daily' | 'exams';

export interface Goal {
  id: GoalId;
  label: string;
  /** A few concrete situations this goal cares about — shown in the UI + fed to the persona. */
  blurb: string;
}

export const GOALS: Goal[] = [
  { id: 'work', label: 'Work & career', blurb: 'meetings, interviews, emails, colleagues' },
  { id: 'travel', label: 'Travel', blurb: 'airports, hotels, directions, ordering' },
  { id: 'daily', label: 'Everyday life', blurb: 'shops, neighbours, phone calls, daily chat' },
  { id: 'exams', label: 'Exams & study', blurb: 'IELTS-style answers, fluency, clarity under pressure' },
];

export function goalById(id?: GoalId): Goal | undefined {
  return id ? GOALS.find((g) => g.id === id) : undefined;
}

/** Interest chips offered at onboarding (India-first, broad). */
export const INTERESTS = [
  'Cricket',
  'Movies',
  'Music',
  'Food',
  'Travel',
  'Tech',
  'Business',
  'Family',
  'Sports',
  'Books',
  'Fashion',
  'Health',
] as const;

/**
 * The personalization block for the system instruction. Empty string when nothing
 * is set, so the prompt stays clean for users who skip it.
 */
export function personaFlavor(goal?: GoalId, interests?: string[]): string {
  const lines: string[] = [];
  const g = goalById(goal);
  if (g) {
    lines.push(
      `They're learning English mainly for ${g.label.toLowerCase()} (think: ${g.blurb}). When it fits naturally, lean your examples and scenarios that way.`,
    );
  }
  const tags = (interests ?? []).map((s) => s.trim()).filter(Boolean);
  if (tags.length) {
    lines.push(
      `They're into ${tags.join(', ')}. Bring these up to make the chat feel personal and keep them talking — but don't force every topic.`,
    );
  }
  return lines.join('\n');
}
