/**
 * The course — a leveled, communicative (function-based) spoken-English syllabus.
 * Pure DATA + helpers, so new lessons ship without code. Three levels → units →
 * lessons; each lesson is one communication move practised live (Learn → Speak →
 * Feedback). `LESSONS` is in course order; the helpers gate unlocking sequentially
 * and respect a placement starting unit.
 */

export type LevelId = 'foundation' | 'intermediate' | 'advanced';

export interface Level {
  id: LevelId;
  title: string;
  subtitle: string;
}

export interface Unit {
  id: string;
  levelId: LevelId;
  title: string;
  subtitle: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  levelId: LevelId;
  title: string;
  /** The communicative goal, e.g. "Disagree politely". */
  fn: string;
  /** CEFR-style can-do statement. */
  canDo: string;
  /** 5–8 target phrases/moves taught in the "Learn" step. */
  phrases: string[];
  /** How the AI partner sets up & runs the live practice. */
  scenario: string;
  /** Optional plain-English tip about a common mistake. */
  l1Note?: string;
}

export const LEVELS: Level[] = [
  { id: 'foundation', title: 'Foundation', subtitle: 'Everyday survival & confidence' },
  { id: 'intermediate', title: 'Intermediate', subtitle: 'Connect, discuss & work-ready' },
  { id: 'advanced', title: 'Advanced', subtitle: 'Influence, nuance & impact' },
];

export const UNITS: Unit[] = [
  // Foundation
  { id: 'f1', levelId: 'foundation', title: 'First contact', subtitle: 'Hellos, introductions, goodbyes' },
  { id: 'f2', levelId: 'foundation', title: 'Everyday life', subtitle: 'Routine, likes, family' },
  { id: 'f3', levelId: 'foundation', title: 'Out & about', subtitle: 'Order, shop, directions' },
  { id: 'f4', levelId: 'foundation', title: 'Getting things done', subtitle: 'Requests, permission, calls' },
  { id: 'f5', levelId: 'foundation', title: 'Past & future', subtitle: 'What you did & will do' },
  // Intermediate
  { id: 'i1', levelId: 'intermediate', title: 'Small talk', subtitle: 'Break the ice & keep it going' },
  { id: 'i2', levelId: 'intermediate', title: 'Opinions & discussion', subtitle: 'Give views, agree, disagree' },
  { id: 'i3', levelId: 'intermediate', title: 'Storytelling', subtitle: 'Narrate with detail & feeling' },
  { id: 'i4', levelId: 'intermediate', title: 'At work', subtitle: 'Introduce, describe, meet' },
  { id: 'i5', levelId: 'intermediate', title: 'Phone & online', subtitle: 'Calls, clarity, confirming' },
  { id: 'i6', levelId: 'intermediate', title: 'Handling problems', subtitle: 'Complain, apologise, fix' },
  // Advanced
  { id: 'a1', levelId: 'advanced', title: 'Present & explain', subtitle: 'Structure, clarity, Q&A' },
  { id: 'a2', levelId: 'advanced', title: 'Persuade & negotiate', subtitle: 'Make a case, push back' },
  { id: 'a3', levelId: 'advanced', title: 'Meetings & leadership', subtitle: 'Run, align, give feedback' },
  { id: 'a4', levelId: 'advanced', title: 'Interviews', subtitle: 'Answer well, sell strengths' },
  { id: 'a5', levelId: 'advanced', title: 'Fluency & nuance', subtitle: 'Natural phrasing & diplomacy' },
];

