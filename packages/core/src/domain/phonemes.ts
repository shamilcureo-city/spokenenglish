/**
 * Pronunciation drill data — ties the `ph.*` phoneme skills to practiceable
 * minimal pairs, examples, and articulation tips. Canonical source in `core`;
 * the Pronunciation practice screen renders these and grades them into FSRS.
 * Mother-tongue-specific tips come from `l1_transfer_rules` (phonetic category).
 */

export interface PhonemeDrill {
  skillId: string;
  label: string;
  sound: string; // IPA-ish display, e.g. "/v/ vs /w/"
  minimalPair?: { a: string; b: string };
  examples: string[];
  tip: string; // generic articulation tip (English)
}

export const phonemeDrills: PhonemeDrill[] = [
  {
    skillId: 'ph.v_w_distinction',
    label: 'V vs W',
    sound: '/v/ – /w/',
    minimalPair: { a: 'vine', b: 'wine' },
    examples: ['very', 'west', 'voice', 'water'],
    tip: 'For /v/, touch your top teeth to your bottom lip. For /w/, round your lips — don\'t touch.',
  },
  {
    skillId: 'ph.theta_voiceless',
    label: 'TH as in "think"',
    sound: '/θ/',
    minimalPair: { a: 'thin', b: 'tin' },
    examples: ['think', 'three', 'month', 'bath'],
    tip: 'Put your tongue lightly between your teeth and push air out — no voice.',
  },
  {
    skillId: 'ph.eth_voiced',
    label: 'TH as in "this"',
    sound: '/ð/',
    minimalPair: { a: 'they', b: 'day' },
    examples: ['this', 'mother', 'breathe', 'the'],
    tip: 'Tongue between the teeth, but add voice — feel your throat buzz.',
  },
  {
    skillId: 'ph.z_s',
    label: 'Z vs S',
    sound: '/z/ – /s/',
    minimalPair: { a: 'zip', b: 'sip' },
    examples: ['zoo', 'buzz', 'eyes', 'busy'],
    tip: '/z/ buzzes (voice on); /s/ hisses (no voice). Touch your throat to feel the difference.',
  },
  {
    skillId: 'ph.ship_sheep',
    label: 'Short i vs long ee',
    sound: '/ɪ/ – /iː/',
    minimalPair: { a: 'ship', b: 'sheep' },
    examples: ['bit / beat', 'fill / feel', 'live / leave'],
    tip: '/iː/ is long and tense — smile. /ɪ/ is short and relaxed.',
  },
  {
    skillId: 'ph.cat_cut',
    label: 'A vs U',
    sound: '/æ/ – /ʌ/',
    minimalPair: { a: 'cat', b: 'cut' },
    examples: ['bat / but', 'ran / run', 'cap / cup'],
    tip: '/æ/ opens the mouth wide; /ʌ/ is a short, central "uh".',
  },
  {
    skillId: 'ph.p_f',
    label: 'P vs F',
    sound: '/p/ – /f/',
    minimalPair: { a: 'pan', b: 'fan' },
    examples: ['pull / full', 'copy / coffee', 'pine / fine'],
    tip: '/p/ pops with both lips; /f/ is teeth-on-lip and continuous.',
  },
  {
    skillId: 'ph.sh_s',
    label: 'SH vs S',
    sound: '/ʃ/ – /s/',
    minimalPair: { a: 'she', b: 'see' },
    examples: ['ship / sip', 'wash / was', 'shave / save'],
    tip: '/ʃ/ is rounded and hushed; /s/ is sharp and bright.',
  },
  {
    skillId: 'ph.retroflex_t_d',
    label: 'Alveolar T / D',
    sound: '/t/  /d/',
    examples: ['time', 'day', 'water', 'letter'],
    tip: 'Tap the ridge just behind your teeth — don\'t curl your tongue back.',
  },
  {
    skillId: 'ph.schwa',
    label: 'The schwa',
    sound: '/ə/',
    examples: ['about', 'banana', 'sofa', 'support'],
    tip: 'The weak "uh" in unstressed syllables — short and relaxed, never stressed.',
  },
  {
    skillId: 'ph.word_stress',
    label: 'Word stress',
    sound: 'STRESS',
    examples: ['PHO-to-graph', 'pho-TO-gra-pher', 'pho-to-GRA-phic'],
    tip: 'Stress one syllable louder and longer. English rhythm depends on it.',
  },
  {
    skillId: 'ph.final_consonant_voicing',
    label: 'Final consonants',
    sound: 'final /g/ /d/ /b/',
    minimalPair: { a: 'bag', b: 'back' },
    examples: ['dog', 'leave', 'code', 'his'],
    tip: 'Don\'t drop or devoice final consonants — say "bag", not "back".',
  },
];

const BY_SKILL = new Map(phonemeDrills.map((d) => [d.skillId, d]));

export function getPhonemeDrill(skillId: string): PhonemeDrill | undefined {
  return BY_SKILL.get(skillId);
}
