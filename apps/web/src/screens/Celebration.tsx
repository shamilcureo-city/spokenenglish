/**
 * A full-screen celebration with confetti — the variable-reward "delight" moment
 * (level-up, unit complete) that wires the habit (see METHOD.md → habit loop).
 */

const COLORS = ['#34d399', '#5eead4', '#fbbf24', '#f472b6', '#60a5fa', '#a78bfa'];
const PIECES = Array.from({ length: 48 }, (_, i) => i);

export function Celebration({
  emoji = '🎉',
  title,
  subtitle,
  onDone,
}: {
  emoji?: string;
  title: string;
  subtitle?: string;
  onDone: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 backdrop-blur-sm"
      onClick={onDone}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PIECES.map((i) => {
          // Deterministic-ish spread so it looks scattered without needing state.
          const left = (i * 37) % 100;
          const delay = (i % 7) * 0.12;
          const dur = 1.9 + ((i * 13) % 14) / 10;
          const w = 6 + ((i * 5) % 8);
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: '-6vh',
                width: `${w}px`,
                height: `${w * 0.55}px`,
                background: COLORS[i % COLORS.length],
                borderRadius: '2px',
                animation: `confetti-fall ${dur}s linear ${delay}s forwards`,
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 px-8 text-center" style={{ animation: 'pop-in 0.4s ease-out' }}>
        <div className="mb-3 text-6xl">{emoji}</div>
        <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-white/70">{subtitle}</p>}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDone();
          }}
          className="mt-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-8 py-3 text-sm font-bold text-black hover:opacity-90"
        >
          Keep going →
        </button>
      </div>
    </div>
  );
}