export const LESSONS: Lesson[] = [
  // ── Foundation ──────────────────────────────────────────────────────────
  { id: 'f1-greet', unitId: 'f1', levelId: 'foundation', title: 'Greetings & hellos', fn: 'Greet people and respond', canDo: 'I can greet people and respond naturally at any time of day.', phrases: ['Hi, how are you?', 'Good morning / afternoon / evening', "I'm good, thanks — and you?", 'Nice to meet you', 'Long time no see!'], scenario: "Warmly greet the learner as if you've just run into them. Get them to greet you back and answer 'how are you?'. Vary the time of day.", l1Note: "Answer 'How are you?' briefly ('Good, thanks') and ask back — a long answer feels unnatural." },
  { id: 'f1-introduce', unitId: 'f1', levelId: 'foundation', title: 'Introduce yourself', fn: 'Say your name, origin and work', canDo: "I can introduce myself — my name, where I'm from, and what I do.", phrases: ["I'm… / My name is…", "I'm from…", "I work as a… / I'm a…", 'I live in…', 'What about you?'], scenario: 'Play a friendly new neighbour. Introduce yourself, then get the learner to share their name, where they are from, and what they do.', l1Note: "Say 'I am a teacher' — don't drop the 'a' before a job." },
  { id: 'f1-goodbye', unitId: 'f1', levelId: 'foundation', title: 'Goodbyes', fn: 'End a conversation politely', canDo: 'I can end a conversation politely.', phrases: ['It was nice talking to you', 'See you later / soon', 'Take care', 'Have a good day', 'Catch you later'], scenario: 'After a short, friendly chat, start winding down and get the learner to say a natural goodbye.' },

  { id: 'f2-routine', unitId: 'f2', levelId: 'foundation', title: 'Your daily routine', fn: 'Describe your day', canDo: 'I can describe my daily routine.', phrases: ['I usually wake up at…', 'Then I…', 'In the evening, I…', 'On weekends, I…', 'Most days I…'], scenario: 'Ask about their typical day and keep them describing their routine, step by step, in the present tense.' },
  { id: 'f2-likes', unitId: 'f2', levelId: 'foundation', title: 'Likes & dislikes', fn: 'Talk about what you like', canDo: "I can talk about what I like and don't like.", phrases: ['I love… / I really like…', "I'm into…", "I don't really like…", "I can't stand…", 'I prefer … to …'], scenario: 'Chat about food, films, music and hobbies; get them to express clear likes and dislikes.' },
  { id: 'f2-family', unitId: 'f2', levelId: 'foundation', title: 'Family & home', fn: 'Describe family and home', canDo: 'I can describe my family and where I live.', phrases: ['I have a … (brother/sister)', 'We live in…', 'My … is a …', 'There are … of us', 'I live with…'], scenario: 'Ask about their family and home and keep them describing the people and the place.' },

  { id: 'f3-order', unitId: 'f3', levelId: 'foundation', title: 'Ordering food', fn: 'Order at a café or restaurant', canDo: 'I can order food and drinks politely.', phrases: ['Can I have…, please?', "I'll take the…", 'Could I get…', 'Anything to drink? — Yes, a…', "That's all, thanks"], scenario: 'Play a friendly waiter. Take their order, ask follow-ups (size, drink, anything else), then total it up.' },
  { id: 'f3-shop', unitId: 'f3', levelId: 'foundation', title: 'Shopping & prices', fn: 'Shop and ask about prices', canDo: 'I can shop and ask about prices and sizes.', phrases: ['How much is this?', 'Do you have this in…?', 'Can I try it on?', "I'm just looking, thanks", "I'll take it"], scenario: 'Play a shop assistant; help them buy something and handle price, size and colour questions.' },
  { id: 'f3-directions', unitId: 'f3', levelId: 'foundation', title: 'Asking directions', fn: 'Ask for and follow directions', canDo: 'I can ask for and follow simple directions.', phrases: ['Excuse me, how do I get to…?', 'Is it far?', 'Go straight / turn left / turn right', "It's next to / opposite…", "Thanks, I'll find it"], scenario: 'They are lost. Play a helpful local; have them ask the way to a landmark, then you give simple directions.' },

  { id: 'f4-requests', unitId: 'f4', levelId: 'foundation', title: 'Simple requests', fn: 'Make polite requests', canDo: 'I can ask for things politely.', phrases: ['Could you…, please?', 'Would you mind …ing?', 'Can you help me with…?', 'Sorry to bother you, but…', 'Thanks a lot'], scenario: 'Set up small everyday situations (pass something, hold a door, help carry) and get them to make polite requests.' },
  { id: 'f4-permission', unitId: 'f4', levelId: 'foundation', title: 'Asking permission', fn: 'Ask for and give permission', canDo: 'I can ask for and give permission.', phrases: ['Can I…?', 'Is it okay if I…?', 'Do you mind if I…?', 'Would it be alright to…?', 'Sure, go ahead'], scenario: 'Play a colleague or host; have the learner ask permission for several small things, and respond.' },
  { id: 'f4-phone', unitId: 'f4', levelId: 'foundation', title: 'A basic phone call', fn: 'Make a simple call', canDo: 'I can make a simple phone call to ask or book.', phrases: ["Hi, I'm calling about…", "I'd like to book…", 'Could you tell me…?', 'What time do you…?', 'Thank you, bye'], scenario: 'Play a receptionist. The learner calls to book a table or ask about opening hours; keep it short and clear.' },

  { id: 'f5-past', unitId: 'f5', levelId: 'foundation', title: 'What you did', fn: 'Talk about the past', canDo: 'I can talk about what I did recently.', phrases: ['Yesterday I…', 'Last weekend, I…', 'It was great / okay / tiring', 'I went to…', 'We had a…'], scenario: 'Ask what they did yesterday and last weekend; gently keep them in the past tense.', l1Note: "Use the past form: 'I went', not 'I am going', for things that already happened." },
  { id: 'f5-plans', unitId: 'f5', levelId: 'foundation', title: 'Plans & the future', fn: 'Talk about plans', canDo: 'I can talk about my plans.', phrases: ["I'm going to…", "I'm planning to…", "Tomorrow I'll…", "Hopefully I'll…", 'I might…'], scenario: 'Ask about their plans for tonight, the weekend and the next holiday.' },
  { id: 'f5-invite', unitId: 'f5', levelId: 'foundation', title: 'Invitations', fn: 'Invite, accept and decline', canDo: 'I can invite someone and accept or decline an invitation.', phrases: ['Do you want to…?', 'Would you like to…?', "Sure, I'd love to!", 'Sounds good', "Sorry, I can't make it"], scenario: 'Invite them out; have them accept or decline politely, then invite you to something in return.' },

  // ── Intermediate ────────────────────────────────────────────────────────
  { id: 'i1-icebreak', unitId: 'i1', levelId: 'intermediate', title: 'Breaking the ice', fn: 'Start a conversation', canDo: 'I can start a friendly conversation with someone new.', phrases: ['So, how do you know…?', 'Have you been here before?', "Nice weather, isn't it?", 'What do you do for fun?', "How's your day going?"], scenario: 'Play a stranger next to them at an event. Get a natural small-talk going and keep the learner initiating.' },
  { id: 'i1-keepgoing', unitId: 'i1', levelId: 'intermediate', title: 'Keeping it going', fn: 'Sustain a conversation', canDo: 'I can keep a conversation going with follow-up questions.', phrases: ['Oh really? Tell me more', 'That sounds…', 'What happened next?', 'Same here!', 'And how about you?'], scenario: 'Share small things about yourself and get them to react and ask follow-ups so the chat keeps flowing.' },

  { id: 'i2-opinion', unitId: 'i2', levelId: 'intermediate', title: 'Giving opinions', fn: 'Give and support an opinion', canDo: 'I can give my opinion and back it up.', phrases: ['I think… / In my opinion…', 'The way I see it…', 'For example…', "That's because…", 'What do you think?'], scenario: 'Pick a light topic (city vs village life, online vs in-person) and get them to give and justify opinions.' },
  { id: 'i2-disagree', unitId: 'i2', levelId: 'intermediate', title: 'Agreeing & disagreeing politely', fn: 'Disagree without rudeness', canDo: 'I can disagree politely.', phrases: ["That's a good point, but…", 'I see what you mean, however…', "I'm not so sure about that", "Actually, I'd say…", 'Fair enough'], scenario: 'Take mild opposing views on a fun topic and get them to disagree politely and hold their position.' },

  { id: 'i3-narrate', unitId: 'i3', levelId: 'intermediate', title: 'Telling a story', fn: 'Narrate an experience', canDo: 'I can tell a short story about something that happened.', phrases: ['So, the other day…', 'At first…', 'But then…', 'In the end…', "You won't believe what happened"], scenario: 'Ask for a recent story (a trip, a funny moment) and help them shape it with a beginning, middle and end.' },
  { id: 'i3-detail', unitId: 'i3', levelId: 'intermediate', title: 'Adding colour', fn: 'Describe with detail and feeling', canDo: 'I can add detail and emotion to a story.', phrases: ['It was absolutely…', 'I was so…', 'Suddenly…', "Honestly, I couldn't believe it", 'The best part was…'], scenario: 'Get them to retell a moment with more vivid detail, emotion and emphasis.' },

  { id: 'i4-introduce-pro', unitId: 'i4', levelId: 'intermediate', title: 'Professional introductions', fn: 'Introduce yourself at work', canDo: 'I can introduce myself professionally.', phrases: ['Hi, I\'m … from …', 'I look after…', "I've been with … for…", 'Great to finally meet you', "I've heard a lot about…"], scenario: 'Play a new colleague or client; exchange professional introductions, roles and a little context.' },
  { id: 'i4-meeting', unitId: 'i4', levelId: 'intermediate', title: 'In a meeting', fn: 'Contribute to a meeting', canDo: 'I can contribute simply in a meeting.', phrases: ['Can I add something?', 'From my side…', "I'd suggest…", 'Just to confirm…', 'Shall we…?'], scenario: 'Run a tiny team check-in and invite them to give an update and a suggestion.' },

  { id: 'i5-phone', unitId: 'i5', levelId: 'intermediate', title: 'Phone etiquette', fn: 'Handle a phone call', canDo: 'I can handle a phone call clearly.', phrases: ['Hello, this is …', 'Could I speak to…?', 'Sorry, could you repeat that?', 'Let me just check…', "I'll get back to you"], scenario: 'Play someone on a call; practise opening, clarifying and closing a call clearly.' },
  { id: 'i5-clarify', unitId: 'i5', levelId: 'intermediate', title: 'Clarify & confirm', fn: 'Confirm details', canDo: 'I can clarify and confirm details like names, numbers and spelling.', phrases: ['Could you spell that?', "So that's …, correct?", 'Let me read that back…', 'Sorry, did you say … or …?', 'Just to be sure…'], scenario: 'Give them a name, an address and a time (a little quickly); get them to confirm and spell things back.' },

  { id: 'i6-complain', unitId: 'i6', levelId: 'intermediate', title: 'Complaining politely', fn: 'Complain and ask for a fix', canDo: 'I can complain politely and ask for a solution.', phrases: ["I'm afraid there's a problem with…", "This isn't quite what I expected", 'Would it be possible to…?', "I'd appreciate it if…", 'How can we sort this out?'], scenario: 'Play a shop, hotel or support agent; the learner complains about an issue and works towards a fix.' },
  { id: 'i6-apologise', unitId: 'i6', levelId: 'intermediate', title: 'Apologising & fixing', fn: 'Apologise and offer a fix', canDo: 'I can apologise and offer to make things right.', phrases: ["I'm really sorry about…", "That's my fault", 'Let me fix that', 'What can I do to make it right?', "It won't happen again"], scenario: 'Set up a small mistake the learner made; get them to apologise sincerely and offer a fix.' },

  // ── Advanced ────────────────────────────────────────────────────────────
  { id: 'a1-structure', unitId: 'a1', levelId: 'advanced', title: 'Structuring a talk', fn: 'Open, body, close', canDo: 'I can structure and deliver a short talk.', phrases: ["Today I'd like to talk about…", 'There are three things…', 'First… / Next… / Finally…', 'To sum up…', 'Thanks — any questions?'], scenario: 'Ask them to give a one-minute mini-talk on a familiar topic; coach the structure by prompting each section.' },
  { id: 'a1-qa', unitId: 'a1', levelId: 'advanced', title: 'Handling questions', fn: 'Field questions', canDo: 'I can handle questions after speaking.', phrases: ['Great question', 'If I understand you correctly…', 'Let me come back to that', 'To answer directly…', 'Does that make sense?'], scenario: 'They present briefly; you ask a few pointed questions and they handle them calmly.' },

  { id: 'a2-persuade', unitId: 'a2', levelId: 'advanced', title: 'Making a case', fn: 'Persuade', canDo: 'I can make a persuasive case.', phrases: ['The main benefit is…', 'Imagine if…', 'What this means for you is…', 'Compared to…', "Here's why it matters"], scenario: 'They pitch an idea (a plan, a place to eat, a tool); push back gently so they have to persuade you.' },
  { id: 'a2-negotiate', unitId: 'a2', levelId: 'advanced', title: 'Negotiating', fn: 'Negotiate and push back', canDo: 'I can negotiate and push back diplomatically.', phrases: ["I see where you're coming from, but…", 'Could we meet in the middle?', 'What if we…?', 'I can offer…', "That's a bit difficult for me"], scenario: 'Negotiate something (a price, a deadline, a split); hold a position so they must find a middle ground.' },

  { id: 'a3-run', unitId: 'a3', levelId: 'advanced', title: 'Running a meeting', fn: 'Lead and align', canDo: 'I can run a short meeting and keep it on track.', phrases: ["Let's get started", 'The goal today is…', "Let's hear from…", "Let's park that for now", 'So the next steps are…'], scenario: 'Have them chair a one-minute meeting with you as a participant who wanders a little; keep them steering.' },
  { id: 'a3-feedback', unitId: 'a3', levelId: 'advanced', title: 'Giving feedback', fn: 'Give constructive feedback', canDo: 'I can give honest feedback kindly.', phrases: ["One thing that's working well is…", "I'd love to see more of…", 'Have you considered…?', 'My honest take is…', 'What support do you need?'], scenario: 'They give you feedback on a piece of work; coach a balance of warmth and honesty.' },

  { id: 'a4-answer', unitId: 'a4', levelId: 'advanced', title: 'Answering interview questions', fn: 'Answer common questions', canDo: 'I can answer common interview questions with structure.', phrases: ['Thanks for asking', 'In my last role, I…', 'For example,…', 'What I learned was…', "I'd bring … to this role"], scenario: 'Play an interviewer; ask two or three common questions and coach them to answer with situation–action–result.' },
  { id: 'a4-strengths', unitId: 'a4', levelId: 'advanced', title: 'Talking about strengths', fn: 'Sell your strengths', canDo: 'I can talk about my strengths and experience confidently.', phrases: ['One of my strengths is…', "I'm particularly good at…", 'A good example is…', 'People often say I…', "I've consistently…"], scenario: "Ask 'what are your strengths?' and 'why you?'; get them to answer with confidence and evidence." },

  { id: 'a5-natural', unitId: 'a5', levelId: 'advanced', title: 'Sounding natural', fn: 'Use natural phrasing', canDo: 'I can use natural, everyday phrasing.', phrases: ['To be honest…', 'Kind of / sort of', 'I guess…', 'That makes sense', 'No worries'], scenario: 'Have a relaxed free chat and nudge them to use softer, natural connectors instead of textbook English.' },
  { id: 'a5-diplomacy', unitId: 'a5', levelId: 'advanced', title: 'Diplomacy & hedging', fn: 'Soften and stay diplomatic', canDo: 'I can soften messages and stay diplomatic.', phrases: ['It might be worth…', "I'm not entirely sure, but…", 'Perhaps we could…', 'That could be tricky', "I'd lean towards…"], scenario: 'Pose slightly tense situations and get them to respond diplomatically, hedging where useful.' },
];

