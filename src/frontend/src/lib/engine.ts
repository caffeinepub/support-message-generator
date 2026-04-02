import type { Expense, Loan, UserProfile } from "../types";

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

/** Adjusted daily limit — reduces by yesterday's overspend if any */
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

// ─── Loan Calculations ───────────────────────────────────────────────────────

/** Remaining months left to pay */
export function loanRemainingMonths(loan: Loan): number {
  return Math.max(0, loan.tenureMonths - loan.paidMonths);
}

/** Amount paid so far (principal + interest portion = EMI * paidMonths) */
export function loanAmountPaid(loan: Loan): number {
  return loan.emiAmount * loan.paidMonths;
}

/** Total payable over full tenure */
export function loanTotalPayable(loan: Loan): number {
  return loan.emiAmount * loan.tenureMonths;
}

/** Total interest component */
export function loanTotalInterest(loan: Loan): number {
  return Math.max(0, loanTotalPayable(loan) - loan.principal);
}

/** Outstanding principal (approx using reducing balance) */
export function loanOutstanding(loan: Loan): number {
  const r = loan.interestRate / 100 / 12;
  if (r === 0) {
    return Math.max(
      0,
      loan.principal - (loan.principal / loan.tenureMonths) * loan.paidMonths,
    );
  }
  const n = loan.tenureMonths;
  const p = loan.principal;
  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const paid = loan.paidMonths;
  const _outstanding =
    p * (1 + r) ** n -
    loan.emiAmount * (((1 + r) ** paid - 1) / r) * (1 + r) ** (n - paid);
  // Simplified: use remaining EMIs approach
  const remaining = loanRemainingMonths(loan);
  if (remaining <= 0) return 0;
  return (loan.emiAmount * (1 - (1 + r) ** -remaining)) / r;
}

/** Progress percentage (paid months / tenure) */
export function loanProgressPct(loan: Loan): number {
  return Math.min(100, Math.round((loan.paidMonths / loan.tenureMonths) * 100));
}

/** Total monthly EMI burden across all loans */
export function totalEMIBurden(loans: Loan[]): number {
  return loans
    .filter((l) => loanRemainingMonths(l) > 0)
    .reduce((s, l) => s + l.emiAmount, 0);
}

/** Total outstanding across all loans */
export function totalOutstanding(loans: Loan[]): number {
  return loans.reduce((s, l) => s + loanOutstanding(l), 0);
}

/** Interest saved if prepaid X amount today (approx months reduced) */
export function interestSavedByPrepayment(
  loan: Loan,
  prepayAmount: number,
): {
  monthsReduced: number;
  interestSaved: number;
} {
  const r = loan.interestRate / 100 / 12;
  const remaining = loanRemainingMonths(loan);
  if (remaining <= 0 || prepayAmount <= 0)
    return { monthsReduced: 0, interestSaved: 0 };
  const outstanding = loanOutstanding(loan);
  const newOutstanding = Math.max(0, outstanding - prepayAmount);
  let newTenure = remaining;
  if (r > 0) {
    newTenure = Math.ceil(
      Math.log(loan.emiAmount / (loan.emiAmount - newOutstanding * r)) /
        Math.log(1 + r),
    );
  } else {
    newTenure = Math.ceil(newOutstanding / loan.emiAmount);
  }
  const monthsReduced = Math.max(0, remaining - newTenure);
  const interestSaved =
    monthsReduced * loan.emiAmount - (outstanding - newOutstanding);
  return { monthsReduced, interestSaved: Math.max(0, interestSaved) };
}
