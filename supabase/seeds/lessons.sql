-- lessons
-- AUTO-GENERATED from packages/core by scripts/gen-seeds.ts — do not edit by hand.
insert into lessons (id, track_id, module_index, lesson_index, title, scenario, cefr, structures, pass_score, target_minutes, system_prompt_template) values
  ('basic.greetings_intro', 'basic', 0, 1, 'Greetings & introductions', 'Meeting someone new at a community event. The coach greets the learner and they introduce themselves.', 'A1', ARRAY[]::text[], 55, 12, NULL),
  ('basic.daily_routine', 'basic', 0, 2, 'My daily routine', 'A friendly chat about the learner''s typical day, morning to night.', 'A1', ARRAY[]::text[], 55, 12, NULL),
  ('basic.ordering_food', 'basic', 0, 3, 'Ordering food', 'At a restaurant. The coach is the waiter; the learner orders a meal politely.', 'A2', ARRAY[]::text[], 55, 12, NULL),
  ('basic.shopping', 'basic', 0, 4, 'Shopping & prices', 'In a shop, asking about items and comparing prices.', 'A2', ARRAY[]::text[], 55, 12, NULL),
  ('basic.directions', 'basic', 0, 5, 'Asking for directions', 'Lost in a new area; the learner asks for and gives directions.', 'A2', ARRAY[]::text[], 55, 12, NULL),
  ('basic.articles_fix', 'basic', 0, 6, 'A, an & the', 'Quick, confidence-building practice using articles in everyday sentences.', 'A1', ARRAY[]::text[], 55, 12, NULL),
  ('basic.stative_fix', 'basic', 0, 7, 'Verbs you don''t say with -ing', 'Practice using know, want, like and other stative verbs correctly.', 'A2', ARRAY[]::text[], 55, 12, NULL),
  ('inter.interview_intro', 'intermediate', 0, 1, 'Interview introduction', 'A job interview. The coach is the interviewer and asks the learner to introduce themselves and their experience.', 'B1', ARRAY[]::text[], 65, 12, NULL),
  ('inter.workplace_meeting', 'intermediate', 0, 2, 'Speaking up in a meeting', 'A team meeting where the learner shares an update and an opinion.', 'B1', ARRAY[]::text[], 65, 12, NULL),
  ('inter.phone_support', 'intermediate', 0, 3, 'Customer support call', 'The learner handles a customer support call, clarifying the issue.', 'B1', ARRAY[]::text[], 65, 12, NULL),
  ('inter.storytelling', 'intermediate', 0, 4, 'Telling a story', 'The learner narrates something that happened to them last week.', 'B1', ARRAY[]::text[], 65, 12, NULL),
  ('inter.opinions', 'intermediate', 0, 5, 'Giving & justifying opinions', 'A friendly debate where the learner gives an opinion and explains why.', 'B1', ARRAY[]::text[], 65, 12, NULL),
  ('adv.presentation', 'advanced', 0, 1, 'Giving a presentation', 'The learner delivers a short structured presentation to the coach.', 'B2', ARRAY[]::text[], 75, 12, NULL),
  ('adv.negotiation', 'advanced', 0, 2, 'Negotiating politely', 'A sales negotiation; the learner disagrees and hedges politely to reach a deal.', 'B2', ARRAY[]::text[], 75, 12, NULL),
  ('adv.conditionals', 'advanced', 0, 3, 'Hypotheticals & conditionals', 'A reflective conversation using "if I had…" style hypotheticals.', 'C1', ARRAY[]::text[], 75, 12, NULL)
on conflict (id) do update set
  track_id = excluded.track_id, module_index = excluded.module_index, lesson_index = excluded.lesson_index,
  title = excluded.title, scenario = excluded.scenario, cefr = excluded.cefr, structures = excluded.structures,
  pass_score = excluded.pass_score, target_minutes = excluded.target_minutes,
  system_prompt_template = excluded.system_prompt_template;