/* ── lookups ── */
const LESSON_INDEX = new Map(LESSONS.map((l, i) => [l.id, i]));

export function lessonById(id: string): Lesson | undefined {
  const i = LESSON_INDEX.get(id);
  return i === undefined ? undefined : LESSONS[i];
}
export function unitById(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}
export function unitsByLevel(levelId: LevelId): Unit[] {
  return UNITS.filter((u) => u.levelId === levelId);
}
export function lessonsByUnit(unitId: string): Lesson[] {
  return LESSONS.filter((l) => l.unitId === unitId);
}
export function lessonsByLevel(levelId: LevelId): Lesson[] {
  return LESSONS.filter((l) => l.levelId === levelId);
}
export function firstLessonOfUnit(unitId: string): Lesson | undefined {
  return LESSONS.find((l) => l.unitId === unitId);
}

function placementStartIndex(startUnitId?: string): number {
  if (!startUnitId) return 0;
  const i = LESSONS.findIndex((l) => l.unitId === startUnitId);
  return i < 0 ? 0 : i;
}

/** The next lesson to do: first incomplete from the placement start, else from the top. */
export function nextLesson(completedIds: string[], startUnitId?: string): Lesson | undefined {
  const done = new Set(completedIds);
  const start = placementStartIndex(startUnitId);
  for (let i = start; i < LESSONS.length; i++) if (!done.has(LESSONS[i]!.id)) return LESSONS[i];
  for (let i = 0; i < start; i++) if (!done.has(LESSONS[i]!.id)) return LESSONS[i];
  return undefined; // course complete
}

