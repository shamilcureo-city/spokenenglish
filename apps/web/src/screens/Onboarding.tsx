import { useState } from 'react';
import { COACH_NAME } from '@fluentmap/core/conversation';
import { useStore } from '../store';
import { LANGUAGES } from '../lib/constants';
import { track } from '../lib/analytics';
import { Logo, Page } from './ui';

const WHEN = [
  { label: 'Morning', time: '08:00' },
  { label: 'Afternoon', time: '13:00' },
  { label: 'Evening', time: '19:00' },
  { label: 'Night', time: '21:00' },
];

/** ≤30s: name → mother tongue → when you'll practise (a habit cue). Placement is offered next. */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const { completeOnboarding } = useStore();
  const [name, setName] = useState('');
  const [l1, setL1] = useState<string>('Hindi');
  const [when, setWhen] = useState<string | null>(null);

  function go() {
    completeOnboarding({ name: name.trim() || 'there', l1, reminderTime: when });
    track('onboarded', { l1, hasReminder: !!when });
    onDone();
  }

  return (
    <Page>
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>

      <h1 className="text-2xl font-bold leading-tight">Speak English with confidence.</h1>
      <p className="mt-2 text-sm text-white/55">
        A spoken-English course you finish by <span className="text-white/80">talking</span> — short lessons
        with <span className="text-emerald-200">{COACH_NAME}</span>, your friendly speaking partner, and
        feedback in your own language. Five minutes a day.
      </p>

      <div className="mt-7 space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/45">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ravi"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-emerald-400/50"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/45">
            Mother tongue <span className="font-normal lowercase text-white/35">— for explaining things</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setL1(lang)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  l1 === lang
                    ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-100'
                    : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/45">
            When will you practise? <span className="font-normal lowercase text-white/35">— we'll nudge you (optional)</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {WHEN.map((w) => (
              <button
                key={w.time}
                onClick={() => setWhen((cur) => (cur === w.time ? null : w.time))}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  when === w.time
                    ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-100'
                    : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </label>
      </div>

      <button
        onClick={go}
        className="mt-7 w-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 py-3.5 text-sm font-bold text-black transition hover:opacity-90"
      >
        Let's go →
      </button>
      <p className="mt-3 text-center text-[11px] text-white/30">Runs on your device. Nothing is shared.</p>
    </Page>
  );
}
