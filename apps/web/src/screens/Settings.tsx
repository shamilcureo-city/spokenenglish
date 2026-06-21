import { useRef } from 'react';
import { GOALS, INTERESTS } from '@fluentmap/core/conversation';
import { useStore } from '../store';
import { LANGUAGES } from '../lib/constants';
import { Page } from './ui';

const MAX_INTERESTS = 5;

export function Settings({ onBack }: { onBack: () => void }) {
  const { profile, setProfile, weeklyGoal, setWeeklyGoal, storageWarning, exportData, importData, reset } =
    useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleInterest(tag: string) {
    const cur = profile.interests ?? [];
    const next = cur.includes(tag)
      ? cur.filter((t) => t !== tag)
      : cur.length >= MAX_INTERESTS
        ? cur
        : [...cur, tag];
    setProfile({ interests: next });
  }

  function doExport() {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `speakwell-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    void file.text().then((text) => {
      if (importData(text)) alert('Backup restored.');
      else alert("That file didn't look like a Speakwell backup.");
    });
  }

  function doReset() {
    if (confirm('Clear your profile, progress, and history on this device?')) reset();
  }

  return (
    <Page>
      <header className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/50 hover:text-white/85">
          ← Back
        </button>
        <div className="text-sm font-semibold">Settings</div>
        <div className="w-12" />
      </header>

      <div className="space-y-6">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/45">Name</span>
          <input
            value={profile.name}
            onChange={(e) => setProfile({ name: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-emerald-400/50"
          />
        </label>

        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/45">
            Mother tongue
          </span>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setProfile({ l1: lang })}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  profile.l1 === lang
                    ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-100'
                    : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/45">
            Main goal <span className="font-normal lowercase text-white/35">— tailors your practice</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                onClick={() => setProfile({ goal: profile.goal === g.id ? undefined : g.id })}
                className={`rounded-xl border px-3 py-2.5 text-left transition ${
                  profile.goal === g.id
                    ? 'border-emerald-400/60 bg-emerald-400/15'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                }`}
              >
                <div className={`text-sm font-semibold ${profile.goal === g.id ? 'text-emerald-100' : 'text-white/80'}`}>
                  {g.label}
                </div>
                <div className="mt-0.5 text-[11px] leading-tight text-white/40">{g.blurb}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/45">
            Interests <span className="font-normal lowercase text-white/35">— up to {MAX_INTERESTS}</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((tag) => {
              const on = (profile.interests ?? []).includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                    on
                      ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-100'
                      : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/45">
            Weekly goal <span className="font-normal lowercase text-white/35">— days per week</span>
          </span>
          <div className="flex gap-2">
            {[3, 4, 5, 6, 7].map((n) => (
              <button
                key={n}
                onClick={() => setWeeklyGoal(n)}
                className={`h-10 w-10 rounded-lg border text-sm font-semibold transition ${
                  weeklyGoal === n
                    ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-100'
                    : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Backup — the only safety net before accounts/sync exist */}
        <div className="border-t border-white/5 pt-5">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/45">
            Backup your progress
          </span>
          {storageWarning && (
            <p className="mb-3 rounded-lg border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-xs text-amber-100/90">
              ⚠️ This browser is low on storage — export a backup so you don't lose your streak.
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={doExport}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/[0.06]"
            >
              ⬇️ Export
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/[0.06]"
            >
              ⬆️ Restore
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={onPickFile} className="hidden" />
          </div>
          <p className="mt-2 text-[11px] text-white/35">
            Your progress lives only in this browser for now — export keeps a copy safe.
          </p>
        </div>

        <div className="border-t border-white/5 pt-5">
          <button onClick={doReset} className="text-sm text-red-300/80 hover:text-red-300">
            Clear all data
          </button>
          <p className="mt-4 text-[11px] leading-relaxed text-white/30">
            Your profile and progress are stored only in this browser (there's no account yet). During a live
            conversation, your speech is sent to Google Gemini to power the AI partner and your feedback — it
            isn't used to train models or shared with anyone else.
          </p>
        </div>
      </div>
    </Page>
  );
}
