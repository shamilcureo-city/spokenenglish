export const correctionModes = [
  {
    id: 'gentle',
    label: 'Gentle',
    description: 'Correct after the learner finishes, best for beginners and confidence building.',
  },
  {
    id: 'realtime',
    label: 'Real-time',
    description: 'Correct important repeated mistakes immediately and ask for one repeat.',
  },
  {
    id: 'fluency',
    label: 'Fluency',
    description: 'Avoid interrupting; save corrections for review after the speaking turn.',
  },
];

export const getCorrectionMode = (modeId) => correctionModes.find((mode) => mode.id === modeId) ?? correctionModes[0];

export const createNotebookEntry = (correction) => ({
  id: correction.id,
  mistakeType: correction.mistakeType,
  original: correction.original,
  corrected: correction.corrected,
  explanation: correction.explanation,
  practicePrompt: correction.practicePrompt,
  practicedCount: correction.practicedCount ?? 0,
  mastered: correction.mastered ?? false,
  createdAt: correction.createdAt ?? new Date().toISOString(),
});

export const practiceNotebookEntry = (entry) => {
  const practicedCount = (entry.practicedCount ?? 0) + 1;
  return {
    ...entry,
    practicedCount,
    mastered: practicedCount >= 3,
  };
};

export const summarizeMistakeNotebook = (entries) => entries.reduce((summary, entry) => {
  const key = entry.mistakeType;
  summary[key] = (summary[key] ?? 0) + 1;
  return summary;
}, {});
