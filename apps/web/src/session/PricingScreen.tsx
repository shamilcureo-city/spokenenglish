import { subscriptionPlans, completeCheckout } from '@fluentmap/core/domain';
import { useStore } from '../store';

export function PricingScreen({ onBack }: { onBack: () => void }) {
  const { plan, setPlan } = useStore();

  function choose(name: string) {
    if (name === plan) return;
    const { planName } = completeCheckout(plan, name); // demo checkout — no payment taken
    setPlan(planName);
    onBack();
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <header className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/50 hover:text-white/80">
          ← Back
        </button>
        <div className="text-sm font-semibold">Plans</div>
        <div className="w-12" />
      </header>

      <h1 className="text-center text-2xl font-bold">Speak more every day</h1>
      <p className="mt-1 text-center text-sm text-white/50">
        More daily minutes, more tracks, more practice. Cancel anytime.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {subscriptionPlans.map((p) => {
          const current = p.name === plan;
          const recommended = p.name === 'Core';
          return (
            <div
              key={p.name}
              className={`flex flex-col rounded-2xl border p-5 ${
                recommended ? 'border-emerald-400/40 bg-emerald-400/[0.04]' : 'border-white/5 bg-white/[0.02]'
              }`}
            >
              {recommended && (
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Most popular
                </div>
              )}
              <div className="text-lg font-bold">{p.name}</div>
              <div className="mt-1 text-2xl font-bold">
                {p.price}
                <span className="text-xs font-normal text-white/40">/mo</span>
              </div>
              <div className="mt-1 text-xs text-amber-300/80">{p.dailyMinutes} min / day</div>
              <ul className="mt-4 flex-1 space-y-1.5 text-xs text-white/60">
                {p.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <button
                onClick={() => choose(p.name)}
                disabled={current}
                className={`mt-5 rounded-full px-4 py-2 text-sm font-semibold ${
                  current
                    ? 'cursor-default border border-white/10 text-white/40'
                    : recommended
                      ? 'bg-gradient-to-r from-emerald-400 to-amber-300 text-black hover:opacity-90'
                      : 'border border-white/15 text-white hover:bg-white/[0.06]'
                }`}
              >
                {current ? 'Current plan' : p.amount === 0 ? 'Switch to Free' : 'Choose'}
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-center text-[11px] text-white/30">
        Demo checkout — no payment is taken. (Razorpay / RevenueCat wire-up is Phase 5.)
      </p>
    </div>
  );
}
