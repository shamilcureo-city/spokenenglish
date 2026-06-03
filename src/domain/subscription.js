export const subscriptionPlans = [
  {
    name: 'Free',
    price: '₹0',
    amount: 0,
    dailyMinutes: 5,
    features: ['Starter warm-up practice', 'Basic correction preview', 'Limited daily report'],
  },
  {
    name: 'Core',
    price: '₹199/month',
    amount: 199,
    dailyMinutes: 30,
    features: ['Full 30-minute daily AI class', 'Detailed reports', 'Mistake notebook', 'Weekly progress'],
  },
  {
    name: 'Career',
    price: '₹499/month',
    amount: 499,
    dailyMinutes: 45,
    features: ['Interview simulator', 'BPO and sales scenarios', 'Advanced reports', 'Priority practice packs'],
  },
];

export const getPlanByName = (planName) => subscriptionPlans.find((plan) => plan.name === planName) ?? subscriptionPlans[0];

export const createDefaultUsage = (today = new Date()) => ({
  date: today.toISOString().slice(0, 10),
  usedMinutes: 0,
});

export const normalizeUsageForToday = (usage, today = new Date()) => {
  const todayKey = today.toISOString().slice(0, 10);
  if (!usage || usage.date !== todayKey) return createDefaultUsage(today);
  return usage;
};

export const getRemainingMinutes = (planName, usage, today = new Date()) => {
  const plan = getPlanByName(planName);
  const normalizedUsage = normalizeUsageForToday(usage, today);
  return Math.max(0, plan.dailyMinutes - normalizedUsage.usedMinutes);
};

export const canUseMinutes = (planName, usage, requestedMinutes, today = new Date()) => (
  getRemainingMinutes(planName, usage, today) >= requestedMinutes
);

export const addUsageMinutes = (usage, minutes, today = new Date()) => {
  const normalizedUsage = normalizeUsageForToday(usage, today);
  return {
    ...normalizedUsage,
    usedMinutes: Number((normalizedUsage.usedMinutes + minutes).toFixed(1)),
  };
};

export const createBillingEvent = ({ planName, status = 'checkout_started', amount = getPlanByName(planName).amount }) => ({
  id: crypto.randomUUID(),
  planName,
  status,
  amount,
  createdAt: new Date().toISOString(),
});

export const completeCheckout = (currentPlanName, targetPlanName) => {
  const targetPlan = getPlanByName(targetPlanName);
  if (targetPlan.name === currentPlanName) {
    return {
      planName: currentPlanName,
      event: createBillingEvent({ planName: targetPlan.name, status: 'already_active', amount: targetPlan.amount }),
    };
  }

  return {
    planName: targetPlan.name,
    event: createBillingEvent({ planName: targetPlan.name, status: 'payment_success', amount: targetPlan.amount }),
  };
};
