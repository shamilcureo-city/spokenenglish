export const createTurn = (speaker, phase, text) => ({
  id: crypto.randomUUID(),
  speaker,
  phase,
  text,
  timestamp: new Date().toISOString(),
});

export const createSessionRuntime = (lesson, now = new Date()) => ({
  lessonId: lesson.id,
  startedAt: now.toISOString(),
  currentPhase: lesson.steps[0].phase,
  completedPhases: [],
  status: 'in_progress',
});

export const getPhaseIndex = (lesson, phase) => Math.max(0, lesson.steps.findIndex((step) => step.phase === phase));

export const getPhaseProgress = (lesson, phase) => {
  const currentIndex = getPhaseIndex(lesson, phase);
  return {
    currentIndex,
    totalPhases: lesson.steps.length,
    percent: Math.round(((currentIndex + 1) / lesson.steps.length) * 100),
  };
};

export const getSessionElapsedMinutes = (startedAt, now = new Date()) => {
  if (!startedAt) return 0;
  const elapsedMs = now.getTime() - new Date(startedAt).getTime();
  return Math.max(0, Number((elapsedMs / 60000).toFixed(1)));
};

export const getNextPhase = (lesson, phase) => {
  const index = getPhaseIndex(lesson, phase);
  return lesson.steps[Math.min(index + 1, lesson.steps.length - 1)].phase;
};

export const shouldResumeSession = (runtime, now = new Date()) => {
  if (!runtime?.startedAt || runtime.status !== 'in_progress') return false;
  const elapsedHours = (now.getTime() - new Date(runtime.startedAt).getTime()) / 3600000;
  return elapsedHours < 24;
};

export const calculateStreak = (previousStreak, lastCompletedAt, completedAt = new Date()) => {
  if (!lastCompletedAt) return 1;

  const previous = new Date(lastCompletedAt);
  const current = new Date(completedAt);
  const previousDay = Date.UTC(previous.getUTCFullYear(), previous.getUTCMonth(), previous.getUTCDate());
  const currentDay = Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate());
  const diffDays = Math.round((currentDay - previousDay) / 86400000);

  if (diffDays === 0) return previousStreak;
  if (diffDays === 1) return previousStreak + 1;
  return 1;
};
