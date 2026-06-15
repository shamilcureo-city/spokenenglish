/**
 * Placement — a short spoken check that maps a learner to a starting level + unit.
 * `buildPlacementPrompt` scores a brief transcript; `parsePlacement` coerces the
 * JSON and resolves the starting unit (the first unit of the chosen level).
 */

import { unitsByLevel, type LevelId } from './curriculum.js';
import type { Turn } from './types.js';

const LEVELS: readonly LevelId[] = ['foundation', 'intermediate', 'advanced'] as const;

export interface Placement {
  levelId: LevelId;
  unitId: string;
  summary: string;
}

function firstUnitOf(levelId: LevelId): string {
  return unitsByLevel(levelId)[0]?.id ?? 'f1';
}

export function buildPlacementPrompt(input: { transcript: Turn[]; supportLanguage: string }): string {
  const learner = input.transcript
    .filter((t) => t.speaker === 'learner')
    .map((t) => t.text)
    .join('\n');
  return [
    'You are placing a learner into a spoken-English COMMUNICATION course with three levels:',
    '- foundation: can manage only basic phrases; hesitant; frequent errors; struggles to keep a conversation going.',
    '- intermediate: can hold everyday and simple work conversations; understandable with some errors; reasonable range.',
    '- advanced: fluent and natural; handles complex, professional, or abstract talk with ease.',
    '',
    'Judge ONLY their spoken English from what they said below. Be fair and encouraging — when in doubt, place lower so they build confidence.',
    'Return ONLY JSON: { "level": "foundation" | "intermediate" | "advanced", "summary": "one warm sentence about where they are and what to focus on" }',
    '',
    'What the learner said:',
    learner || '(they barely spoke)',
  ].join('\n');
}

export function parsePlacement(raw: unknown): Placement {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const levelId: LevelId =
    typeof o.level === 'string' && (LEVELS as readonly string[]).includes(o.level)
      ? (o.level as LevelId)
      : 'foundation';
  return {
    levelId,
    unitId: firstUnitOf(levelId),
    summary:
      typeof o.summary === 'string' && o.summary.trim()
        ? o.summary.trim()
        : "Let's start here and build your confidence step by step.",
  };
}
