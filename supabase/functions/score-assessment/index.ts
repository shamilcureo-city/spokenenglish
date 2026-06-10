// POST /score-assessment — scores the standardized 5-minute assessment.
// Body: { transcript: {speaker,text}[], supportLanguage?: string }
// Uses the verbatim CEFR examiner prompt at temperature 0.2 (repeatable scoring).

import { handlePreflight, json } from '../_shared/cors.ts';
import { callGeminiJson } from '../_shared/gemini.ts';
import {
  buildAssessmentPrompt,
  validateAssessmentScore,
  ASSESSMENT_TEMPERATURE,
} from '@fluentmap/core/scoring';

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  let body: { transcript?: unknown; supportLanguage?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const { transcript, supportLanguage } = body;
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return json({ error: 'A valid transcript array is required.' }, 400);
  }

  try {
    const prompt = buildAssessmentPrompt({
      transcript: transcript as { speaker: 'ai' | 'learner'; text: string }[],
      supportLanguage: typeof supportLanguage === 'string' ? supportLanguage : undefined,
    });
    const raw = await callGeminiJson(prompt, { temperature: ASSESSMENT_TEMPERATURE });
    return json(validateAssessmentScore(raw));
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
