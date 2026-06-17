/**
 * Traffic-light "intelligibility" scoring (redesign Phase 1).
 *
 * We don't have an acoustic phoneme model, so we score the honest, useful thing:
 * **was each word actually caught?** The learner says a target phrase; a recognizer
 * transcribes what it heard; we align heard→target and colour each target word
 *   good   (green)  — caught clearly
 *   close  (yellow) — caught, but slightly off (near-match: likely mispronounced)
 *   missing(red)    — not caught (a listener would miss it)
 *
 * India-calibrated: lenient (the win-state is "clearly understood", not
 * "American-native"), order-aware but forgiving of small word-order slips.
 */

export type WordStatus = 'good' | 'close' | 'missing';

export interface WordScore {
  /** The target word, as written. */
  word: string;
  status: WordStatus;
  /** For a 'close' match, what the recognizer actually heard (for the fix panel). */
  heardAs?: string;
}

export interface UtteranceScore {
  words: WordScore[];
  /** 0–100 — share of the phrase a listener would understand. */
  intelligible: number;
  /** 1–3 stars, India-calibrated thresholds. */
  stars: number;
}

/** Lowercase, strip surrounding punctuation, keep inner apostrophes/hyphens. */
export function normalizeWord(w: string): string {
  return w
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\-]/gu, '')
    .replace(/^['-]+|['-]+$/g, '');
}

export function tokenize(s: string): string[] {
  return s
    .split(/\s+/)
    .map(normalizeWord)
    .filter((w) => w.length > 0);
}

/**
 * Did the recognizer catch enough of the target to trust this as a real attempt?
 * A garbled / clipped / mostly-silent capture yields a transcript with far fewer
 * tokens than the target — scoring that would record false "weakness", so we skip
 * it. (~40% of the target's words must have been heard.)
 */
export function attemptReliable(target: string, heard: string): boolean {
  const t = tokenize(target).length;
  if (t === 0) return false;
  return tokenize(heard).length >= Math.max(1, Math.ceil(t * 0.4));
}

/** Classic Levenshtein edit distance (small strings). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost);
    }
    prev = cur;
  }
  return prev[b.length]!;
}

/** A near-match if the edit distance is small relative to word length. */
function isClose(a: string, b: string): boolean {
  if (a === b) return false; // that's an exact match, not "close"
  const d = levenshtein(a, b);
  const len = Math.max(a.length, b.length);
  if (len <= 3) return d === 1;
  if (len <= 6) return d <= 2;
  return d <= 3;
}

/**
 * Score one spoken attempt against the target phrase. Greedy left-to-right
 * alignment: each target word consumes the nearest matching heard word at or
 * after the last match, so repeats and small slips are handled gracefully.
 */
export function scoreUtterance(target: string, heard: string): UtteranceScore {
  const tWords = tokenize(target);
  const hWords = tokenize(heard);
  const used = new Array(hWords.length).fill(false);
  const words: WordScore[] = [];

  let cursor = 0; // earliest unconsumed heard index (keeps rough order)
  for (const t of tWords) {
    // 1) exact match at/after the cursor
    let idx = -1;
    for (let j = cursor; j < hWords.length; j++) {
      if (!used[j] && hWords[j] === t) {
        idx = j;
        break;
      }
    }
    // 2) exact match anywhere (out-of-order slip)
    if (idx === -1) {
      for (let j = 0; j < hWords.length; j++) {
        if (!used[j] && hWords[j] === t) {
          idx = j;
          break;
        }
      }
    }
    if (idx !== -1) {
      used[idx] = true;
      cursor = Math.max(cursor, idx + 1);
      words.push({ word: t, status: 'good' });
      continue;
    }
    // 3) near-match (likely mispronounced) — prefer at/after cursor
    let closeIdx = -1;
    for (let j = 0; j < hWords.length; j++) {
      if (!used[j] && isClose(t, hWords[j]!)) {
        closeIdx = j;
        if (j >= cursor) break;
      }
    }
    if (closeIdx !== -1) {
      used[closeIdx] = true;
      cursor = Math.max(cursor, closeIdx + 1);
      words.push({ word: t, status: 'close', heardAs: hWords[closeIdx] });
      continue;
    }
    words.push({ word: t, status: 'missing' });
  }

  const total = words.length || 1;
  const credit = words.reduce((s, w) => s + (w.status === 'good' ? 1 : w.status === 'close' ? 0.6 : 0), 0);
  const intelligible = Math.round((credit / total) * 100);
  // Lenient, encouraging thresholds.
  const stars = intelligible >= 85 ? 3 : intelligible >= 60 ? 2 : 1;
  return { words, intelligible, stars };
}
