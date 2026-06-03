export const languageProfiles = {
  Hindi: {
    nativeName: 'हिन्दी',
    greeting: 'नमस्ते',
    encouragement: 'गलती करना ठीक है; बोलते रहिए.',
    correctionLabel: 'सुधार',
  },
  Tamil: {
    nativeName: 'தமிழ்',
    greeting: 'வணக்கம்',
    encouragement: 'தவறு பரவாயில்லை; தொடர்ந்து பேசுங்கள்.',
    correctionLabel: 'திருத்தம்',
  },
  Telugu: {
    nativeName: 'తెలుగు',
    greeting: 'నమస్తే',
    encouragement: 'తప్పులు సహజం; మాట్లాడటం కొనసాగించండి.',
    correctionLabel: 'సవరణ',
  },
  Kannada: {
    nativeName: 'ಕನ್ನಡ',
    greeting: 'ನಮಸ್ಕಾರ',
    encouragement: 'ತಪ್ಪು ಸರಿ; ಮಾತನಾಡುತ್ತಿರಿ.',
    correctionLabel: 'ತಿದ್ದುಪಡಿ',
  },
  Malayalam: {
    nativeName: 'മലയാളം',
    greeting: 'നമസ്കാരം',
    encouragement: 'തെറ്റ് പ്രശ്നമല്ല; സംസാരിച്ചുകൊണ്ടിരിക്കുക.',
    correctionLabel: 'തിരുത്തൽ',
  },
};

export const localizedCopy = {
  appPromise: {
    Hindi: 'हर दिन 30 मिनट बोलें, गलती सुधारें, और रिपोर्ट देखें.',
    Tamil: 'தினமும் 30 நிமிடம் பேசுங்கள், திருத்தம் பெறுங்கள், அறிக்கை பாருங்கள்.',
    Telugu: 'ప్రతి రోజు 30 నిమిషాలు మాట్లాడండి, సవరణలు పొందండి, రిపోర్ట్ చూడండి.',
    Kannada: 'ಪ್ರತಿ ದಿನ 30 ನಿಮಿಷ ಮಾತನಾಡಿ, ತಿದ್ದುಪಡಿ ಪಡೆದು ವರದಿ ನೋಡಿ.',
    Malayalam: 'പ്രതിദിനം 30 മിനിറ്റ് സംസാരിക്കുക, തിരുത്തൽ നേടുക, റിപ്പോർട്ട് കാണുക.',
  },
  sessionHint: {
    Hindi: 'पहले आत्मविश्वास, फिर शुद्धता. छोटे वाक्य बोलिए.',
    Tamil: 'முதலில் நம்பிக்கை, பிறகு துல்லியம். சிறிய வாக்கியங்களில் பேசுங்கள்.',
    Telugu: 'మొదట నమ్మకం, తర్వాత ఖచ్చితత్వం. చిన్న వాక్యాల్లో మాట్లాడండి.',
    Kannada: 'ಮೊದಲು ಆತ್ಮವಿಶ್ವಾಸ, ನಂತರ ಸರಿತನ. ಚಿಕ್ಕ ವಾಕ್ಯಗಳಲ್ಲಿ ಮಾತನಾಡಿ.',
    Malayalam: 'ആദ്യം ആത്മവിശ്വാസം, പിന്നെ കൃത്യത. ചെറിയ വാക്യങ്ങളിൽ സംസാരിക്കുക.',
  },
};

export const scenarioLibrary = [
  {
    id: 'placement-interview',
    title: 'Placement interview',
    category: 'Career',
    prompt: 'The HR manager asks you to introduce yourself and explain your strengths.',
  },
  {
    id: 'college-viva',
    title: 'College viva',
    category: 'College',
    prompt: 'Your teacher asks you to explain your project in simple English.',
  },
  {
    id: 'customer-call',
    title: 'Customer support call',
    category: 'Job',
    prompt: 'A customer is upset about a late order. Apologize and offer a solution.',
  },
  {
    id: 'railway-station',
    title: 'Railway station help',
    category: 'Daily English',
    prompt: 'Ask for platform information and explain where you need to go.',
  },
  {
    id: 'office-standup',
    title: 'Office stand-up',
    category: 'Workplace',
    prompt: 'Tell your manager what you did yesterday and what you will do today.',
  },
];

export const codeMixedExamples = {
  Hindi: 'Mujhe interview ke liye English practice karna hai → I want to practice English for my interview.',
  Tamil: 'Enakku interview English practice venum → I want to practice interview English.',
  Telugu: 'Naaku interview kosam English practice kavali → I want to practice English for my interview.',
  Kannada: 'Nanage interview English practice beku → I want to practice English for my interview.',
  Malayalam: 'Enikku interview English practice venam → I want to practice English for my interview.',
};

export const getLanguageProfile = (language) => languageProfiles[language] ?? languageProfiles.Hindi;

export const getLocalizedCopy = (key, language) => localizedCopy[key]?.[language] ?? localizedCopy[key]?.Hindi ?? '';

export const getCodeMixedExample = (language) => codeMixedExamples[language] ?? codeMixedExamples.Hindi;

export const getLocalizedScenarioPrompt = (scenario, language) => {
  const profile = getLanguageProfile(language);
  return `${profile.greeting}! ${scenario.prompt} ${profile.encouragement}`;
};
