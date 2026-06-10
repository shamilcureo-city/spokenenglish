/**
 * Subscriptions & usage gating — ported from the original `subscription.js`.
 * Pure functions over a daily-minutes entitlement. The date is passed in
 * ('YYYY-MM-DD') so everything is deterministic.
 */

export interface SubscriptionPlan {
  name: string;
  price: string;
  amount: number; // INR
  dailyMinutes: number;
  features: string[];
}

export const subscriptionPlans: SubscriptionPlan[] = [
  { name: 'Free', price: '₹0', amount: 0, dailyMinutes: 5, features: ['5 minutes a day', 'Beginner lessons', 'Basic report'] },
  { name: 'Starter', price: '₹99', amount: 99, dailyMinutes: 15, features: ['15 minutes a day', 'All daily lessons', 'Full report'] },
  { name: 'Core', price: '₹249', amount: 249, dailyMinutes: 30, features: ['30 minutes a day', 'All tracks', 'Detailed reports', 'Spaced reviews'] },
  { name: 'Career', price: '₹499', amount: 499, dailyMinutes: 45, features: ['45 minutes a day', 'Interview simulator', 'Priority coach', 'Mock tests'] },
];

export interface Usage {
  date: string; // YYYY-MM-DD
  usedMinutes: number;
}

/** YYYY-MM-DD key for a date (UTC). */
export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getPlanByName(name: string): SubscriptionPlan {
  return subscriptionPlans.find((p) => p.name === name) ?? subscriptionPlans[0]!;
}

export function createDefaultUsage(today: string): Usage {
  return { date: today, usedMinutes: 0 };
}

/** Reset the counter if the stored usage is from a previous day. */
export function normalizeUsageForToday(usage: Usage, today: string): Usage {
  return usage.date === today ? usage : { date: today, usedMinutes: 0 };
}

export function getRemainingMinutes(planName: string, usage: Usage, today: string): number {
  const plan = getPlanByName(planName);
  const u = normalizeUsageForToday(usage, today);
  return Math.max(0, plan.dailyMinutes - u.usedMinutes);
}

export function canUseMinutes(
  planName: string,
  usage: Usage,
  today: string,
  requestedMinutes: number,
): boolean {
  return getRemainingMinutes(planName, usage, today) >= requestedMinutes;
}

export function addUsageMinutes(usage: Usage, minutes: number, today: string): Usage {
  const u = normalizeUsageForToday(usage, today);
  return { date: today, usedMinutes: Math.max(0, u.usedMinutes + minutes) };
}

export interface BillingEvent {
  planName: string;
  status: string;
  amount: number;
}

export function createBillingEvent(input: { planName: string; status: string; amount?: number }): BillingEvent {
  const plan = getPlanByName(input.planName);
  return { planName: input.planName, status: input.status, amount: input.amount ?? plan.amount };
}

export function completeCheckout(
  _currentPlanName: string,
  targetPlanName: string,
): { planName: string; event: BillingEvent } {
  return { planName: targetPlanName, event: createBillingEvent({ planName: targetPlanName, status: 'paid' }) };
}
