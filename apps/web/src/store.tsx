/**
 * Speakwell store — local-only (no Supabase). Profile, placement, lessons done +
 * their best stars, XP, recap history, the days you practised (for the HUMANE
 * streak), and a weekly goal. Persisted to localStorage.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  humaneStreak,
  WARMUP_XP,
  type ConversationMode,
  type LessonScore,
  type Placement,
  type Recap,
} from '@fluentmap/core/conversation';

export interface Profile {
  name: string;
  /** Mother tongue, for the recap explanations. */
  l1: string;
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
}

const DEFAULT: Persisted = {
  profile: { name: '', l1: 'Hindi' },
  onboarded: false,
  placement: null,
  completedLessonIds: [],
  lessonStars: {},
  xp: 0,
  recaps: [],
  days: [],
  weeklyGoal: 5,
  reminderTime: null,
  liveSecondsToday: 0,
  liveDate: '1970-01-01',
};

const KEY = 'speakwell-state-v1';

/* ── date helpers (local) ── */
export function dateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function shiftKey(daysAgo: number): string {
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

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Persisted>) } : DEFAULT;
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
  reset(): void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const streak = useMemo(() => humaneStreak(state.days, shiftKey), [state.days]);
  const weekProgress = useMemo(() => countLast7(state.days), [state.days]);

  const withToday = (s: Persisted): string[] => {
    const today = dateKey();
    return s.days.includes(today) ? s.days : [...s.days, today];
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
