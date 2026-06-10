/**
 * The skill taxonomy — the mastery map's nodes.
 *
 * ~120 discrete, measurable micro-skills across four families. This is the
 * canonical source of truth in `core`; the Supabase `skills` seed is generated
 * from it. Prerequisites form an acyclic graph that gates availability in the
 * sequencer; `difficulty` (0..1) gives the fine-grained i+1 ordering.
 *
 * `skills.test.ts` enforces: unique ids, valid prerequisite references, acyclic
 * graph, difficulty in range, and that every L1 transfer rule points at a real
 * skill here.
 */

import type { Cefr, Skill, SkillFamily } from './types.js';

const famOf = (id: string): SkillFamily => {
  const p = id.split('.')[0];
  return p === 'gr' ? 'grammar' : p === 'fn' ? 'function' : p === 'lex' ? 'lexis' : 'phoneme';
};

const s = (
  id: string,
  label: string,
  cefr: Cefr,
  cluster: string,
  difficulty: number,
  prerequisites: string[] = [],
  exemplar = '',
): Skill => ({ id, family: famOf(id), label, cefr, cluster, difficulty, prerequisites, exemplar, detectors: [] });

export const SKILLS: Skill[] = [
  // ───────────────────────── GRAMMAR (45) ─────────────────────────
  // Tenses
  s('gr.present_simple', 'Present simple', 'A1', 'Tenses', 0.1, [], 'I work in a bank.'),
  s('gr.present_continuous', 'Present continuous', 'A1', 'Tenses', 0.15, ['gr.present_simple'], 'I am working now.'),
  s('gr.past_simple', 'Past simple', 'A2', 'Tenses', 0.25, ['gr.present_simple'], 'I worked yesterday.'),
  s('gr.past_continuous', 'Past continuous', 'A2', 'Tenses', 0.3, ['gr.past_simple'], 'I was working at 9 pm.'),
  s('gr.present_perfect', 'Present perfect', 'B1', 'Tenses', 0.45, ['gr.past_simple', 'gr.present_simple'], 'I have lived here for five years.'),
  s('gr.present_perfect_continuous', 'Present perfect continuous', 'B2', 'Tenses', 0.62, ['gr.present_perfect'], 'I have been waiting for an hour.'),
  s('gr.past_perfect', 'Past perfect', 'B2', 'Tenses', 0.65, ['gr.past_simple', 'gr.present_perfect'], 'The bus had left before I arrived.'),
  s('gr.future_will', 'Future with will', 'A2', 'Tenses', 0.28, ['gr.present_simple'], 'I will call you tomorrow.'),
  s('gr.future_going_to', 'Future with going to', 'A2', 'Tenses', 0.3, ['gr.present_continuous'], 'I am going to start a course.'),
  s('gr.future_continuous', 'Future continuous', 'B2', 'Tenses', 0.63, ['gr.future_will', 'gr.present_continuous'], 'I will be travelling next week.'),
  // Articles & determiners
  s('gr.articles', 'Articles (a / an / the)', 'A1', 'Articles & determiners', 0.18, [], 'I am a doctor.'),
  s('gr.zero_article', 'Zero article', 'B1', 'Articles & determiners', 0.42, ['gr.articles'], 'Life is short.'),
  s('gr.demonstratives', 'Demonstratives (this/that/these/those)', 'A1', 'Articles & determiners', 0.12, [], 'This is my bag.'),
  s('gr.quantifiers', 'Quantifiers (some/any/much/many)', 'A2', 'Articles & determiners', 0.3, [], 'I have some questions.'),
  s('gr.possessives', 'Possessives (my/your/his)', 'A1', 'Articles & determiners', 0.14, [], 'That is her phone.'),
  // Prepositions
  s('gr.prep_time', 'Prepositions of time (in/on/at)', 'A2', 'Prepositions', 0.26, [], 'The meeting is at 3 pm on Monday.'),
  s('gr.prep_place', 'Prepositions of place (in/on/at)', 'A1', 'Prepositions', 0.18, [], 'The keys are on the table.'),
  s('gr.prep_movement', 'Prepositions of movement (to/into/through)', 'A2', 'Prepositions', 0.3, [], 'I walked to the station.'),
  s('gr.prep_dependent', 'Dependent prepositions (depend on, good at)', 'B2', 'Prepositions', 0.68, [], 'It depends on the weather.'),
  // Sentence structure
  s('gr.word_order', 'Word order (Subject-Verb-Object)', 'A1', 'Sentence structure', 0.16, [], 'I speak English.'),
  s('gr.subject_verb_agreement', 'Subject-verb agreement', 'A2', 'Sentence structure', 0.3, ['gr.present_simple'], 'She works hard.'),
  s('gr.there_is_are', 'There is / there are', 'A1', 'Sentence structure', 0.15, [], 'There are two options.'),
  s('gr.question_formation', 'Question formation', 'A1', 'Sentence structure', 0.2, [], 'Where do you work?'),
  s('gr.negation', 'Negation', 'A1', 'Sentence structure', 0.18, [], "I don't agree."),
  s('gr.countability', 'Countable & uncountable nouns', 'A2', 'Sentence structure', 0.32, [], 'I need some information.'),
  // Modals
  s('gr.modal_ability', 'Modals of ability (can/could)', 'A1', 'Modals', 0.18, [], 'I can drive.'),
  s('gr.modal_permission', 'Modals of permission (can/may)', 'A2', 'Modals', 0.3, [], 'May I come in?'),
  s('gr.modal_obligation', 'Modals of obligation (must/have to)', 'B1', 'Modals', 0.44, [], 'I have to leave now.'),
  s('gr.modal_possibility', 'Modals of possibility (might/could)', 'B1', 'Modals', 0.48, [], 'It might rain later.'),
  s('gr.modal_advice', 'Modals of advice (should/ought to)', 'B1', 'Modals', 0.45, [], 'You should rest.'),
  // Conditionals
  s('gr.conditional_zero', 'Zero conditional', 'A2', 'Conditionals', 0.34, ['gr.present_simple'], 'If you heat ice, it melts.'),
  s('gr.conditional_first', 'First conditional', 'B1', 'Conditionals', 0.46, ['gr.future_will', 'gr.present_simple'], 'If it rains, I will stay home.'),
  s('gr.conditional_second', 'Second conditional', 'B2', 'Conditionals', 0.64, ['gr.past_simple'], 'If I had time, I would travel.'),
  s('gr.conditional_third', 'Third conditional', 'C1', 'Conditionals', 0.82, ['gr.past_perfect'], 'If I had known, I would have called.'),
  // Verb patterns
  s('gr.gerund_infinitive', 'Gerund vs infinitive', 'B1', 'Verb patterns', 0.5, [], 'I enjoy reading; I want to learn.'),
  s('gr.phrasal_verbs', 'Phrasal verbs', 'B1', 'Verb patterns', 0.52, [], 'Please turn off the light.'),
  s('gr.stative_verbs', 'Stative verbs', 'A2', 'Verb patterns', 0.33, ['gr.present_continuous'], 'I know the answer.'),
  s('gr.passive_voice', 'Passive voice', 'B2', 'Verb patterns', 0.66, ['gr.past_simple', 'gr.present_perfect'], 'The report was sent yesterday.'),
  s('gr.reported_speech', 'Reported speech', 'B2', 'Verb patterns', 0.68, ['gr.past_simple'], 'She said she was busy.'),
  // Comparison
  s('gr.comparatives', 'Comparatives', 'A2', 'Comparison', 0.28, [], 'This is cheaper than that.'),
  s('gr.superlatives', 'Superlatives', 'A2', 'Comparison', 0.32, ['gr.comparatives'], 'It is the best option.'),
  // Connectors
  s('gr.coordinating_conjunctions', 'Coordinating conjunctions (and/but/so)', 'A2', 'Connectors', 0.26, [], 'I tried, but it failed.'),
  s('gr.subordinating_conjunctions', 'Subordinating conjunctions (because/although)', 'B1', 'Connectors', 0.48, [], 'I left because I was tired.'),
  s('gr.relative_clauses', 'Relative clauses (who/which/that)', 'B1', 'Connectors', 0.52, ['gr.question_formation'], 'The man who called is my boss.'),
  // Misc
  s('gr.imperatives', 'Imperatives', 'A1', 'Sentence structure', 0.14, [], 'Please sit down.'),

  // ───────────────────────── FUNCTION / DISCOURSE (31) ─────────────────────────
  // Social functions
  s('fn.greetings', 'Greetings', 'A1', 'Social functions', 0.08, [], 'Good morning! How are you?'),
  s('fn.self_intro', 'Introducing yourself', 'A1', 'Social functions', 0.12, [], 'Hi, I am Ravi from Chennai.'),
  s('fn.small_talk', 'Small talk', 'A2', 'Social functions', 0.3, [], 'How was your weekend?'),
  s('fn.leave_taking', 'Closing a conversation', 'A1', 'Social functions', 0.12, [], 'It was nice talking to you.'),
  s('fn.express_gratitude', 'Expressing gratitude', 'A1', 'Social functions', 0.1, [], 'Thank you so much for your help.'),
  s('fn.apologize', 'Apologising', 'A2', 'Social functions', 0.28, [], 'I am sorry for the delay.'),
  // Getting things done
  s('fn.make_requests', 'Making requests', 'A2', 'Getting things done', 0.3, [], 'Could you please repeat that?'),
  s('fn.ask_for_help', 'Asking for help', 'A1', 'Getting things done', 0.18, [], 'Can you help me with this?'),
  s('fn.give_directions', 'Giving directions', 'A2', 'Getting things done', 0.34, [], 'Go straight and turn left.'),
  s('fn.make_suggestions', 'Making suggestions', 'B1', 'Getting things done', 0.44, [], 'Why don\'t we meet at noon?'),
  s('fn.complain_politely', 'Complaining politely', 'B2', 'Getting things done', 0.66, [], 'I am afraid there is a problem with my order.'),
  s('fn.check_understanding', 'Checking understanding', 'A2', 'Getting things done', 0.3, [], 'Do you mean the morning slot?'),
  // Opinions & discussion
  s('fn.give_opinion', 'Giving an opinion', 'B1', 'Opinions & discussion', 0.42, [], 'In my opinion, remote work helps.'),
  s('fn.justify_opinion', 'Justifying an opinion', 'B1', 'Opinions & discussion', 0.5, ['fn.give_opinion'], 'I think so because it saves time.'),
  s('fn.agree', 'Agreeing', 'A2', 'Opinions & discussion', 0.3, [], 'That is a good point.'),
  s('fn.disagree_politely', 'Disagreeing politely', 'B1', 'Opinions & discussion', 0.52, ['fn.give_opinion'], 'I see your point, but I disagree.'),
  s('fn.express_preference', 'Expressing preference', 'A2', 'Opinions & discussion', 0.34, [], 'I would rather take the bus.'),
  s('fn.compare_options', 'Comparing options', 'B1', 'Opinions & discussion', 0.5, [], 'The first plan is better value.'),
  s('fn.hedge', 'Hedging / softening', 'B2', 'Opinions & discussion', 0.7, [], 'It might be a good idea, perhaps.'),
  // Managing conversation
  s('fn.clarify', 'Clarifying', 'A2', 'Managing conversation', 0.32, [], 'Sorry, could you clarify that?'),
  s('fn.paraphrase', 'Paraphrasing', 'B2', 'Managing conversation', 0.64, ['fn.clarify'], 'So what you mean is...'),
  s('fn.interrupt_politely', 'Interrupting politely', 'B1', 'Managing conversation', 0.52, [], 'Sorry to interrupt, but...'),
  s('fn.turn_take', 'Taking turns', 'B1', 'Managing conversation', 0.46, [], 'Go ahead, please.'),
  s('fn.repair', 'Self-repair', 'B1', 'Managing conversation', 0.48, [], 'I mean, I went there last week.'),
  s('fn.tag_questions', 'Tag questions', 'A2', 'Managing conversation', 0.33, ['gr.question_formation'], "You're coming, aren't you?"),
  // Extended speaking
  s('fn.narrate_past_event', 'Narrating a past event', 'B1', 'Extended speaking', 0.48, ['gr.past_simple'], 'Last year I attended an interview...'),
  s('fn.describe_person', 'Describing a person', 'A2', 'Extended speaking', 0.32, [], 'My manager is calm and helpful.'),
  s('fn.describe_place', 'Describing a place', 'A2', 'Extended speaking', 0.32, [], 'My town is small but busy.'),
  s('fn.summarize', 'Summarising', 'B2', 'Extended speaking', 0.64, [], 'To sum up, we agreed on two points.'),
  s('fn.signpost_presentation', 'Signposting a presentation', 'B2', 'Extended speaking', 0.7, ['fn.summarize'], 'First I will cover... then...'),
  s('fn.telephone_open_close', 'Opening & closing a phone call', 'A2', 'Extended speaking', 0.34, [], 'Hello, this is Priya from support.'),

  // ───────────────────────── LEXIS CLUSTERS (25) ─────────────────────────
  s('lex.daily_routine', 'Daily routine vocabulary', 'A1', 'Vocabulary clusters', 0.12, [], 'I wake up at six and get ready.'),
  s('lex.family', 'Family vocabulary', 'A1', 'Vocabulary clusters', 0.1, [], 'I live with my parents and sister.'),
  s('lex.food', 'Food & dining vocabulary', 'A1', 'Vocabulary clusters', 0.14, [], 'I would like a masala dosa, please.'),
  s('lex.shopping_money', 'Shopping & money vocabulary', 'A2', 'Vocabulary clusters', 0.28, [], 'How much does this cost?'),
  s('lex.travel_directions', 'Travel & directions vocabulary', 'A2', 'Vocabulary clusters', 0.3, [], 'Which platform is the train on?'),
  s('lex.workplace', 'Workplace vocabulary', 'B1', 'Vocabulary clusters', 0.46, [], 'I will send the deck after the standup.'),
  s('lex.interview', 'Job interview vocabulary', 'B1', 'Vocabulary clusters', 0.5, [], 'My key strength is problem solving.'),
  s('lex.customer_support', 'Customer support vocabulary', 'B1', 'Vocabulary clusters', 0.48, [], 'May I place you on a short hold?'),
  s('lex.telephone', 'Telephone vocabulary', 'A2', 'Vocabulary clusters', 0.34, [], 'Could you speak a little louder?'),
  s('lex.health', 'Health vocabulary', 'A2', 'Vocabulary clusters', 0.32, [], 'I have a headache since morning.'),
  s('lex.emotions', 'Emotions vocabulary', 'A2', 'Vocabulary clusters', 0.3, [], 'I felt nervous before the test.'),
  s('lex.numbers_time', 'Numbers & time vocabulary', 'A1', 'Vocabulary clusters', 0.1, [], 'The class starts at quarter past nine.'),
  s('lex.weather', 'Weather vocabulary', 'A1', 'Vocabulary clusters', 0.14, [], 'It is hot and humid today.'),
  s('lex.education', 'Education vocabulary', 'A2', 'Vocabulary clusters', 0.3, [], 'I completed my degree in commerce.'),
  s('lex.technology', 'Technology vocabulary', 'B1', 'Vocabulary clusters', 0.48, [], 'The app crashed after the update.'),
  s('lex.banking', 'Banking vocabulary', 'B1', 'Vocabulary clusters', 0.5, [], 'I want to open a savings account.'),
  s('lex.transport', 'Transport vocabulary', 'A2', 'Vocabulary clusters', 0.28, [], 'The auto fare is metered.'),
  s('lex.hobbies', 'Hobbies vocabulary', 'A1', 'Vocabulary clusters', 0.16, [], 'In my free time I play cricket.'),
  s('lex.clothing', 'Clothing vocabulary', 'A1', 'Vocabulary clusters', 0.16, [], 'I am looking for a cotton shirt.'),
  s('lex.housing', 'Housing vocabulary', 'A2', 'Vocabulary clusters', 0.3, [], 'The flat has two bedrooms.'),
  s('lex.meetings', 'Meetings vocabulary', 'B2', 'Vocabulary clusters', 0.66, [], 'Let us park that and move on.'),
  s('lex.sales', 'Sales vocabulary', 'B2', 'Vocabulary clusters', 0.66, [], 'This plan offers the best value for you.'),
  s('lex.email_to_speech', 'Turning email into speech', 'B2', 'Vocabulary clusters', 0.64, [], 'I am calling to follow up on my email.'),
  s('lex.government_office', 'Government office vocabulary', 'B1', 'Vocabulary clusters', 0.5, [], 'I need to renew my license.'),
  s('lex.social_media', 'Social & online vocabulary', 'A2', 'Vocabulary clusters', 0.3, [], 'I will share the link in the group.'),

  // ───────────────────────── PHONEMES / PRONUNCIATION (20) ─────────────────────────
  s('ph.v_w_distinction', 'Distinguishing /v/ and /w/', 'A2', 'Consonant sounds', 0.3, [], 'very vs water'),
  s('ph.theta_voiceless', 'Voiceless TH /θ/', 'B1', 'Consonant sounds', 0.44, [], 'think, three, month'),
  s('ph.eth_voiced', 'Voiced TH /ð/', 'B1', 'Consonant sounds', 0.46, [], 'this, that, mother'),
  s('ph.z_s', 'Distinguishing /z/ and /s/', 'A2', 'Consonant sounds', 0.34, [], 'zip vs sip'),
  s('ph.zh', 'The /ʒ/ sound', 'B2', 'Consonant sounds', 0.64, [], 'vision, measure'),
  s('ph.retroflex_t_d', 'Alveolar (not retroflex) /t/ /d/', 'A2', 'Consonant sounds', 0.36, [], 'time, day'),
  s('ph.ship_sheep', 'Short /ɪ/ vs long /iː/', 'A2', 'Vowel sounds', 0.34, [], 'ship vs sheep'),
  s('ph.cat_cut', 'Distinguishing /æ/ and /ʌ/', 'A2', 'Vowel sounds', 0.34, [], 'cat vs cut'),
  s('ph.schwa', 'The schwa /ə/', 'B1', 'Vowel sounds', 0.5, [], 'about, banana'),
  s('ph.cluster_initial', 'Initial consonant clusters', 'B1', 'Connected speech', 0.48, [], 'school (not is-school)'),
  s('ph.cluster_final', 'Final consonant clusters', 'B1', 'Connected speech', 0.5, [], 'asked, texts'),
  s('ph.p_f', 'Distinguishing /p/ and /f/', 'A2', 'Consonant sounds', 0.32, [], 'pan vs fan'),
  s('ph.sh_s', 'Distinguishing /ʃ/ and /s/', 'A2', 'Consonant sounds', 0.34, [], 'she vs see'),
  s('ph.word_stress', 'Word stress', 'B1', 'Stress & rhythm', 0.5, [], 'PHO-to-graph vs pho-TO-gra-phy'),
  s('ph.sentence_stress', 'Sentence stress', 'B2', 'Stress & rhythm', 0.64, [], 'I NEVER said that.'),
  s('ph.rhythm_stress_timed', 'Stress-timed rhythm', 'B2', 'Stress & rhythm', 0.7, [], 'reducing weak syllables'),
  s('ph.final_consonant_voicing', 'Final consonant voicing', 'B1', 'Connected speech', 0.48, [], 'bag (not back)'),
  s('ph.silent_letters', 'Silent letters', 'A2', 'Consonant sounds', 0.34, [], 'know, hour, half'),
  s('ph.intonation_questions', 'Question intonation', 'B1', 'Stress & rhythm', 0.46, [], 'rising tone on yes/no questions'),
  s('ph.linking', 'Linking & connected speech', 'B2', 'Connected speech', 0.66, [], 'an_apple, turn_it_off'),
];

/** Fast id lookup set. */
export const SKILL_IDS: ReadonlySet<string> = new Set(SKILLS.map((sk) => sk.id));

export function getSkill(id: string): Skill | undefined {
  return SKILLS.find((sk) => sk.id === id);
}

export function skillsByFamily(family: SkillFamily): Skill[] {
  return SKILLS.filter((sk) => sk.family === family);
}
