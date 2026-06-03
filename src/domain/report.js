const clamp = (score) => Math.max(30, Math.min(95, Math.round(score)));

export const estimateTalkTime = (turns) => {
  const learnerWords = turns
    .filter((turn) => turn.speaker === 'learner')
    .flatMap((turn) => turn.text.trim().split(/\s+/).filter(Boolean)).length;

  return Number(Math.max(1, learnerWords / 120).toFixed(1));
};

const average = (values) => {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
};

export const getScoreAverage = (scores) => average(Object.values(scores));

export const generatePronunciationFocus = (corrections) => {
  if (corrections.some((item) => item.mistakeType === 'pronunciation')) {
    return ['Practice final sounds clearly', 'Slow down difficult words before speaking naturally'];
  }

  if (corrections.some((item) => item.mistakeType === 'fluency')) {
    return ['Reduce long pauses', 'Speak in short complete sentences before extending answers'];
  }

  return ['Practice word stress in interview keywords', 'Read corrected sentences aloud three times'];
};

export const generateSessionReport = (sessionTitle, transcript, corrections) => {
  const talkTimeMinutes = estimateTalkTime(transcript);
  const learnerTurns = transcript.filter((turn) => turn.speaker === 'learner');
  const learnerText = learnerTurns.map((turn) => turn.text).join(' ');
  const uniqueWords = new Set(learnerText.toLowerCase().match(/[a-z]+/g) ?? []);
  const correctionPenalty = corrections.length * 6;
  const fluencyBase = learnerTurns.length >= 4 ? 74 : 62;
  const scores = {
    grammar: clamp(78 - correctionPenalty),
    vocabulary: clamp(55 + Math.min(uniqueWords.size, 35)),
    pronunciation: clamp(68 - corrections.filter((item) => item.mistakeType === 'pronunciation').length * 5),
    fluency: clamp(fluencyBase + talkTimeMinutes * 2 - corrections.filter((item) => item.mistakeType === 'fluency').length * 4),
    confidence: clamp(60 + learnerTurns.length * 5),
    listening: clamp(70 + transcript.filter((turn) => turn.phase === 'Role play').length * 2),
  };

  return {
    sessionTitle,
    generatedAt: new Date().toISOString(),
    talkTimeMinutes,
    learnerTurns: learnerTurns.length,
    overallScore: getScoreAverage(scores),
    scores,
    strengths: [
      'You completed the speaking turn instead of stopping after one sentence.',
      'You used interview-related vocabulary during the practice.',
      'You responded to follow-up questions, which builds real conversation confidence.',
    ],
    topCorrections: corrections.slice(0, 5),
    pronunciationFocus: generatePronunciationFocus(corrections),
    vocabulary: ['introduce', 'strength', 'responsibility', 'experience', 'goal'],
    homework: [
      'Record a one-minute self-introduction using the corrected sentences.',
      'Repeat each corrected sentence three times slowly and three times naturally.',
      'Prepare one example that proves your strongest skill.',
    ],
  };
};

export const createSavedReport = ({ report, lessonId, correctionMode }) => ({
  id: crypto.randomUUID(),
  lessonId,
  title: report.sessionTitle,
  date: new Date().toLocaleString('en-IN'),
  generatedAt: report.generatedAt,
  scores: report.scores,
  overallScore: report.overallScore,
  talkTimeMinutes: report.talkTimeMinutes,
  correctionCount: report.topCorrections.length,
  correctionMode,
  homework: report.homework,
  pronunciationFocus: report.pronunciationFocus,
  topCorrections: report.topCorrections,
});

export const generateWeeklyProgress = (reports) => {
  const recentReports = reports.slice(0, 7);
  const totalTalkTime = Number(recentReports.reduce((total, report) => total + (report.talkTimeMinutes ?? 0), 0).toFixed(1));
  const averageOverall = average(recentReports.map((report) => report.overallScore ?? getScoreAverage(report.scores ?? {})).filter(Boolean));
  const totalCorrections = recentReports.reduce((total, report) => total + (report.correctionCount ?? 0), 0);

  return {
    sessions: recentReports.length,
    totalTalkTime,
    averageOverall,
    totalCorrections,
    latestScore: recentReports[0]?.overallScore ?? 0,
    previousScore: recentReports[1]?.overallScore ?? 0,
    scoreDelta: recentReports.length >= 2 ? (recentReports[0].overallScore ?? 0) - (recentReports[1].overallScore ?? 0) : 0,
  };
};
