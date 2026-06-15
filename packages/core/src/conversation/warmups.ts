/**
 * The daily 5-minute free-talk library. Each warm-up is a friendly, everyday
 * topic the partner opens with — low pressure, just to keep the speaking habit
 * going alongside the course. Pure & clock-free: the caller passes a day index.
 */

export interface Warmup {
  id: string;
  /** What the partner opens the chat with. */
  prompt: string;
  /** The kind of talking it exercises. */
  skill: string;
}

export const WARMUPS: Warmup[] = [
  { id: 'day', prompt: 'Tell me about your day so far — what have you been up to?', skill: 'Everyday talk' },
  { id: 'weekend', prompt: 'What did you do last weekend?', skill: 'Past events' },
  { id: 'place', prompt: 'Describe your favourite place in your town or city.', skill: 'Describing' },
  { id: 'hobby', prompt: 'What is a hobby you really enjoy, and why?', skill: 'Likes & reasons' },
  { id: 'family', prompt: 'Tell me a little about your family.', skill: 'People' },
  { id: 'food', prompt: 'What is your favourite food? How is it made?', skill: 'Explaining' },
  { id: 'show', prompt: 'Describe a film or show you watched recently.', skill: 'Storytelling' },
  { id: 'travel', prompt: 'If you could travel anywhere, where would you go and why?', skill: 'Imagining' },
  { id: 'relax', prompt: 'What do you usually do to relax after a long day?', skill: 'Routine' },
  { id: 'festival', prompt: 'Tell me about a festival or celebration you love.', skill: 'Describing' },
  { id: 'learn', prompt: 'What is something new you would like to learn, and why?', skill: 'Plans & reasons' },
  { id: 'friend', prompt: 'Describe a good friend — what are they like?', skill: 'People' },
  { id: 'week', prompt: 'What was the best part of your week?', skill: 'Storytelling' },
  { id: 'season', prompt: 'Which season do you like most, and why?', skill: 'Opinions' },
];

/** Deterministically pick a warm-up for a given day index. */
export function warmupForDay(dayIndex: number): Warmup {
  const n = WARMUPS.length;
  const i = ((Math.trunc(dayIndex) % n) + n) % n;
  return WARMUPS[i]!;
}

/** Interest → a warm-up that naturally exercises it. */
const INTEREST_WARMUP: Record<string, string> = {
  Travel: 'travel',
  Food: 'food',
  Movies: 'show',
  Music: 'hobby',
  Family: 'family',
  Sports: 'weekend',
  Cricket: 'weekend',
  Books: 'learn',
  Tech: 'learn',
  Business: 'learn',
  Fashion: 'place',
  Health: 'relax',
};

/**
 * A personalized daily free-talk: on roughly every other day, pick a topic tied to
 * the learner's interests; otherwise fall back to the normal rotation (keeps variety
 * so it never feels repetitive). Deterministic in `dayIndex`.
 */
export function warmupForUser(dayIndex: number, interests: string[] = []): Warmup {
  const ids = new Set(interests.map((i) => INTEREST_WARMUP[i]).filter(Boolean) as string[]);
  const matches = WARMUPS.filter((w) => ids.has(w.id));
  const day = Math.trunc(dayIndex);
  if (matches.length && day % 2 === 0) {
    const n = matches.length;
    const i = ((Math.floor(day / 2) % n) + n) % n;
    return matches[i]!;
  }
  return warmupForDay(dayIndex);
}
