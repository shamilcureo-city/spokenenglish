/**
 * Speakwell store — local-only (no Supabase). Profile, placement, lessons done +
 * their best stars, XP, recap history, the days you practised (for the HUMANE
 * streak), and a weekly goal. Persisted to localStorage.
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  humaneStreak,
  recordEvidence,
  pruneMastery,
  WARMUP_XP,
  type ConversationMode,
  type Evidence,
  type GoalId,
  type LessonScore,
  type MasteryState,
  type Placement,
  type Recap,
} from '@fluentmap/core/conversation';

export interface Profile {
  name: string;
  /** Mother tongue, for the recap explanations. */
  l1: string;
  /** Personalization: the learner's main goal (flavours the practice). */
  goal?: GoalId;
  /** Personalization: a few interests the partner can bring up. */
  interests?: string[];
}

export interface SavedRecap {
  id: string;
  at: string;
  mode: ConversationMode;
  title: string;
  recap: Recap;
}

interface Persisted {
  profile: Profile;
  onboarded: boolean;
  placement: Placement | null;
  completedLessonIds: string[];
  /** Best stars earned per lesson id. */
  lessonStars: Record<string, number>;
  /** Times each lesson has been finished — rotates the scenario variant on redo. */
  lessonAttempts: Record<string, number>;
  xp: number;
  recaps: SavedRecap[];
  /** yyyy-mm-dd local dates the user practised. */
  days: string[];
  weeklyGoal: number;
  /** Implementation-intention: the daily practice time the user picked (HH:MM), if any. */
  reminderTime: string | null;
  /** COGS metering: live realtime voice seconds used today (reset daily). */
  liveSecondsToday: number;
  liveDate: string;
  /** Concept-mastery memory (Phase 2): recurring words/phrases scored from spoken usage. */
  mastery: MasteryState;
  /** Schema version, for forward-compatible migrations. */
  version: number;
}

const VERSION = 1;

const DEFAULT: Persisted = {
  profile: { name: '', l1: 'Hindi' },
  onboarded: false,
  placement: null,
  completedLessonIds: [],
  lessonStars: {},
  lessonAttempts: {},
  xp: 0,
  recaps: [],
  days: [],
  weeklyGoal: 5,
  reminderTime: null,
  liveSecondsToday: 0,
  liveDate: '1970-01-01',
  mastery: {},
  version: VERSION,
};

const KEY = 'speakwell-state-v1';

/* ── date helpers (local) ── */
export function dateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function shiftKey(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return dateKey(d);
}
export function countLast7(days: string[]): number {
  const recent = new Set<string>();
  for (let i = 0; i < 7; i++) recent.add(shiftKey(i));
  return days.filter((d) => recent.has(d)).length;
}

function uid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  }
}

