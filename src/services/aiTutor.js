import { getCorrectionMode } from '../domain/correction.js';

const languageHint = {
  Hindi: 'Hindi explanation: past tense mein verb badalta hai.',
  Tamil: 'Tamil explanation: past tense meaning varumbothu verb form change aagum.',
  Telugu: 'Telugu explanation: past tense lo verb form marchali.',
  Kannada: 'Kannada explanation: past tense iddaga verb form change agutte.',
  Malayalam: 'Malayalam explanation: past tense aanel verb form maattanam.',
};

export const createTutorSystemPrompt = (supportLanguage, lessonTitle, correctionMode = 'gentle') => {
  const mode = getCorrectionMode(correctionMode);

  return `You are SpeakSaathi, a warm spoken-English teacher for Indian learners.
Lesson: ${lessonTitle}.
Support language: ${supportLanguage}.
Correction mode: ${mode.label} - ${mode.description}
Correct gently, avoid shame, prefer short explanations, and ask the learner to repeat corrected sentences.`;
};

const responseTextForMode = (modeId, corrected) => {
  if (modeId === 'realtime') {
    return `Quick correction before we continue: “${corrected}”. Repeat it once, then continue your answer.`;
  }

  if (modeId === 'fluency') {
    return 'Good, keep speaking. I saved one correction for review after this fluency turn.';
  }

  return `Good attempt. Small correction: “${corrected}”. Now say it once more with confidence.`;
};

export const getMockTutorResponse = (learnerTurn, supportLanguage, correctionMode = 'gentle') => {
  const text = learnerTurn.text.trim();
  const lower = text.toLowerCase();
  const mode = getCorrectionMode(correctionMode);

  if (lower.includes('i am completed') || lower.includes('i completed my degree in')) {
    const correction = {
      id: crypto.randomUUID(),
      original: text,
      corrected: text.replace(/i am completed/i, 'I have completed'),
      explanation: `${languageHint[supportLanguage]} Say “I have completed” when you talk about education already finished.`,
      supportLanguage,
      mistakeType: 'grammar',
      practicePrompt: 'Repeat: I have completed my degree and I am ready to learn.',
      correctionMode: mode.id,
      practicedCount: 0,
      mastered: false,
      createdAt: new Date().toISOString(),
    };

    return {
      aiText: responseTextForMode(mode.id, correction.corrected),
      correction,
    };
  }

  if (lower.includes('my strength is hard work')) {
    const correction = {
      id: crypto.randomUUID(),
      original: text,
      corrected: text.replace(/my strength is hard work/i, 'My strength is that I am hardworking'),
      explanation: `${languageHint[supportLanguage]} “Hardworking” describes you as a person; “hard work” is the activity.`,
      supportLanguage,
      mistakeType: 'vocabulary',
      practicePrompt: 'Repeat: My strength is that I am hardworking and responsible.',
      correctionMode: mode.id,
      practicedCount: 0,
      mastered: false,
      createdAt: new Date().toISOString(),
    };

    return {
      aiText: mode.id === 'gentle'
        ? `Nice answer. More natural sentence: “${correction.corrected}.” Can you add one example?`
        : responseTextForMode(mode.id, correction.corrected),
      correction,
    };
  }

  return {
    aiText: mode.id === 'fluency'
      ? 'Good. Keep speaking for a few more sentences; I will review corrections after the turn.'
      : 'Good. Please make it one sentence longer and include one example from your studies or work.',
  };
};
