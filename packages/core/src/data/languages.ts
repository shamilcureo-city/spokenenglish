/**
 * Supported mother-tongue (L1) profiles — ports `localization.js`.
 * Canonical source for the Supabase `languages` seed. `code` matches the English
 * name used by `profiles.l1` and the contrastive KB.
 */

export interface LanguageProfile {
  code: string; // 'Hindi', 'Tamil', ...
  nativeName: string;
  greeting: string;
  encouragement: string;
  correctionLabel: string;
}

export const LANGUAGES: LanguageProfile[] = [
  {
    code: 'Hindi',
    nativeName: 'हिन्दी',
    greeting: 'नमस्ते!',
    encouragement: 'आप बहुत अच्छा कर रहे हैं!',
    correctionLabel: 'सुधार',
  },
  {
    code: 'Tamil',
    nativeName: 'தமிழ்',
    greeting: 'வணக்கம்!',
    encouragement: 'நீங்கள் நன்றாக செய்கிறீர்கள்!',
    correctionLabel: 'திருத்தம்',
  },
  {
    code: 'Telugu',
    nativeName: 'తెలుగు',
    greeting: 'నమస్కారం!',
    encouragement: 'మీరు చాలా బాగా చేస్తున్నారు!',
    correctionLabel: 'సరిచేయడం',
  },
  {
    code: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    greeting: 'ನಮಸ್ಕಾರ!',
    encouragement: 'ನೀವು ಚೆನ್ನಾಗಿ ಮಾಡುತ್ತಿದ್ದೀರಿ!',
    correctionLabel: 'ತಿದ್ದುಪಡಿ',
  },
  {
    code: 'Malayalam',
    nativeName: 'മലയാളം',
    greeting: 'നമസ്കാരം!',
    encouragement: 'നിങ്ങൾ നന്നായി ചെയ്യുന്നു!',
    correctionLabel: 'തിരുത്തൽ',
  },
];
