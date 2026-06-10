/**
 * Safety & cost — ported from the original `quality.js`. Lightweight text
 * moderation plus a deterministic AI-cost estimator.
 */

export interface ModerationResult {
  safe: boolean;
  category: 'self_harm' | 'abuse' | 'harassment' | null;
  message: string | null;
}

const unsafePatterns: { category: NonNullable<ModerationResult['category']>; pattern: RegExp; message: string }[] = [
  {
    category: 'self_harm',
    pattern: /\b(kill myself|killing myself|suicide|end my life|hurt myself)\b/i,
    message:
      "It sounds like you're going through a really hard time. Please reach out to someone you trust or a local helpline — you're not alone.",
  },
  {
    category: 'abuse',
    pattern: /\b(i('| a)m being (beaten|abused|hit))\b/i,
    message: 'If you are in danger, please contact local authorities or a trusted person right away.',
  },
];

/** Flag clearly-unsafe learner text and return a supportive message. */
export function moderateLearnerText(text: string): ModerationResult {
  for (const p of unsafePatterns) {
    if (p.pattern.test(text)) return { safe: false, category: p.category, message: p.message };
  }
  return { safe: true, category: null, message: null };
}

export interface CostInput {
  inputChars?: number;
  outputChars?: number;
  audioMinutes?: number;
}

export interface CostRates {
  perInputChar?: number;
  perOutputChar?: number;
  perAudioMinute?: number;
}

const DEFAULT_RATES: Required<CostRates> = {
  perInputChar: 0.000001,
  perOutputChar: 0.000002,
  perAudioMinute: 0.01,
};

/** Estimate the AI cost (USD) of a session. Deterministic; rates overridable. */
export function estimateAiCost(input: CostInput, rates: CostRates = {}): number {
  const r = { ...DEFAULT_RATES, ...rates };
  const cost =
    (input.inputChars ?? 0) * r.perInputChar +
    (input.outputChars ?? 0) * r.perOutputChar +
    (input.audioMinutes ?? 0) * r.perAudioMinute;
  return Math.round(cost * 10000) / 10000;
}
