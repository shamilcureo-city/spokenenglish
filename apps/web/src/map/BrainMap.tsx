import { computeMastery, type Skill, type SkillState } from '@fluentmap/core/science';
import { masteryColor, FAMILY_LABEL, FAMILY_ORDER } from '../lib/colors';

interface Props {
  skills: Skill[];
  stateById: Map<string, SkillState>;
  now: Date;
}

/** Skills grouped family → cluster, each node coloured by live mastery. */
export function BrainMap({ skills, stateById, now }: Props) {
  // family -> cluster -> skills
  const byFamily = new Map<string, Map<string, Skill[]>>();
  for (const sk of skills) {
    const clusters = byFamily.get(sk.family) ?? new Map<string, Skill[]>();
    const arr = clusters.get(sk.cluster) ?? [];
    arr.push(sk);
    clusters.set(sk.cluster, arr);
    byFamily.set(sk.family, clusters);
  }

  return (
    <div className="space-y-6">
      {FAMILY_ORDER.map((family) => {
        const clusters = byFamily.get(family);
        if (!clusters) return null;
        return (
          <section key={family}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              {FAMILY_LABEL[family]}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[...clusters.entries()].map(([cluster, group]) => {
                const masteredInCluster = group.filter((s) => stateById.get(s.id)?.state === 'mastered').length;
                return (
                  <div
                    key={cluster}
                    className="rounded-xl border border-white/5 bg-white/[0.025] p-3 transition-colors hover:border-white/10"
                  >
                    <div className="mb-2 flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-white/85">{cluster}</span>
                      <span className="text-[11px] tabular-nums text-white/35">
                        {masteredInCluster}/{group.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.map((sk) => {
                        const st = stateById.get(sk.id);
                        const m = st ? computeMastery(st, now) : 0;
                        const color = masteryColor(m, st?.state ?? 'new');
                        return (
                          <span
                            key={sk.id}
                            title={`${sk.label} · ${sk.cefr} · ${Math.round(m * 100)}%`}
                            className="h-4 w-4 rounded-[5px] ring-1 ring-inset ring-black/30 transition-transform hover:scale-125"
                            style={{ backgroundColor: color }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
