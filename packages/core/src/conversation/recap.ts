/**
 * The confidence-first recap — the only place we "correct".
 *
 * `buildRecapPrompt` turns a finished transcript into a warm, specific recap:
 * what worked, 1–2 high-leverage fixes (explained in the mother tongue when it
 * helps), and a light 5-dimension mirror. For a lesson, it names the target
 * moves. Never shown mid-conversation. `parseRecap` defensively coerces the JSON.
 */

import type {
  ConversationMode,
  Recap,
  RecapDimensions,
  RecapFix,
  StrongerAnswer,
  Turn,
} from './types.js';
import type { Lesson } from './curriculum.js';

export interface RecapInput {
  transcript: Turn[];
  mode: ConversationMode;
  /** Mother tongue for the in-language explanations, e.g. "Hindi". */
  supportLanguage: string;
  /** lesson: the course lesson, so feedback names the target moves. */
  lesson?: Lesson;
}

function renderTranscript(transcript: Turn[]): string {
  return transcript.map((t) => `${t.speaker === 'learner' ? 'USER' : 'PARTNER'}: ${t.text}`).join('\n');
}

export function buildRecapPrompt(input: RecapInput): string {
  const { transcript, mode, supportLanguage, lesson } = input;

  const lessonBlock = lesson
    ? [
        `They just did a lesson on: ${lesson.fn} (goal: "${lesson.canDo}").`,
        `The target moves they were practising: ${lesson.phrases.join(' · ')}.`,
        'In "wins", note which target moves they actually used and how naturally. In "fixes", if they avoided or fumbled a key move, gently nudge them to try it next time.',
      ].join('\n')
    : '';

  const what = mode === 'lesson' ? 'a short speaking lesson' : 'a short warm-up chat';

  return [
    'You are a warm, encouraging spoken-English coach. Your job is to build confidence.',
    `They just finished ${what}. Give a CONFIDENCE-FIRST recap.`,
    lessonBlock,
    '',
    'Principles:',
    '- Lead with what worked. Be specific and encouraging. Never shame.',
    '- Focus on being clearly understood: clarity, natural phrasing, the right moves, and confidence. Only flag grammar when it genuinely blocks understanding.',
    '- Quote what they actually said. Keep it tight: at most 2 wins and at most 2 fixes (the highest-leverage ones).',
    `- For a fix that is a language/phrasing point, also write "explanationInL1" in ${supportLanguage} using its native script, so it clicks. If a fix is not language-related, omit explanationInL1.`,
    '- For "delivery": one short, encouraging tip about how it SOUNDED — pace, clarity, a swallowed word, or a single high-yield sound worth polishing. Frame it as being clearly understood, never as an accent to fix or as shaming. If nothing stands out, use "".',
    '',
    'Return ONLY a JSON object with exactly these fields:',
    '{',
    '  "summary": "1–2 warm sentences",',
    '  "wins": ["1–2 specific things they did well"],',
    '  "fixes": [{"said": "roughly what they said", "better": "a stronger, natural way to say it", "why": "short reason in English", "explanationInL1": "same tip in the mother tongue, or omit"}],',
    '  "dimensions": {"clarity": 0-100, "concision": 0-100, "confidence": 0-100, "structure": 0-100, "filler": 0-100},',
    '  "delivery": "one gentle clarity/pronunciation tip, or \\"\\""',
    '}',
    'In "dimensions", higher is always better (filler = 100 means almost no filler words).',
    '',
    'Transcript:',
    renderTranscript(transcript),
  ]
    .filter(Boolean)
    .join('\n');
}

function clamp0to100(v: unknown, fallback = 60): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function strList(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).map((s) => s.trim()).slice(0, max);
}

function parseDimensions(v: unknown): RecapDimensions {
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  return {
    clarity: clamp0to100(o.clarity),
    concision: clamp0to100(o.concision),
    confidence: clamp0to100(o.confidence),
    structure: clamp0to100(o.structure),
    filler: clamp0to100(o.filler),
  };
}

function parseFixes(v: unknown): RecapFix[] {
  if (!Array.isArray(v)) return [];
  const out: RecapFix[] = [];
  for (const item of v) {
    if (!item || typeof item !== 'object') continue;
    const f = item as Record<string, unknown>;
    const said = typeof f.said === 'string' ? f.said.trim() : '';
    const better = typeof f.better === 'string' ? f.better.trim() : '';
    if (!better) continue; // a fix without a better version is useless
    const fix: RecapFix = {
      said,
      better,
      why: typeof f.why === 'string' ? f.why.trim() : '',
    };
    if (typeof f.explanationInL1 === 'string' && f.explanationInL1.trim()) {
      fix.explanationInL1 = f.explanationInL1.trim();
    }
    out.push(fix);
  }
  return out.slice(0, 3);
}

function parseStrongerAnswers(v: unknown): StrongerAnswer[] {
  if (!Array.isArray(v)) return [];
  const out: StrongerAnswer[] = [];
  for (const item of v) {
    if (!item || typeof item !== 'object') continue;
    const s = item as Record<string, unknown>;
    const question = typeof s.question === 'string' ? s.question.trim() : '';
    const answer = typeof s.answer === 'string' ? s.answer.trim() : '';
    if (question && answer) out.push({ question, answer });
  }
  return out.slice(0, 4);
}

/** Defensively coerce the model's JSON into a valid `Recap`. */
export function parseRecap(raw: unknown): Recap {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    summary:
      typeof o.summary === 'string' && o.summary.trim()
        ? o.summary.trim()
        : 'Nice work showing up and speaking — that is how confidence is built.',
    wins: strList(o.wins, 3),
    fixes: parseFixes(o.fixes),
    strongerAnswers: parseStrongerAnswers(o.strongerAnswers),
    dimensions: parseDimensions(o.dimensions),
    delivery: typeof o.delivery === 'string' && o.delivery.trim() ? o.delivery.trim() : undefined,
  };
}
