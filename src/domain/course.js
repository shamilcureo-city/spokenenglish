export const supportLanguages = ['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];

export const learnerGoals = ['Daily English', 'Interview English', 'Workplace English'];

const thirtyMinuteSteps = [
  {
    phase: 'Warm-up',
    minutes: 3,
    instruction: 'Ask simple personal questions and keep the learner comfortable.',
    prompt: 'Tell me your name, city, and what kind of job you want.',
  },
  {
    phase: 'Mini lesson',
    minutes: 5,
    instruction: 'Teach one reusable speaking structure for today\'s topic.',
    prompt: 'Use this structure: I am __. I completed __. My strength is __. I want to __.',
  },
  {
    phase: 'Guided practice',
    minutes: 10,
    instruction: 'Ask follow-up questions and correct grammar gently after each answer.',
    prompt: 'Answer in full sentences and repeat the corrected version when needed.',
  },
  {
    phase: 'Role play',
    minutes: 7,
    instruction: 'Act as the other person in a realistic Indian scenario.',
    prompt: 'Continue the conversation naturally and try not to stop after one line.',
  },
  {
    phase: 'Fluency challenge',
    minutes: 3,
    instruction: 'Let the learner speak continuously without interruption; correct afterwards.',
    prompt: 'Speak for one minute on the topic without stopping.',
  },
  {
    phase: 'Summary',
    minutes: 2,
    instruction: 'Summarize strengths, top corrections, vocabulary, and homework.',
    prompt: 'Repeat your best corrected sentence and note today\'s homework.',
  },
];

export const courseCatalog = [
  {
    id: 'interview-introduction-001',
    title: 'Confident self-introduction',
    course: 'Interview English',
    level: 'Career',
    scenario: 'Placement interview for a fresher job',
    outcome: 'Give a clear two-minute interview introduction.',
    steps: thirtyMinuteSteps.map((step) => ({ ...step })),
  },
  {
    id: 'daily-routine-001',
    title: 'Talk about your daily routine',
    course: 'Daily English',
    level: 'Beginner',
    scenario: 'Everyday conversation with a friend or teacher',
    outcome: 'Explain your morning, work or study time, and evening routine.',
    steps: thirtyMinuteSteps.map((step) => ({
      ...step,
      prompt: step.phase === 'Role play' ? 'Your friend asks what you did today. Explain in simple English.' : step.prompt,
    })),
  },
  {
    id: 'workplace-meeting-001',
    title: 'Speak in a team meeting',
    course: 'Workplace English',
    level: 'Intermediate',
    scenario: 'Daily stand-up meeting with a manager',
    outcome: 'Share yesterday\'s work, today\'s plan, and one blocker.',
    steps: thirtyMinuteSteps.map((step) => ({
      ...step,
      prompt: step.phase === 'Mini lesson' ? 'Use: Yesterday I completed __. Today I will __. I need help with __.' : step.prompt,
    })),
  },
  {
    id: 'customer-support-001',
    title: 'Handle a customer problem',
    course: 'Workplace English',
    level: 'Career',
    scenario: 'Customer support call for a delivery issue',
    outcome: 'Apologize, ask for details, explain the solution, and close politely.',
    steps: thirtyMinuteSteps.map((step) => ({
      ...step,
      prompt: step.phase === 'Role play' ? 'A customer says their order is late. Respond politely and solve it.' : step.prompt,
    })),
  },
];

export const dailyThirtyMinuteLesson = courseCatalog[0];

export const getLessonById = (lessonId) => courseCatalog.find((lesson) => lesson.id === lessonId) ?? dailyThirtyMinuteLesson;

export const getLessonTotalMinutes = (lesson) => lesson.steps.reduce((total, step) => total + step.minutes, 0);
