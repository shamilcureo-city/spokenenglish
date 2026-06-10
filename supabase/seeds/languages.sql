-- languages
-- AUTO-GENERATED from packages/core by scripts/gen-seeds.ts — do not edit by hand.
insert into languages (code, native_name, greeting, encouragement, correction_label) values
  ('Hindi', 'हिन्दी', 'नमस्ते!', 'आप बहुत अच्छा कर रहे हैं!', 'सुधार'),
  ('Tamil', 'தமிழ்', 'வணக்கம்!', 'நீங்கள் நன்றாக செய்கிறீர்கள்!', 'திருத்தம்'),
  ('Telugu', 'తెలుగు', 'నమస్కారం!', 'మీరు చాలా బాగా చేస్తున్నారు!', 'సరిచేయడం'),
  ('Kannada', 'ಕನ್ನಡ', 'ನಮಸ್ಕಾರ!', 'ನೀವು ಚೆನ್ನಾಗಿ ಮಾಡುತ್ತಿದ್ದೀರಿ!', 'ತಿದ್ದುಪಡಿ'),
  ('Malayalam', 'മലയാളം', 'നമസ്കാരം!', 'നിങ്ങൾ നന്നായി ചെയ്യുന്നു!', 'തിരുത്തൽ')
on conflict (code) do update set
  native_name = excluded.native_name, greeting = excluded.greeting,
  encouragement = excluded.encouragement, correction_label = excluded.correction_label;