/** Furthest unlocked index = the current lesson's index (sequential gate + placement). */
function unlockedThrough(completedIds: string[], startUnitId?: string): number {
  const nl = nextLesson(completedIds, startUnitId);
  const ptr = nl ? LESSON_INDEX.get(nl.id)! : LESSONS.length - 1;
  return Math.max(placementStartIndex(startUnitId), ptr);
}

export function isLessonUnlocked(id: string, completedIds: string[], startUnitId?: string): boolean {
  const idx = LESSON_INDEX.get(id);
  if (idx === undefined) return false;
  return idx <= unlockedThrough(completedIds, startUnitId);
}

export interface Progress {
  done: number;
  total: number;
  pct: number;
}

export function levelProgress(levelId: LevelId, completedIds: string[]): Progress {
  const done = new Set(completedIds);
  const inLevel = lessonsByLevel(levelId);
  const d = inLevel.filter((l) => done.has(l.id)).length;
  const total = inLevel.length;
  return { done: d, total, pct: total ? Math.round((d / total) * 100) : 0 };
}

export function courseProgress(completedIds: string[]): Progress {
  const done = new Set(completedIds);
  const d = LESSONS.filter((l) => done.has(l.id)).length;
  return { done: d, total: LESSONS.length, pct: LESSONS.length ? Math.round((d / LESSONS.length) * 100) : 0 };
}
