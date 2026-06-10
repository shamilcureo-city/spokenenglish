/**
 * Pure helpers for the Gemini REST `generateContent` API — preserved verbatim
 * from the original Express server (`gemini-2.5-flash`, JSON response mime type,
 * temperature 0.2 for the standardized assessment). No network here; the edge
 * functions do the fetch and hand the response object to `extractText`.
 */

/** REST model used for scoring (NOT the Live model). */
export const GEMINI_REST_MODEL = 'gemini-2.5-flash';

/** Low temperature → repeatable, standardized assessment scoring. */
export const ASSESSMENT_TEMPERATURE = 0.2;

export interface GenerateContentBody {
  contents: { parts: { text: string }[] }[];
  generationConfig: {
    responseMimeType: 'application/json';
    temperature?: number;
  };
}

/** Build a `generateContent` request body that forces a JSON response. */
export function buildGenerateContentBody(
  prompt: string,
  opts: { temperature?: number } = {},
): GenerateContentBody {
  return {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
    },
  };
}

/** The REST endpoint (key passed as query param, exactly as the original server). */
export function geminiRestUrl(apiKey: string, model: string = GEMINI_REST_MODEL): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

/** Pull the concatenated text out of a Gemini REST response object. */
export function extractText(response: unknown): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = response as any;
  const parts = r?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map((p: { text?: string }) => p?.text ?? '').join('');
}

/** Parse a JSON object from model text, tolerating ```json fences. */
export function parseJsonResponse<T = unknown>(text: string): T {
  let s = text.trim();
  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence && fence[1]) s = fence[1].trim();
  return JSON.parse(s) as T;
}
