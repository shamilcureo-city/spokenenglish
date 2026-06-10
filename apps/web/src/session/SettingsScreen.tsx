import { useState, type ReactNode } from 'react';
import { reminderOptions, getReminderMessage } from '@fluentmap/core/domain';
import { useStore } from '../store';

const GOALS = ['Daily English', 'Interview English', 'Workplace English'];
const LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];

export function SettingsScreen({
  onBack,
  onShowPricing,
}: {
  onBack: () => void;
  onShowPricing?: () => void;
}) {
  const { profile, setProfile, plan, reminder, setReminder, cloud, reset, startAssessment } = useStore();
  const [name, setName] = useState(profile.name);

  return (
    <div className="mx-auto max-w-xl px-5 py-8">
      <header className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/50 hover:text-white/80">
          ← Map
        </button>
        <div className="text-sm font-semibold">Settings</div>
        <div className="w-12" />
      </header>

      <Section title="Profile">
        <label className="block text-[11px] uppercase tracking-wider text-white/40">Name</label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setProfile({ name: e.target.value });
          }}
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-emerald-400/50"
        />

        <label className="mt-4 block text-[11px] uppercase tracking-wider text-white/40">Goal</label>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {GOALS.map((g) => (
            <button
              key={g}
              onClick={() => setProfile({ goal: g })}
              className={`rounded-xl border px-2 py-2 text-xs ${
                profile.goal === g
                  ? 'border-emerald-400/50 bg-emerald-400/10 text-white'
                  : 'border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-[11px] uppercase tracking-wider text-white/40">Mother tongue</label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              onClick={() => setProfile({ l1: l })}
              className={`rounded-full border px-3.5 py-1.5 text-sm ${
                profile.l1 === l
                  ? 'border-emerald-400/50 bg-emerald-400/10 text-white'
                  : 'border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Daily reminder">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Remind me to practice</span>
          <button
            onClick={() => setReminder({ ...reminder, enabled: !reminder.enabled })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              reminder.enabled ? 'bg-emerald-400/80' : 'bg-white/10'
            }`}
            aria-label="Toggle reminder"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                reminder.enabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {reminder.enabled && (
          <>
            <div className="mt-3 flex gap-2">
              {reminderOptions.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setReminder({ ...reminder, optionId: o.id })}
                  className={`flex-1 rounded-xl border px-2 py-2 text-center text-xs ${
                    reminder.optionId === o.id
                      ? 'border-emerald-400/50 bg-emerald-400/10 text-white'
                      : 'border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  {o.label}
                  <div className="text-[10px] text-white/40">{o.time}</div>
                </button>
              ))}
            </div>
            <p className="mt-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-white/55">
              {getReminderMessage(profile.name, reminder)}
            </p>
          </>
        )}
      </Section>

      <Section title="Subscription">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">{plan} plan</div>
            <div className="text-xs text-white/40">Manage your daily minutes & features</div>
          </div>
          <button
            onClick={onShowPricing}
            className="rounded-full border border-white/15 px-4 py-1.5 text-sm hover:bg-white/[0.06]"
          >
            Manage plans →
          </button>
        </div>
      </Section>

      <Section title="Account">
        <button
          onClick={startAssessment}
          className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/[0.04]"
        >
          Retake the assessment
        </button>
        <button
          onClick={reset}
          className="mt-2 w-full rounded-xl border border-red-400/20 px-4 py-2.5 text-left text-sm text-red-300/80 hover:bg-red-400/[0.06]"
        >
          {cloud ? 'Sign out' : 'Reset app'}
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">{title}</h2>
      {children}
    </section>
  );
}
