import { useState } from 'react';
import { useStore } from '../store';

const GOALS = ['Daily English', 'Interview English', 'Workplace English'];
const LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];

export function Onboarding() {
  const { profile, setProfile, startAssessment } = useStore();
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState(profile.goal);
  const [l1, setL1] = useState(profile.l1);

  function begin() {
    setProfile({ name: name.trim() || 'Learner', goal, l1 });
    startAssessment();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-7 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-amber-300 text-base font-black text-black">
          F
        </span>
        <span className="text-xl font-semibold tracking-tight">FluentMap</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight">Let's find your level</h1>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        A few quick things, then a <span className="text-white/80">5-minute voice assessment</span>.
        We'll measure your spoken English and build your personal skill map.
      </p>

      <label className="mt-7 block text-xs font-semibold uppercase tracking-wider text-white/40">
        Your name
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-emerald-400/50"
      />

      <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-white/40">
        Your goal
      </label>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {GOALS.map((g) => (
          <button
            key={g}
            onClick={() => setGoal(g)}
            className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
              goal === g
                ? 'border-emerald-400/50 bg-emerald-400/10 text-white'
                : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-white/40">
        Mother tongue
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => setL1(lang)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              l1 === lang
                ? 'border-emerald-400/50 bg-emerald-400/10 text-white'
                : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <button
        onClick={begin}
        className="mt-8 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-amber-300 px-6 py-3.5 text-sm font-bold text-black hover:opacity-90"
      >
        Start my 5-minute assessment →
      </button>
      <p className="mt-3 text-center text-[11px] text-white/30">
        🎤 You'll need a microphone. Find a quiet spot.
      </p>
    </div>
  );
}
