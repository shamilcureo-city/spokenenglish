import { retrievability } from '@fluentmap/core/science';

interface Props {
  stability: number; // FSRS S (days)
  days?: number;
  width?: number;
  height?: number;
}

/**
 * Plots the FSRS forgetting curve R(t) for a skill — the single most defensible
 * "we show you the science" artifact. The dashed line is the 90% retention
 * target; the marker is where the next review is scheduled.
 */
export function ForgettingCurve({ stability, days = 60, width = 280, height = 96 }: Props) {
  const pad = 8;
  const innerW = width - 2 * pad;
  const innerH = height - 2 * pad;
  const n = 56;

  const x = (t: number): number => pad + (t / days) * innerW;
  const y = (r: number): number => pad + (1 - r) * innerH;

  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * days;
    pts.push(`${x(t).toFixed(1)},${y(retrievability(t, stability)).toFixed(1)}`);
  }
  const area = `${pad},${pad + innerH} ${pts.join(' ')} ${pad + innerW},${pad + innerH}`;

  const y90 = y(0.9);
  const ivl = Math.min(stability, days); // R hits 0.9 at t = stability
  const xIvl = x(ivl);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={pad} y1={y90} x2={pad + innerW} y2={y90} stroke="#4b5366" strokeWidth="1" strokeDasharray="3 3" />
      <text x={pad} y={y90 - 4} className="fill-white/35" fontSize="9">90% retention</text>
      <polygon points={area} fill="url(#curveFill)" />
      <polyline points={pts.join(' ')} fill="none" stroke="#60a5fa" strokeWidth="2.5" />
      <line x1={xIvl} y1={pad} x2={xIvl} y2={pad + innerH} stroke="#f4c430" strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx={xIvl} cy={y90} r="3.5" fill="#f4c430" />
      <text x={Math.min(xIvl + 5, width - 40)} y={pad + innerH} className="fill-amber-300/80" fontSize="9">
        review ~{Math.round(ivl)}d
      </text>
    </svg>
  );
}
