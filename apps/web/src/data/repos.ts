/**
 * Typed data-access for the per-user tables. RLS ensures a learner only ever
 * touches their own rows. Framework-agnostic — extractable to packages/api-client
 * when React Native lands.
 */

import type { SkillState, ReviewItem, CorrectionRecord } from '@fluentmap/core/science';
import { getSupabase } from './supabaseClient';
import {
  rowToSkillState,
  skillStateToRow,
  rowToReviewItem,
  reviewItemToRow,
  correctionToRow,
} from './mappers';
import type { AssessmentRow, ProfileRow, ReviewItemRow, SkillStateRow } from './rows';

function throwOn(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await getSupabase().from('profiles').select('*').eq('id', userId).maybeSingle();
  throwOn(error);
  return (data as ProfileRow | null) ?? null;
}

export async function upsertProfile(row: Partial<ProfileRow> & { id: string }): Promise<void> {
  const { error } = await getSupabase().from('profiles').upsert(row);
  throwOn(error);
}

export async function loadSkillStates(userId: string): Promise<SkillState[]> {
  const { data, error } = await getSupabase().from('skill_states').select('*').eq('user_id', userId);
  throwOn(error);
  return ((data as unknown as SkillStateRow[] | null) ?? []).map(rowToSkillState);
}

export async function upsertSkillStates(states: SkillState[]): Promise<void> {
  if (states.length === 0) return;
  const { error } = await getSupabase()
    .from('skill_states')
    .upsert(states.map(skillStateToRow), { onConflict: 'user_id,skill_id' });
  throwOn(error);
}

export async function loadDueReviewItems(userId: string): Promise<ReviewItem[]> {
  const { data, error } = await getSupabase()
    .from('review_items')
    .select('*')
    .eq('user_id', userId)
    .eq('suspended', false);
  throwOn(error);
  return ((data as unknown as ReviewItemRow[] | null) ?? []).map(rowToReviewItem);
}

export async function insertReviewItems(items: ReviewItem[]): Promise<void> {
  if (items.length === 0) return;
  const { error } = await getSupabase().from('review_items').insert(items.map(reviewItemToRow));
  throwOn(error);
}

export async function updateReviewItem(item: ReviewItem): Promise<void> {
  const { error } = await getSupabase().from('review_items').upsert(reviewItemToRow(item));
  throwOn(error);
}

export async function deleteReviewItem(id: string): Promise<void> {
  const { error } = await getSupabase().from('review_items').delete().eq('id', id);
  throwOn(error);
}

export async function insertCorrections(corrections: CorrectionRecord[]): Promise<void> {
  if (corrections.length === 0) return;
  const { error } = await getSupabase().from('corrections').insert(corrections.map(correctionToRow));
  throwOn(error);
}

export async function insertAssessment(row: AssessmentRow): Promise<void> {
  const { error } = await getSupabase().from('assessments').insert(row);
  throwOn(error);
}
