const unsafePatterns = [
  { type: 'self_harm', pattern: /\b(kill myself|suicide|self harm)\b/i },
  { type: 'abuse', pattern: /\b(hate you|stupid idiot|shut up)\b/i },
  { type: 'harassment', pattern: /\b(threaten|beat you|hurt you)\b/i },
];

export const defaultCostRates = {
  textInputPerThousandChars: 0.00015,
  textOutputPerThousandChars: 0.0003,
  audioPerMinute: 0.002,
};

export const moderateLearnerText = (text) => {
  const match = unsafePatterns.find((item) => item.pattern.test(text));
  return {
    safe: !match,
    category: match?.type ?? 'safe',
    message: match
      ? 'This practice turn needs a safer, supportive response. The tutor should pause correction and guide the learner to appropriate help or respectful language.'
      : 'No safety issue detected.',
  };
};

export const estimateAiCost = ({ inputChars = 0, outputChars = 0, audioMinutes = 0 }, rates = defaultCostRates) => Number((
  (inputChars / 1000) * rates.textInputPerThousandChars
  + (outputChars / 1000) * rates.textOutputPerThousandChars
  + audioMinutes * rates.audioPerMinute
).toFixed(4));

export const createQualityEvent = ({ kind, status = 'ok', latencyMs = 0, cost = 0, detail = '' }) => ({
  id: crypto.randomUUID(),
  kind,
  status,
  latencyMs,
  cost,
  detail,
  createdAt: new Date().toISOString(),
});

export const summarizeQualityEvents = (events) => {
  const latencyEvents = events.filter((event) => event.latencyMs > 0);
  const totalCost = events.reduce((total, event) => total + (event.cost ?? 0), 0);
  const errorCount = events.filter((event) => event.status !== 'ok').length;

  return {
    events: events.length,
    averageLatencyMs: latencyEvents.length
      ? Math.round(latencyEvents.reduce((total, event) => total + event.latencyMs, 0) / latencyEvents.length)
      : 0,
    totalCost: Number(totalCost.toFixed(4)),
    errorCount,
    reliabilityPercent: events.length ? Math.round(((events.length - errorCount) / events.length) * 100) : 100,
  };
};

export const applyRetentionPolicy = ({ transcript, corrections, reports }, { saveTranscript, retentionDays }, now = new Date()) => {
  if (!saveTranscript) {
    return { transcript: [], corrections, reports };
  }

  const cutoffMs = now.getTime() - retentionDays * 86400000;
  return {
    transcript: transcript.filter((turn) => new Date(turn.timestamp).getTime() >= cutoffMs),
    corrections,
    reports,
  };
};
