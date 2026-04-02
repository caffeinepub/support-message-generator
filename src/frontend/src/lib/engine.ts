import type { Expense, UserProfile } from "../types";

export function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function daysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/** Total spent this calendar month */
export function monthlySpent(expenses: Expense[]): number {
  const prefix = todayStr().slice(0, 7);
  return expenses
    .filter((e) => e.date.startsWith(prefix))
    .reduce((s, e) => s + e.amount, 0);
}

/** Spend on a given YYYY-MM-DD */
export function dailySpent(expenses: Expense[], date: string): number {
  return expenses
    .filter((e) => e.date === date)
    .reduce((s, e) => s + e.amount, 0);
}

/** Base daily limit (no adjustments) */
export function baseDailyLimit(profile: UserProfile): number {
  const disposable =
    profile.monthlyIncome - profile.fixedExpenses - profile.savingsGoal;
  return Math.max(0, disposable / daysInCurrentMonth());
}

/** Adjusted daily limit — reduces by yesterday’s overspend if any */
export function adjustedDailyLimit(
  profile: UserProfile,
  expenses: Expense[],
): number {
  const base = baseDailyLimit(profile);
  const yesterday = toDateStr(new Date(Date.now() - 86_400_000));
  const ySpent = dailySpent(expenses, yesterday);
  const overspend = Math.max(0, ySpent - base);
  return Math.max(0, base - overspend);
}

/** Available balance this month */
export function availableBalance(
  profile: UserProfile,
  expenses: Expense[],
): number {
  const budget =
    profile.monthlyIncome - profile.fixedExpenses - profile.savingsGoal;
  return Math.max(0, budget - monthlySpent(expenses));
}

/** Monthly budget (spendable money) */
export function monthlyBudget(profile: UserProfile): number {
  return Math.max(
    0,
    profile.monthlyIncome - profile.fixedExpenses - profile.savingsGoal,
  );
}

/** Spending by category this month */
export function categorySpend(expenses: Expense[]): Record<string, number> {
  const prefix = todayStr().slice(0, 7);
  const result: Record<string, number> = {};
  for (const e of expenses) {
    if (!e.date.startsWith(prefix)) continue;
    result[e.category] = (result[e.category] || 0) + e.amount;
  }
  return result;
}

/** Financial health score 0–100 */
export function healthScore(
  profile: UserProfile,
  expenses: Expense[],
): {
  score: number;
  savingsRate: number;
  budgetDiscipline: number;
  consistency: number;
} {
  const income = profile.monthlyIncome;
  if (!income)
    return { score: 0, savingsRate: 0, budgetDiscipline: 0, consistency: 0 };

  const spent = monthlySpent(expenses);
  const saved = income - profile.fixedExpenses - spent;
  const savingsRate = Math.min(100, Math.max(0, (saved / income) * 100));

  const base = baseDailyLimit(profile);
  const prefix = todayStr().slice(0, 7);
  const daysWithData = new Set(
    expenses.filter((e) => e.date.startsWith(prefix)).map((e) => e.date),
  );
  let withinBudget = 0;
  for (const d of daysWithData) {
    if (dailySpent(expenses, d) <= base) withinBudget++;
  }
  const budgetDiscipline =
    daysWithData.size > 0
      ? Math.round((withinBudget / daysWithData.size) * 100)
      : 80;

  const dailyAmounts = Array.from(daysWithData).map((d) =>
    dailySpent(expenses, d),
  );
  let consistency = 75;
  if (dailyAmounts.length > 1) {
    const mean = dailyAmounts.reduce((a, b) => a + b, 0) / dailyAmounts.length;
    const variance =
      dailyAmounts.reduce((s, v) => s + (v - mean) ** 2, 0) /
      dailyAmounts.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
    consistency = Math.round(Math.max(0, Math.min(100, (1 - cv) * 100)));
  }

  const score = Math.round(
    savingsRate * 0.4 + budgetDiscipline * 0.35 + consistency * 0.25,
  );

  return {
    score,
    savingsRate: Math.round(savingsRate),
    budgetDiscipline,
    consistency,
  };
}

/** Saved so far this month (income - fixed - spent) */
export function savedThisMonth(
  profile: UserProfile,
  expenses: Expense[],
): number {
  return Math.max(
    0,
    profile.monthlyIncome - profile.fixedExpenses - monthlySpent(expenses),
  );
}

/** Daily savings needed to hit goal */
export function dailySavingsNeeded(
  profile: UserProfile,
  expenses: Expense[],
): number {
  const current = profile.currentSavings + savedThisMonth(profile, expenses);
  const needed = Math.max(0, profile.savingsGoal - current);
  return needed / 30;
}

/** Format number as ₹ abbreviated */
export function fmt(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

/** Format number as full ₹ with locale */
export function fmtFull(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}
