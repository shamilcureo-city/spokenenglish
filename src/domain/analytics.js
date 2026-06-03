const unique = (items) => [...new Set(items.filter(Boolean))];

const clampPercent = (value) => Math.max(0, Math.min(100, Math.round(value)));

export const createAnalyticsEvent = (name, properties = {}, now = new Date()) => ({
  id: crypto.randomUUID(),
  name,
  properties,
  createdAt: now.toISOString(),
});

export const summarizeLearnerAnalytics = ({
  profile = {},
  transcript = [],
  corrections = [],
  reports = [],
  progress = {},
  usage = {},
  billingEvents = [],
  qualityEvents = [],
  safetyEvents = [],
  analyticsEvents = [],
}) => {
  const learnerTurns = transcript.filter((turn) => turn.speaker === 'learner');
  const completedSessions = Object.values(progress).reduce((total, item) => total + (item.completedSessions ?? 0), 0);
  const paidPlan = profile.plan && profile.plan !== 'Starter';
  const errorEvents = qualityEvents.filter((event) => event.status !== 'ok');

  const funnel = [
    { key: 'profile', label: 'Profile created', complete: Boolean(profile.name && profile.supportLanguage) },
    { key: 'session', label: 'Session started', complete: analyticsEvents.some((event) => event.name === 'session_started') || learnerTurns.length > 0 },
    { key: 'speaking', label: 'First speaking turn', complete: learnerTurns.length > 0 },
    { key: 'correction', label: 'First correction', complete: corrections.length > 0 },
    { key: 'report', label: 'Report saved', complete: reports.length > 0 },
    { key: 'paid', label: 'Paid plan intent', complete: Boolean(paidPlan || billingEvents.some((event) => event.status === 'payment_success')) },
  ];

  const activationScore = clampPercent((funnel.filter((step) => step.complete).length / funnel.length) * 100);
  const alertRules = [
    learnerTurns.length === 0 && 'No learner speaking turn yet; push the Try correction CTA in onboarding.',
    reports.length === 0 && 'No saved daily report yet; remind learners to finish the 30-minute session.',
    safetyEvents.length > 0 && `${safetyEvents.length} safety event(s) need review before beta scaling.`,
    errorEvents.length > 0 && `${errorEvents.length} reliability event(s) need engineering triage.`,
    (usage.usedMinutes ?? 0) >= 25 && profile.plan === 'Starter' && 'Starter learner is close to the daily cap; show upgrade nudge.',
  ].filter(Boolean);

  return {
    activationScore,
    funnel,
    engagement: {
      learnerTurns: learnerTurns.length,
      aiTurns: transcript.filter((turn) => turn.speaker === 'ai').length,
      savedReports: reports.length,
      completedSessions,
      usedMinutes: usage.usedMinutes ?? 0,
      streak: profile.streak ?? 0,
      lessonsTouched: unique([...Object.keys(progress), ...reports.map((report) => report.lessonId)]).length,
    },
    quality: {
      events: qualityEvents.length,
      errorEvents: errorEvents.length,
      safetyEvents: safetyEvents.length,
    },
    alerts: alertRules.length ? alertRules : ['No critical beta alerts for this local learner.'],
  };
};

export const createBetaReadinessChecklist = (summary) => [
  {
    item: 'Activation funnel reaches 50%+',
    status: summary.activationScore >= 50 ? 'ready' : 'needs_work',
  },
  {
    item: 'At least one speaking turn captured',
    status: summary.engagement.learnerTurns > 0 ? 'ready' : 'needs_work',
  },
  {
    item: 'Daily report generated and saved',
    status: summary.engagement.savedReports > 0 ? 'ready' : 'needs_work',
  },
  {
    item: 'Reliability events below two',
    status: summary.quality.errorEvents < 2 ? 'ready' : 'needs_work',
  },
];

export const createPilotExport = ({ profile = {}, analyticsSummary, generatedAt = new Date().toISOString() }) => ({
  generatedAt,
  learner: {
    name: profile.name,
    supportLanguage: profile.supportLanguage,
    goal: profile.goal,
    level: profile.level,
    plan: profile.plan,
  },
  activationScore: analyticsSummary.activationScore,
  engagement: analyticsSummary.engagement,
  quality: analyticsSummary.quality,
  alerts: analyticsSummary.alerts,
});
