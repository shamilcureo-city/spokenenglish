/**
 * The L1→L2 transfer knowledge base — the regional-language moat.
 *
 * Each rule maps a high-frequency mother-tongue interference pattern to the L2
 * skill it disrupts, with the correction explanation authored IN the learner's
 * language (native script). Canonical source of truth in `core`; the Supabase
 * `l1_transfer_rules` seed is generated from this array.
 *
 * `regex` triggers run as a cheap client-side pre-filter; `phoneme` triggers are
 * evaluated server-side. Coverage: the five MVP languages, top transfer patterns.
 *
 * ⚠️  Native-script explanations are a careful first pass and should get a
 *     native-speaker linguistic QA pass before launch.
 */

import type { L1, L1TransferRule, TransferTrigger } from './types.js';

/* Shared English-text trigger patterns (the learner always speaks English, so a
   rule fires for whoever's L1 matches — `candidateRules` restricts by L1). */
const T_ARTICLE: TransferTrigger[] = [
  { kind: 'regex', pattern: '\\b(i am|he is|she is|you are)\\s+(doctor|engineer|teacher|student|nurse|manager|driver)\\b' },
];
const T_STATIVE: TransferTrigger[] = [
  { kind: 'regex', pattern: '\\bi am (knowing|understanding|wanting|liking|needing|believing|meaning)\\b' },
];
const T_UNCOUNT: TransferTrigger[] = [
  { kind: 'regex', pattern: '\\b(furnitures|informations|advices|equipments|luggages|softwares)\\b' },
];
const T_TAG: TransferTrigger[] = [{ kind: 'regex', pattern: "isn'?t it\\b" }];
const T_SOV: TransferTrigger[] = [
  { kind: 'regex', pattern: '\\bi (english|tamil|hindi|telugu|kannada|malayalam|food|tea) (speaking|talking|eating|drinking)\\b' },
];

const mk = (
  id: string,
  l1: L1,
  category: L1TransferRule['category'],
  skillId: string,
  title: string,
  cause: string,
  triggers: TransferTrigger[],
  explanation: string,
  contrast: { l1Form: string; l2Form: string },
  exampleErrors: string[],
): L1TransferRule => ({
  id,
  l1,
  category,
  skillId,
  title,
  cause,
  triggers,
  explanations: { [l1]: explanation },
  contrast,
  exampleErrors,
});

const ARTICLE_ERRORS = ['I am doctor', 'She is teacher'];
const STATIVE_ERRORS = ['I am knowing the answer', 'I am wanting tea'];
const UNCOUNT_ERRORS = ['He gave me many informations', 'We bought new furnitures'];
const TAG_ERRORS = ['You will join, isn\'t it?', 'They are ready, isn\'t it?'];
const SOV_ERRORS = ['I English speaking', 'I food eating now'];

