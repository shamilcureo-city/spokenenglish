/**
 * App store. Two modes:
 *  - local  (Supabase unconfigured): localStorage + demo skill states.
 *  - cloud  (signed in): hydrate profile + skill_states from Postgres, persist
 *    the assessment and every session's evidence (closes the learning loop).
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Placement, SpeakSubScores } from '@fluentmap/core/domain';
import {
  applyReview,
  newSkillState,
  intervalDaysOf,
  type IngestResult,
  type Rating,
  type ReviewItem,
  type SkillState,
} from '@fluentmap/core/science';
import { type Usage, addUsageMinutes, normalizeUsageForToday, toDateKey } from '@fluentmap/core/domain';
import { buildDemoStates, buildDemoReviews, DEMO_NOW } from './mock/learner';
import * as repos from './data/repos';

export type Stage = 'onboarding' | 'assessment' | 'result' | 'app';

export interface Profile {
  name: string;
  l1: string;
  goal: string;
}

export interface AssessmentResult {
  placement: Placement;
  subScores: SpeakSubScores;
  summary: string;
  strengths: string[];
  focusAreas: string[];
  takenAt: string;
}

interface AppState {
  stage: Stage;
  profile: Profile;
  assessment: AssessmentResult | null;
  trackId: string | null;
  plan: string;
  usage: Usage;
}

const DEFAULT: AppState = {
  stage: 'onboarding',
  profile: { name: '', l1: 'Hindi', goal: 'Daily English' },
  assessment: null,
  trackId: null,
  plan: 'Free',
  usage: { date: '1970-01-01', usedMinutes: 0 },
};

const KEY = 'fluentmap-state-v1';

function loadLocal(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<AppState>) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function mergeStates(prev: SkillState[], updated: SkillState[]): SkillState[] {
  const map = new Map(prev.map((s) => [s.skillId, s]));
  for (const u of updated) map.set(u.skillId, u);
  return [...map.values()];
}

interface Store extends AppState {
  userId: string | null;
  cloud: boolean;
  hydrating: boolean;
  skillStates: SkillState[];
  reviewItems: ReviewItem[];
  streak: number;
  reviewsDone: number;
  plan: string;
  usage: Usage;
  now: Date;
  setProfile(p: Partial<Profile>): void;
  gradeReview(item: ReviewItem, rating: Rating): void;
  setPlan(name: string): void;
  addUsage(minutes: number): void;
  startAssessment(): void;
  saveAssessment(r: AssessmentResult): void;
  enroll(): void;
  applyEvidence(ingest: IngestResult): void;
  reset(): void;
  signOut?: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({
  userId,
  cloud,
  signOut,
  children,
}: {
  userId: string | null;
  cloud: boolean;
  signOut?: () => Promise<void>;
  children: ReactNode;
}) {
  const [state, setState] = useState<AppState>(() => (cloud ? DEFAULT : loadLocal()));
  const [skillStates, setSkillStates] = useState<SkillState[]>(() => (cloud ? [] : buildDemoStates()));
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(() =>
    cloud ? [] : buildDemoReviews(loadLocal().profile.l1),
  );
  const [streak, setStreak] = useState<number>(() => (cloud ? 0 : 6));
  const [reviewsDone, setReviewsDone] = useState(0);
  const [hydrating, setHydrating] = useState(cloud);
  const now = useMemo(() => (cloud ? new Date() : DEMO_NOW), [cloud]);

  // Local persistence.
  useEffect(() => {
    if (cloud) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, cloud]);

  // Cloud hydrate.
  useEffect(() => {
    if (!cloud || !userId) return;
    let active = true;
    void (async () => {
      try {
        const [profileRow, states, reviews] = await Promise.all([
          repos.getProfile(userId),
          repos.loadSkillStates(userId),
          repos.loadDueReviewItems(userId),
        ]);
        if (!active) return;
        setSkillStates(states);
        setReviewItems(reviews);
        setStreak(profileRow?.streak ?? 0);
        setState((s) =>
          profileRow
            ? {
                ...s,
                profile: {
                  name: profileRow.name ?? 'Learner',
                  l1: profileRow.l1,
                  goal: profileRow.goal ?? 'Daily English',
                },
                stage: 'app',
              }
            : { ...s, stage: 'onboarding' },
        );
      } catch (e) {
        console.error('Hydrate failed', e);
      } finally {
        if (active) setHydrating(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [cloud, userId]);

  const todayKey = toDateKey(now);
  const normalizedUsage = normalizeUsageForToday(state.usage, todayKey);

  const store: Store = {
    ...state,
    userId,
    cloud,
    hydrating,
    skillStates,
    reviewItems,
    streak,
    reviewsDone,
    usage: normalizedUsage,
    now,
    setProfile: (p) => setState((s) => ({ ...s, profile: { ...s.profile, ...p } })),
    setPlan: (name) => setState((s) => ({ ...s, plan: name })),
    addUsage: (minutes) =>
      setState((s) => ({ ...s, usage: addUsageMinutes(s.usage, minutes, todayKey) })),
    startAssessment: () => setState((s) => ({ ...s, stage: 'assessment' })),
    saveAssessment: (r) => {
      setState((s) => ({ ...s, assessment: r, stage: 'result' }));
      if (cloud && userId) {
        void repos
          .upsertProfile({
            id: userId,
            name: state.profile.name,
            l1: state.profile.l1,
            goal: state.profile.goal,
            target_cefr: r.placement.band,
          })
          .catch(console.error);
        void repos
          .insertAssessment({
            user_id: userId,
            speak_score: r.placement.speakScore,
            band: r.placement.band,
            sub_scores: r.subScores,
            placement: r.placement,
            summary: r.summary,
            strengths: r.strengths,
            focus_areas: r.focusAreas,
            taken_at: r.takenAt,
          })
          .catch(console.error);
      }
    },
    enroll: () =>
      setState((s) => ({ ...s, trackId: s.assessment?.placement.track ?? 'basic', stage: 'app' })),
    applyEvidence: (ingest) => {
      setSkillStates((prev) => mergeStates(prev, ingest.updatedStates));
      setReviewItems((prev) => [...prev, ...ingest.newReviewItems]);
      if (cloud) {
        void repos.upsertSkillStates(ingest.updatedStates).catch(console.error);
        void repos.insertReviewItems(ingest.newReviewItems).catch(console.error);
        void repos.insertCorrections(ingest.corrections).catch(console.error);
      }
    },
    gradeReview: (item, rating) => {
      setReviewsDone((n) => n + 1);
      const prior =
        skillStates.find((s) => s.skillId === item.skillId) ??
        newSkillState(userId ?? 'demo', item.skillId, now);
      const updated = applyReview(prior, rating, now);
      setSkillStates((prev) => mergeStates(prev, [updated]));

      if (rating >= 3) {
        // graduated this specific correction
        setReviewItems((prev) => prev.filter((r) => r.id !== item.id));
        if (cloud) void repos.deleteReviewItem(item.id).catch(console.error);
      } else {
        const next: ReviewItem = {
          ...item,
          reps: item.reps + 1,
          lapses: item.lapses + (rating === 1 ? 1 : 0),
          dueAt: updated.dueAt ?? item.dueAt,
          intervalDays: intervalDaysOf(updated.stability),
        };
        setReviewItems((prev) => prev.map((r) => (r.id === item.id ? next : r)));
        if (cloud) void repos.updateReviewItem(next).catch(console.error);
      }
      if (cloud) void repos.upsertSkillStates([updated]).catch(console.error);
    },
    reset: () => {
      setState(DEFAULT);
      if (!cloud) {
        try {
          localStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
      }
      void signOut?.();
    },
    signOut,
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>');
  return ctx;
}
