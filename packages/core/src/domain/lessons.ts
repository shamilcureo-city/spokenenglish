/**
 * Lesson library — content as data, each lesson mapped to the micro-skills it
 * targets. This is the join that marries content to the science: completing a
 * lesson generates evidence for its `targetSkillIds`, and the sequencer can find
 * "the best lesson to practise skill X" via `bestLessonForSkill`.
 *
 * Canonical source of truth in `core`; the Supabase `lessons` /
 * `lesson_target_skills` seeds are generated from this. `lessons.test.ts`
 * verifies every target skill id exists in the taxonomy.
 */

import type { Cefr } from '../science/types.js';
import type { TrackId } from './assessment.js';

export interface Lesson {
  id: string;
  title: string;
  track: TrackId;
  cefr: Cefr;
  level: string; // display label for the coach prompt
  scenario: string;
  targetSkillIds: string[];
  goalTag?: string;
}

const LEVEL: Record<TrackId, string> = {
  basic: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Career/Advanced',
};

const l = (
  id: string,
  title: string,
  track: TrackId,
  cefr: Cefr,
  scenario: string,
  targetSkillIds: string[],
  goalTag?: string,
): Lesson => ({ id, title, track, cefr, level: LEVEL[track], scenario, targetSkillIds, ...(goalTag ? { goalTag } : {}) });

export const LESSONS: Lesson[] = [
  // ── Basic ──
  l('basic.greetings_intro', 'Greetings & introductions', 'basic', 'A1',
    'Meeting someone new at a community event. The coach greets the learner and they introduce themselves.',
    ['fn.greetings', 'fn.self_intro', 'gr.present_simple']),
  l('basic.daily_routine', 'My daily routine', 'basic', 'A1',
    'A friendly chat about the learner\'s typical day, morning to night.',
    ['lex.daily_routine', 'gr.present_simple', 'gr.prep_time']),
  l('basic.ordering_food', 'Ordering food', 'basic', 'A2',
    'At a restaurant. The coach is the waiter; the learner orders a meal politely.',
    ['lex.food', 'fn.make_requests', 'gr.modal_permission']),
  l('basic.shopping', 'Shopping & prices', 'basic', 'A2',
    'In a shop, asking about items and comparing prices.',
    ['lex.shopping_money', 'gr.comparatives', 'fn.make_requests']),
  l('basic.directions', 'Asking for directions', 'basic', 'A2',
    'Lost in a new area; the learner asks for and gives directions.',
    ['fn.give_directions', 'gr.prep_movement', 'gr.imperatives']),
  l('basic.articles_fix', 'A, an & the', 'basic', 'A1',
    'Quick, confidence-building practice using articles in everyday sentences.',
    ['gr.articles', 'gr.countability']),
  l('basic.stative_fix', 'Verbs you don\'t say with -ing', 'basic', 'A2',
    'Practice using know, want, like and other stative verbs correctly.',
    ['gr.stative_verbs', 'gr.present_continuous']),

  // ── Intermediate ──
  l('inter.interview_intro', 'Interview introduction', 'intermediate', 'B1',
    'A job interview. The coach is the interviewer and asks the learner to introduce themselves and their experience.',
    ['lex.interview', 'fn.self_intro', 'gr.present_perfect'], 'Interview English'),
  l('inter.workplace_meeting', 'Speaking up in a meeting', 'intermediate', 'B1',
    'A team meeting where the learner shares an update and an opinion.',
    ['lex.meetings', 'fn.give_opinion', 'fn.agree'], 'Workplace English'),
  l('inter.phone_support', 'Customer support call', 'intermediate', 'B1',
    'The learner handles a customer support call, clarifying the issue.',
    ['lex.telephone', 'lex.customer_support', 'fn.clarify'], 'Workplace English'),
  l('inter.storytelling', 'Telling a story', 'intermediate', 'B1',
    'The learner narrates something that happened to them last week.',
    ['fn.narrate_past_event', 'gr.past_simple', 'gr.past_continuous']),
  l('inter.opinions', 'Giving & justifying opinions', 'intermediate', 'B1',
    'A friendly debate where the learner gives an opinion and explains why.',
    ['fn.give_opinion', 'fn.justify_opinion', 'gr.subordinating_conjunctions']),

  // ── Advanced ──
  l('adv.presentation', 'Giving a presentation', 'advanced', 'B2',
    'The learner delivers a short structured presentation to the coach.',
    ['fn.signpost_presentation', 'fn.summarize', 'ph.word_stress'], 'Workplace English'),
  l('adv.negotiation', 'Negotiating politely', 'advanced', 'B2',
    'A sales negotiation; the learner disagrees and hedges politely to reach a deal.',
    ['lex.sales', 'fn.disagree_politely', 'fn.hedge'], 'Workplace English'),
  l('adv.conditionals', 'Hypotheticals & conditionals', 'advanced', 'C1',
    'A reflective conversation using "if I had…" style hypotheticals.',
    ['gr.conditional_second', 'gr.conditional_third']),
];

const LESSON_BY_ID = new Map(LESSONS.map((x) => [x.id, x]));

export function getLesson(id: string): Lesson | undefined {
  return LESSON_BY_ID.get(id);
}

export function lessonsForTrack(track: TrackId): Lesson[] {
  return LESSONS.filter((x) => x.track === track);
}

/** Best lesson that practises a given skill, preferring the learner's track. */
export function bestLessonForSkill(skillId: string, track?: TrackId): Lesson | undefined {
  if (track) {
    const inTrack = LESSONS.find((x) => x.track === track && x.targetSkillIds.includes(skillId));
    if (inTrack) return inTrack;
  }
  return LESSONS.find((x) => x.targetSkillIds.includes(skillId));
}

/** A safe default when nothing else matches (e.g. brand-new learner). */
export const DEFAULT_LESSON: Lesson = LESSONS[0]!;
