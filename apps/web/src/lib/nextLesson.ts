/**
 * Picks the learner's next lesson by running the core sequencer (weakest + due +
 * i+1) and resolving the chosen skill to the lesson that best practises it.
 */

import { pickNextActivity, SKILLS, type Cefr, type SkillState } from '@fluentmap/core/science';
import {
  LESSONS,
  bestLessonForSkill,
  getLesson,
  DEFAULT_LESSON,
  type Lesson,
  type TrackId,
} from '@fluentmap/core/domain';

// Only sequence over skills that an actual lesson teaches, so the chosen lesson
// always matches the reason we picked it. (As the lesson library grows, more of
// the taxonomy becomes teachable.)
const TEACHABLE = new Set(LESSONS.flatMap((l) => l.targetSkillIds));
const TEACHABLE_SKILLS = SKILLS.filter((s) => TEACHABLE.has(s.id));

export function chooseNextLesson(
  states: SkillState[],
  now: Date,
  targetCefr: Cefr,
  track?: TrackId,
): { lesson: Lesson; rationale: string } {
  const choice = pickNextActivity({
    states,
    skills: TEACHABLE_SKILLS,
    dueReviews: [],
    now,
    targetCefr,
    lessonForSkill: (id) => bestLessonForSkill(id, track)?.id,
  });

  let lesson: Lesson | undefined;
  if (choice.lessonId) lesson = getLesson(choice.lessonId);
  if (!lesson) {
    const skillId = choice.skillIds[0];
    if (skillId) lesson = bestLessonForSkill(skillId, track);
  }
  return { lesson: lesson ?? DEFAULT_LESSON, rationale: choice.rationale };
}