/** Forward-compatible migration: backfill missing keys + defend against corrupt shapes.
 *  Branch on `raw.version` here when the schema changes in a breaking way. */
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function migrate(raw: Partial<Persisted>): Persisted {
  const merged: Persisted = { ...DEFAULT, ...raw, version: VERSION };
  // Profile must be an object — a null/string/array would crash every screen.
  merged.profile = isObj(merged.profile) ? { ...DEFAULT.profile, ...merged.profile } : { ...DEFAULT.profile };
  // Mastery: drop any non-MasteryItem values (a null entry crashes the readers).
  const cleanMastery: MasteryState = {};
  if (isObj(merged.mastery)) {
    for (const [k, v] of Object.entries(merged.mastery)) {
      if (isObj(v) && typeof v.mastery === 'number' && typeof v.id === 'string') {
        cleanMastery[k] = v as unknown as MasteryState[string];
      }
    }
  }
  merged.mastery = cleanMastery;
  if (!Array.isArray(merged.days)) merged.days = [];
  if (!Array.isArray(merged.completedLessonIds)) merged.completedLessonIds = [];
  if (!Array.isArray(merged.recaps)) merged.recaps = [];
  if (!isObj(merged.lessonStars)) merged.lessonStars = {};
  if (!isObj(merged.lessonAttempts)) merged.lessonAttempts = {};
  if (typeof merged.xp !== 'number' || !Number.isFinite(merged.xp)) merged.xp = 0;
  if (typeof merged.weeklyGoal !== 'number') merged.weeklyGoal = DEFAULT.weeklyGoal;
  if (merged.placement !== null && !isObj(merged.placement)) merged.placement = null;
  return merged;
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? migrate(JSON.parse(raw) as Partial<Persisted>) : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

interface Store extends Persisted {
  streak: number;
  weekProgress: number;
  setProfile(p: Partial<Profile>): void;
  completeOnboarding(p: Profile & { reminderTime?: string | null }): void;
  setPlacement(p: Placement | null): void;
  /** Finish a lesson: mark complete, record best stars, add XP, count today. */
  finishLesson(lessonId: string, score: LessonScore): void;
  /** A daily free-talk: small XP + counts today. */
  recordWarmup(): void;
  addRecap(entry: { mode: ConversationMode; title: string; recap: Recap }): void;
  markPracticed(): void;
  setWeeklyGoal(n: number): void;
  setReminderTime(t: string | null): void;
  /** Live voice seconds used today (reset-aware). */
  liveSecondsUsedToday: number;
  recordLiveSeconds(seconds: number): void;
  /** Fold spoken-attempt evidence into concept-mastery memory (Phase 2). */
  recordMastery(evidence: Evidence[]): void;
  /** True when the browser refused to persist (quota/private mode) — surfaced in Settings. */
  storageWarning: boolean;
  /** Download-able JSON snapshot of all progress (manual backup, pre-accounts). */
  exportData(): string;
  /** Restore from an exported snapshot; returns false if the JSON is invalid. */
  importData(json: string): boolean;
  reset(): void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load);
  const [storageWarning, setStorageWarning] = useState(false);
  const trimmedOnce = useRef(false);

  // Ask the browser to keep our storage (so iOS/Safari don't evict the streak).
  useEffect(() => {
    void navigator.storage?.persist?.().catch(() => {});
  }, []);

  // Persist — and survive a full quota: trim once, retry, and surface a warning
  // instead of silently dropping every future write (XP, streak, lessons…).
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      if (storageWarning) setStorageWarning(false);
      trimmedOnce.current = false;
    } catch {
      setStorageWarning(true);
      const tooBig =
        Object.keys(state.mastery).length > 150 || state.recaps.length > 20 || state.days.length > 120;
      if (tooBig && !trimmedOnce.current) {
        trimmedOnce.current = true;
        setState((s) => ({
          ...s,
          mastery: pruneMastery(s.mastery, 150),
          recaps: s.recaps.slice(0, 20),
          days: s.days.slice(-120),
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const streak = useMemo(() => humaneStreak(state.days, shiftKey), [state.days]);
  const weekProgress = useMemo(() => countLast7(state.days), [state.days]);

  const withToday = (s: Persisted): string[] => {
    const today = dateKey();
    return (s.days.includes(today) ? s.days : [...s.days, today]).slice(-180); // ~6 months of history
  };

  const liveSecondsUsedToday = state.liveDate === dateKey() ? state.liveSecondsToday : 0;

  const store: Store = {
    ...state,
    streak,
    weekProgress,
    liveSecondsUsedToday,
    setProfile: (p) => setState((s) => ({ ...s, profile: { ...s.profile, ...p } })),
    completeOnboarding: ({ reminderTime, ...p }) =>
      setState((s) => ({ ...s, profile: p, onboarded: true, reminderTime: reminderTime ?? s.reminderTime })),
    setPlacement: (p) => setState((s) => ({ ...s, placement: p })),
    finishLesson: (lessonId, score) =>
      setState((s) => ({
        ...s,
        completedLessonIds: s.completedLessonIds.includes(lessonId)
          ? s.completedLessonIds
          : [...s.completedLessonIds, lessonId],
        lessonStars: { ...s.lessonStars, [lessonId]: Math.max(s.lessonStars[lessonId] ?? 0, score.stars) },
        lessonAttempts: { ...s.lessonAttempts, [lessonId]: (s.lessonAttempts[lessonId] ?? 0) + 1 },
        xp: s.xp + score.xp,
        days: withToday(s),
      })),
    recordWarmup: () => setState((s) => ({ ...s, xp: s.xp + WARMUP_XP, days: withToday(s) })),
    addRecap: (entry) =>
      setState((s) => ({
        ...s,
        recaps: [{ id: uid(), at: new Date().toISOString(), ...entry }, ...s.recaps].slice(0, 100),
      })),
    markPracticed: () => setState((s) => ({ ...s, days: withToday(s) })),
    setWeeklyGoal: (n) => setState((s) => ({ ...s, weeklyGoal: Math.max(1, Math.min(7, Math.round(n))) })),
    setReminderTime: (t) => setState((s) => ({ ...s, reminderTime: t })),
    recordLiveSeconds: (seconds) =>
      setState((s) => {
        const today = dateKey();
        const base = s.liveDate === today ? s.liveSecondsToday : 0;
        return { ...s, liveDate: today, liveSecondsToday: base + Math.max(0, Math.round(seconds)) };
      }),
    recordMastery: (evidence) =>
      setState((s) => ({ ...s, mastery: pruneMastery(recordEvidence(s.mastery, evidence)) })),
    storageWarning,
    exportData: () => JSON.stringify(state, null, 2),
    importData: (json) => {
      try {
        const parsed = JSON.parse(json) as Partial<Persisted>;
        if (!parsed || typeof parsed !== 'object') return false;
        setState(migrate(parsed));
        return true;
      } catch {
        return false;
      }
    },
    reset: () => {
      setState(DEFAULT);
      try {
        localStorage.removeItem(KEY);
      } catch {
        /* ignore */
      }
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>');
  return ctx;
}