export const L1_TRANSFER_RULES: L1TransferRule[] = [
  // ───────────────────────── Hindi ─────────────────────────
  mk('hi.article_omission', 'Hindi', 'grammar', 'gr.articles', 'Dropping articles (a / an / the)',
    'Hindi has no articles, so learners often omit "a", "an", and "the".', T_ARTICLE,
    'हिंदी में article नहीं होता, इसलिए a/an/the छूट जाता है। बोलिए: "I am a doctor"।',
    { l1Form: 'main doctor hoon', l2Form: 'I am a doctor' }, ARTICLE_ERRORS),
  mk('hi.stative_progressive', 'Hindi', 'grammar', 'gr.stative_verbs', 'Using stative verbs in the -ing form',
    'Hindi "main jaan raha hoon" maps to a progressive, but English keeps stative verbs simple.', T_STATIVE,
    'know, want, like जैसे stative verbs को continuous में नहीं कहते। "I am knowing" गलत है — कहिए "I know"।',
    { l1Form: 'main jaanta hoon', l2Form: 'I know' }, STATIVE_ERRORS),
  mk('hi.uncountable_plural', 'Hindi', 'grammar', 'gr.countability', 'Pluralising uncountable nouns',
    'English uncountable nouns feel countable in Hindi, producing "informations", "furnitures".', T_UNCOUNT,
    '"information", "furniture", "advice" uncountable हैं — इनका plural नहीं होता। कहिए "some information"।',
    { l1Form: 'bahut saari informations', l2Form: 'a lot of information' }, UNCOUNT_ERRORS),
  mk('hi.universal_tag', 'Hindi', 'pragmatic', 'fn.tag_questions', 'Using "isn\'t it?" as a universal tag',
    'Hindi "na?" fits every sentence, so learners over-use "isn\'t it?" as a catch-all tag.', T_TAG,
    'हर वाक्य में "isn\'t it?" मत लगाइए। Subject और verb के हिसाब से बदलता है: "You\'re coming, aren\'t you?"',
    { l1Form: 'tum aa rahe ho, na?', l2Form: "you're coming, aren't you?" }, TAG_ERRORS),
  mk('hi.v_w_merge', 'Hindi', 'phonetic', 'ph.v_w_distinction', 'Merging /v/ and /w/',
    'Hindi has one sound (व) for both /v/ and /w/, so "vine" and "wine" sound alike.',
    [{ kind: 'phoneme', pattern: 'v~w' }],
    '/v/ के लिए ऊपर के दाँत नीचे के होंठ पर लगाइए (very); /w/ के लिए होंठ गोल कीजिए (water)।',
    { l1Form: 'व (one sound)', l2Form: '/v/ very vs /w/ water' }, ['wery good', 'I want some vater']),

  // ───────────────────────── Tamil ─────────────────────────
  mk('ta.article_omission', 'Tamil', 'grammar', 'gr.articles', 'Dropping articles (a / an / the)',
    'Tamil has no articles, so "a", "an", and "the" are commonly omitted.', T_ARTICLE,
    'தமிழில் article கிடையாது, அதனால் a/an/the விட்டுப்போகும். சொல்லுங்கள்: "I am an engineer".',
    { l1Form: 'naan engineer', l2Form: 'I am an engineer' }, ARTICLE_ERRORS),
  mk('ta.sov_residue', 'Tamil', 'grammar', 'gr.word_order', 'Subject-Object-Verb order carried into English',
    'Tamil is verb-final (SOV); English is SVO, so the verb sometimes lands at the end.', T_SOV,
    'English-ல் verb முன்னால் வரும்: "I am speaking English" — "I English speaking" அல்ல.',
    { l1Form: 'naan English pesuren', l2Form: 'I speak English' }, SOV_ERRORS),
  mk('ta.stative_progressive', 'Tamil', 'grammar', 'gr.stative_verbs', 'Using stative verbs in the -ing form',
    'Dravidian aspect lets stative verbs take a continuous form that English does not.', T_STATIVE,
    'know, want, like போன்ற verbs-ஐ continuous-ல் சொல்லக்கூடாது. "I am knowing" தவறு — "I know".',
    { l1Form: 'enakku theriyum', l2Form: 'I know' }, STATIVE_ERRORS),
  mk('ta.uncountable_plural', 'Tamil', 'grammar', 'gr.countability', 'Pluralising uncountable nouns',
    'Some English uncountable nouns feel countable, producing "informations", "furnitures".', T_UNCOUNT,
    '"information", "furniture", "advice" uncountable — இவற்றுக்கு plural இல்லை. "some information".',
    { l1Form: 'romba informations', l2Form: 'a lot of information' }, UNCOUNT_ERRORS),
  mk('ta.universal_tag', 'Tamil', 'pragmatic', 'fn.tag_questions', 'Using "isn\'t it?" as a universal tag',
    'A single Tamil tag fits everything, so "isn\'t it?" gets over-used.', T_TAG,
    'எல்லா வாக்கியத்திலும் "isn\'t it?" சேர்க்க வேண்டாம். Subject, verb-ஐ பொறுத்து மாறும்: "You\'re coming, aren\'t you?"',
    { l1Form: 'varuvinga, illaya?', l2Form: "you're coming, aren't you?" }, TAG_ERRORS),
  mk('ta.retroflex_stops', 'Tamil', 'phonetic', 'ph.retroflex_t_d', 'Retroflex /t/ /d/ for English alveolar',
    'Tamil uses retroflex stops where English uses alveolar /t/ /d/.',
    [{ kind: 'phoneme', pattern: 't~d-retroflex' }],
    'English /t/, /d/ — நாக்கை அண்ணத்தில் வைக்காமல், பல் பின்னால் லேசாக வையுங்கள். "time", "day".',
    { l1Form: 'ட/ட் (retroflex)', l2Form: 'alveolar t / d' }, [' time', 'day']),

  // ───────────────────────── Telugu ─────────────────────────
  mk('te.article_omission', 'Telugu', 'grammar', 'gr.articles', 'Dropping articles (a / an / the)',
    'Telugu has no articles, so "a", "an", and "the" are commonly omitted.', T_ARTICLE,
    'తెలుగులో article ఉండదు, అందుకే a/an/the వదిలేస్తారు. చెప్పండి: "I am an engineer".',
    { l1Form: 'nenu engineer', l2Form: 'I am an engineer' }, ARTICLE_ERRORS),
  mk('te.sov_residue', 'Telugu', 'grammar', 'gr.word_order', 'Subject-Object-Verb order carried into English',
    'Telugu is verb-final (SOV); English is SVO, so the verb can land at the end.', T_SOV,
    'English-లో verb ముందు వస్తుంది: "I am speaking English" — "I English speaking" కాదు.',
    { l1Form: 'nenu English maatladtanu', l2Form: 'I speak English' }, SOV_ERRORS),
  mk('te.stative_progressive', 'Telugu', 'grammar', 'gr.stative_verbs', 'Using stative verbs in the -ing form',
    'Dravidian aspect allows a continuous form for stative verbs that English does not.', T_STATIVE,
    'know, want, like లాంటి verbs ను continuous లో చెప్పకూడదు. "I am knowing" తప్పు — "I know".',
    { l1Form: 'naaku telusu', l2Form: 'I know' }, STATIVE_ERRORS),
  mk('te.uncountable_plural', 'Telugu', 'grammar', 'gr.countability', 'Pluralising uncountable nouns',
    'Some English uncountable nouns feel countable, producing "informations", "furnitures".', T_UNCOUNT,
    '"information", "furniture", "advice" uncountable — వీటికి plural ఉండదు. "some information".',
    { l1Form: 'chala informations', l2Form: 'a lot of information' }, UNCOUNT_ERRORS),
  mk('te.universal_tag', 'Telugu', 'pragmatic', 'fn.tag_questions', 'Using "isn\'t it?" as a universal tag',
    'A single Telugu tag fits everything, so "isn\'t it?" gets over-used.', T_TAG,
    'ప్రతి వాక్యంలో "isn\'t it?" పెట్టకండి. Subject, verb బట్టి మారుతుంది: "You\'re coming, aren\'t you?"',
    { l1Form: 'vastunnaru kada?', l2Form: "you're coming, aren't you?" }, TAG_ERRORS),
  mk('te.theta', 'Telugu', 'phonetic', 'ph.theta_voiceless', 'The TH sound /θ/',
    'Telugu has no /θ/, so "think" becomes "tink".',
    [{ kind: 'phoneme', pattern: 'theta' }],
    '"think", "three" లో /θ/ — నాలుకను పళ్ళ మధ్య పెట్టి గాలి వదలండి. "t" కాదు.',
    { l1Form: 'ట (t)', l2Form: '/θ/ think' }, ['tink', 'tree (three)']),

  // ───────────────────────── Kannada ─────────────────────────
  mk('kn.article_omission', 'Kannada', 'grammar', 'gr.articles', 'Dropping articles (a / an / the)',
    'Kannada has no articles, so "a", "an", and "the" are commonly omitted.', T_ARTICLE,
    'ಕನ್ನಡದಲ್ಲಿ article ಇಲ್ಲ, ಆದ್ದರಿಂದ a/an/the ಬಿಟ್ಟುಹೋಗುತ್ತದೆ. ಹೇಳಿ: "I am an engineer".',
    { l1Form: 'naanu engineer', l2Form: 'I am an engineer' }, ARTICLE_ERRORS),
  mk('kn.sov_residue', 'Kannada', 'grammar', 'gr.word_order', 'Subject-Object-Verb order carried into English',
    'Kannada is verb-final (SOV); English is SVO, so the verb can land at the end.', T_SOV,
    'English-ನಲ್ಲಿ verb ಮೊದಲು ಬರುತ್ತದೆ: "I am speaking English" — "I English speaking" ಅಲ್ಲ.',
    { l1Form: 'naanu English maataduttene', l2Form: 'I speak English' }, SOV_ERRORS),
  mk('kn.stative_progressive', 'Kannada', 'grammar', 'gr.stative_verbs', 'Using stative verbs in the -ing form',
    'Dravidian aspect allows a continuous form for stative verbs that English does not.', T_STATIVE,
    'know, want, like ಮುಂತಾದ verbs ಅನ್ನು continuous ನಲ್ಲಿ ಹೇಳಬಾರದು. "I am knowing" ತಪ್ಪು — "I know".',
    { l1Form: 'nanage gottu', l2Form: 'I know' }, STATIVE_ERRORS),
  mk('kn.uncountable_plural', 'Kannada', 'grammar', 'gr.countability', 'Pluralising uncountable nouns',
    'Some English uncountable nouns feel countable, producing "informations", "furnitures".', T_UNCOUNT,
    '"information", "furniture", "advice" uncountable — ಇವುಗಳಿಗೆ plural ಇಲ್ಲ. "some information".',
    { l1Form: 'thumba informations', l2Form: 'a lot of information' }, UNCOUNT_ERRORS),
  mk('kn.universal_tag', 'Kannada', 'pragmatic', 'fn.tag_questions', 'Using "isn\'t it?" as a universal tag',
    'A single Kannada tag fits everything, so "isn\'t it?" gets over-used.', T_TAG,
    'ಪ್ರತಿ ವಾಕ್ಯದಲ್ಲೂ "isn\'t it?" ಹಾಕಬೇಡಿ. Subject, verb ಆಧಾರದ ಮೇಲೆ ಬದಲಾಗುತ್ತದೆ: "You\'re coming, aren\'t you?"',
    { l1Form: 'baruttira, alva?', l2Form: "you're coming, aren't you?" }, TAG_ERRORS),
  mk('kn.theta', 'Kannada', 'phonetic', 'ph.theta_voiceless', 'The TH sound /θ/',
    'Kannada has no /θ/, so "think" becomes "tink".',
    [{ kind: 'phoneme', pattern: 'theta' }],
    '"think" ನಲ್ಲಿ /θ/ — ನಾಲಿಗೆಯನ್ನು ಹಲ್ಲುಗಳ ನಡುವೆ ಇಟ್ಟು ಗಾಳಿ ಬಿಡಿ. "t" ಅಲ್ಲ.',
    { l1Form: 'ಟ (t)', l2Form: '/θ/ think' }, ['tink', 'tree (three)']),

  // ───────────────────────── Malayalam ─────────────────────────
  mk('ml.article_omission', 'Malayalam', 'grammar', 'gr.articles', 'Dropping articles (a / an / the)',
    'Malayalam has no articles, so "a", "an", and "the" are commonly omitted.', T_ARTICLE,
    'മലയാളത്തിൽ article ഇല്ല, അതുകൊണ്ട് a/an/the വിട്ടുപോകുന്നു. പറയൂ: "I am an engineer".',
    { l1Form: 'njaan engineer', l2Form: 'I am an engineer' }, ARTICLE_ERRORS),
  mk('ml.sov_residue', 'Malayalam', 'grammar', 'gr.word_order', 'Subject-Object-Verb order carried into English',
    'Malayalam is verb-final (SOV); English is SVO, so the verb can land at the end.', T_SOV,
    'English-ൽ verb മുന്നിൽ വരും: "I am speaking English" — "I English speaking" അല്ല.',
    { l1Form: 'njaan English samsaarikkunnu', l2Form: 'I speak English' }, SOV_ERRORS),
  mk('ml.stative_progressive', 'Malayalam', 'grammar', 'gr.stative_verbs', 'Using stative verbs in the -ing form',
    'Dravidian aspect allows a continuous form for stative verbs that English does not.', T_STATIVE,
    'know, want, like പോലുള്ള verbs continuous-ൽ പറയരുത്. "I am knowing" തെറ്റാണ് — "I know".',
    { l1Form: 'enikku ariyaam', l2Form: 'I know' }, STATIVE_ERRORS),
  mk('ml.uncountable_plural', 'Malayalam', 'grammar', 'gr.countability', 'Pluralising uncountable nouns',
    'Some English uncountable nouns feel countable, producing "informations", "furnitures".', T_UNCOUNT,
    '"information", "furniture", "advice" uncountable — ഇവയ്ക്ക് plural ഇല്ല. "some information".',
    { l1Form: 'orupaad informations', l2Form: 'a lot of information' }, UNCOUNT_ERRORS),
  mk('ml.universal_tag', 'Malayalam', 'pragmatic', 'fn.tag_questions', 'Using "isn\'t it?" as a universal tag',
    'A single Malayalam tag fits everything, so "isn\'t it?" gets over-used.', T_TAG,
    'എല്ലാ വാക്യത്തിലും "isn\'t it?" ചേർക്കരുത്. Subject, verb അനുസരിച്ച് മാറും: "You\'re coming, aren\'t you?"',
    { l1Form: 'varunnille?', l2Form: "you're coming, aren't you?" }, TAG_ERRORS),
  mk('ml.theta', 'Malayalam', 'phonetic', 'ph.theta_voiceless', 'The TH sound /θ/',
    'Malayalam has no /θ/, so "think" becomes "tink".',
    [{ kind: 'phoneme', pattern: 'theta' }],
    '"think"-ൽ /θ/ — നാവ് പല്ലുകൾക്കിടയിൽ വെച്ച് കാറ്റ് വിടൂ. "t" അല്ല.',
    { l1Form: 'ട (t)', l2Form: '/θ/ think' }, ['tink', 'tree (three)']),
];
