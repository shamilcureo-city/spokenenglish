// POST /score-session — scores a lesson conversation and returns a learner
// summary + the structured skill/L1 evidence the engine ingests.
//
// Body: { sessionId, userId, l1, lessonTitle?, transcript: {speaker,text}[] }
// Returns: { summary, overallScore, scored: ScoredSession }
//
// Flow: pull the skill list from the DB → cheap L1-trigger pre-filter (core) →
// Gemini picks the best skill/cause ids → assemble + validate (drops any
// hallucinated ids). The client then runs `ingestSessionEvidence` (pure) to
// fold this into skill_states + the review queue.

import { handlePreflight, json } from '../_shared/cors.ts';
import { callGeminiJson } from '../_shared/gemini.ts';
import { candidateRules, type L1 } from '@fluentmap/core/science';
import { buildSessionScoringPrompt, assembleScoredSession } from '@fluentmap/core/scoring';
import { serviceClient } from '../_shared/supabase.ts';

interface Turn {
  speaker: 'ai' | 'learner';
  text: string;
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  let body: {
    sessionId?: unknown;
    userId?: unknown;
    l1?: unknown;
    lessonTitle?: unknown;
    transcript?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const { sessionId, userId, l1, lessonTitle, transcript } = body;
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return json({ error: 'A valid transcript array is required.' }, 400);
  }
  if (typeof sessionId !== 'string' || typeof userId !== 'string' || typeof l1 !== 'string') {
    return json({ error: 'sessionId, userId and l1 are required.' }, 400);
  }

  try {
    const supabase = serviceClient();
    const { data: skills } = await supabase.from('skills').select('id,label');

    const turns = transcript as Turn[];
    const learnerText = turns
      .filter((t) => t.speaker === 'learner')
      .map((t) => t.text)
      .join('\n');
    const cands = candidateRules(learnerText, l1 as L1).map((r) => ({ id: r.id, title: r.title }));

    const prompt = buildSessionScoringPrompt({
      transcript: turns,
      l1,
      skills: (skills as { id: string; label: string }[] | null) ?? [],
      candidateRules: cands,
      ...(typeof lessonTitle === 'string' ? { lessonTitle } : {}),
    });

    const raw = await callGeminiJson(prompt);
    const assembled = assembleScoredSession(raw as Record<string, unknown>, {
      sessionId,
      userId,
      l1: l1 as L1,
    });
    return json(assembled);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
