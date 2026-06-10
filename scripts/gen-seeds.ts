/**
 * Generates Supabase seed SQL from the canonical data in `packages/core`.
 *
 * The taxonomy, transfer-rule KB, and language profiles live as type-checked,
 * unit-tested TypeScript in `core` (single source of truth). This script emits
 * idempotent upserts so `supabase db reset` / `db seed` stays in sync.
 *
 * Run:  npx tsx scripts/gen-seeds.ts
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SKILLS } from '../packages/core/src/science/skills.js';
import { L1_TRANSFER_RULES } from '../packages/core/src/science/l1-rules.js';
import { LANGUAGES } from '../packages/core/src/data/languages.js';
import { LESSONS } from '../packages/core/src/domain/lessons.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seedsDir = join(root, 'supabase', 'seeds');
mkdirSync(seedsDir, { recursive: true });

/* ── SQL literal helpers ── */
const q = (v: unknown): string =>
  v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;
const qarr = (xs: string[]): string =>
  xs.length === 0 ? `ARRAY[]::text[]` : `ARRAY[${xs.map(q).join(',')}]::text[]`;
const jsonb = (obj: unknown): string => `${q(JSON.stringify(obj))}::jsonb`;

const header = (title: string): string =>
  `-- ${title}\n-- AUTO-GENERATED from packages/core by scripts/gen-seeds.ts — do not edit by hand.\n`;

/* ── skills ── */
const skillsRows = SKILLS.map(
  (s) =>
    `  (${q(s.id)}, ${q(s.family)}, ${q(s.label)}, ${q(s.cefr)}, ${q(s.cluster)}, ${s.difficulty}, ${qarr(
      s.prerequisites,
    )}, ${q(s.exemplar)}, ${jsonb(s.detectors)})`,
).join(',\n');
const skillsSql = `${header('skills')}insert into skills (id, family, label, cefr, cluster, difficulty, prerequisites, exemplar, detectors) values
${skillsRows}
on conflict (id) do update set
  family = excluded.family, label = excluded.label, cefr = excluded.cefr, cluster = excluded.cluster,
  difficulty = excluded.difficulty, prerequisites = excluded.prerequisites, exemplar = excluded.exemplar,
  detectors = excluded.detectors;
`;

/* ── l1_transfer_rules ── */
const rulesRows = L1_TRANSFER_RULES.map(
  (r) =>
    `  (${q(r.id)}, ${q(r.l1)}, ${q(r.category)}, ${q(r.skillId)}, ${q(r.title)}, ${q(
      r.cause,
    )}, ${jsonb(r.triggers)}, ${jsonb(r.explanations)}, ${jsonb(r.contrast)}, ${qarr(r.exampleErrors)})`,
).join(',\n');
const rulesSql = `${header('l1_transfer_rules')}insert into l1_transfer_rules (id, l1, category, skill_id, title, cause, triggers, explanations, contrast, example_errors) values
${rulesRows}
on conflict (id) do update set
  l1 = excluded.l1, category = excluded.category, skill_id = excluded.skill_id, title = excluded.title,
  cause = excluded.cause, triggers = excluded.triggers, explanations = excluded.explanations,
  contrast = excluded.contrast, example_errors = excluded.example_errors;
`;

/* ── languages ── */
const langRows = LANGUAGES.map(
  (l) =>
    `  (${q(l.code)}, ${q(l.nativeName)}, ${q(l.greeting)}, ${q(l.encouragement)}, ${q(l.correctionLabel)})`,
).join(',\n');
const langSql = `${header('languages')}insert into languages (code, native_name, greeting, encouragement, correction_label) values
${langRows}
on conflict (code) do update set
  native_name = excluded.native_name, greeting = excluded.greeting,
  encouragement = excluded.encouragement, correction_label = excluded.correction_label;
`;

/* ── lessons + lesson_target_skills ── */
const PASS: Record<string, number> = { basic: 55, intermediate: 65, advanced: 75 };
const trackCounter: Record<string, number> = {};
const lessonsRows = LESSONS.map((l) => {
  trackCounter[l.track] = (trackCounter[l.track] ?? 0) + 1;
  const idx = trackCounter[l.track];
  return `  (${q(l.id)}, ${q(l.track)}, 0, ${idx}, ${q(l.title)}, ${q(l.scenario)}, ${q(l.cefr)}, ARRAY[]::text[], ${PASS[l.track] ?? 60}, 12, NULL)`;
}).join(',\n');
const lessonsSql = `${header('lessons')}insert into lessons (id, track_id, module_index, lesson_index, title, scenario, cefr, structures, pass_score, target_minutes, system_prompt_template) values
${lessonsRows}
on conflict (id) do update set
  track_id = excluded.track_id, module_index = excluded.module_index, lesson_index = excluded.lesson_index,
  title = excluded.title, scenario = excluded.scenario, cefr = excluded.cefr, structures = excluded.structures,
  pass_score = excluded.pass_score, target_minutes = excluded.target_minutes,
  system_prompt_template = excluded.system_prompt_template;
`;

const ltsRows = LESSONS.flatMap((l) =>
  l.targetSkillIds.map((sid) => `  (${q(l.id)}, ${q(sid)}, 1)`),
).join(',\n');
const ltsSql = `${header('lesson_target_skills')}insert into lesson_target_skills (lesson_id, skill_id, weight) values
${ltsRows}
on conflict (lesson_id, skill_id) do update set weight = excluded.weight;
`;

writeFileSync(join(seedsDir, 'skills.sql'), skillsSql);
writeFileSync(join(seedsDir, 'l1_transfer_rules.sql'), rulesSql);
writeFileSync(join(seedsDir, 'languages.sql'), langSql);
writeFileSync(join(seedsDir, 'lessons.sql'), lessonsSql);
writeFileSync(join(seedsDir, 'lesson_target_skills.sql'), ltsSql);

// Combined seed Supabase runs on `db reset` (order: languages → skills → rules,
// because l1_transfer_rules.skill_id references skills).
const combined = `-- FluentMap seed (AUTO-GENERATED by scripts/gen-seeds.ts — do not edit).
-- Regenerate with:  npx tsx scripts/gen-seeds.ts

${langSql}
${skillsSql}
${lessonsSql}
${ltsSql}
${rulesSql}`;
writeFileSync(join(root, 'supabase', 'seed.sql'), combined);

console.log(
  `Generated seeds: ${LANGUAGES.length} languages, ${SKILLS.length} skills, ${LESSONS.length} lessons, ${L1_TRANSFER_RULES.length} transfer rules.`,
);
