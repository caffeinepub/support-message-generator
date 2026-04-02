import type { Expense, UserProfile } from "../types";
import {
  adjustedDailyLimit,
  availableBalance,
  categorySpend,
  dailySpent,
  fmt,
  fmtFull,
  healthScore,
  monthlyBudget,
  monthlySpent,
  savedThisMonth,
  todayStr,
} from "./engine";

export function getAIResponse(
  input: string,
  profile: UserProfile,
  expenses: Expense[],
): string {
  const q = input.toLowerCase().trim();

  // Can I spend X today?
  const spendMatch = q.match(/spend[^₹\d]*(₹?\s*([\d,]+))/);
  if (spendMatch || q.includes("can i spend") || q.includes("spend today")) {
    const limit = adjustedDailyLimit(profile, expenses);
    const todayUsed = dailySpent(expenses, todayStr());
    const remaining = Math.max(0, limit - todayUsed);

    let asked = 0;
    const numMatch = input.match(/[₹]?\s*([\d,]+)/);
    if (numMatch) asked = Number.parseInt(numMatch[1].replace(",", ""), 10);

    if (asked > 0 && asked <= remaining) {
      return `✅ Yes, you can spend ${fmtFull(asked)} today! You still have ${fmtFull(remaining)} left in your daily limit (${fmtFull(limit)}). Enjoy your purchase! 🎉`;
    }
    if (asked > 0) {
      return `⚠️ I\'d advise caution. You only have ${fmtFull(remaining)} left for today (daily limit: ${fmtFull(limit)}). Spending ${fmtFull(asked)} would exceed it by ${fmtFull(asked - remaining)}. Consider waiting or reducing the amount.`;
    }
    return `💰 Your daily limit today is ${fmtFull(limit)}. You've spent ${fmtFull(todayUsed)} so far, leaving ${fmtFull(remaining)} for the rest of the day.`;
  }

  // Savings tips
  if (
    q.includes("save more") ||
    q.includes("how to save") ||
    q.includes("saving tips") ||
    q.includes("savings")
  ) {
    const catSpend = categorySpend(expenses);
    const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];
    const topTip = topCat
      ? `Your highest spending category is **${topCat[0]}** (${fmt(topCat[1])}). Try reducing it by 20%.`
      : "Track all expenses consistently to find saving opportunities.";
    return `💡 Here are personalized saving tips:\n\n1. ${topTip}\n2. Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.\n3. Automate savings on payday before spending.\n4. Review subscriptions monthly — cancel unused ones.\n5. Cook at home 3 extra days/week to cut food costs.\n6. Set a weekly cash budget for discretionary spending.`;
  }

  // Budget summary
  if (q.includes("budget")) {
    const budget = monthlyBudget(profile);
    const spent = monthlySpent(expenses);
    const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    return `📊 **Monthly Budget Summary**\n\nIncome: ${fmtFull(profile.monthlyIncome)}\nFixed Expenses: ${fmtFull(profile.fixedExpenses)}\nSavings Goal: ${fmtFull(profile.savingsGoal)}\nSpendable Budget: ${fmtFull(budget)}\nSpent So Far: ${fmtFull(spent)} (${pct}%)\nRemaining: ${fmtFull(Math.max(0, budget - spent))}`;
  }

  // Expenses / spending breakdown
  if (q.includes("expense") || q.includes("spending") || q.includes("spent")) {
    const catSpend = categorySpend(expenses);
    const entries = Object.entries(catSpend).sort((a, b) => b[1] - a[1]);
    if (!entries.length) {
      return "📭 No expenses logged this month yet. Start adding your expenses to get insights!";
    }
    const lines = entries
      .map(([cat, amt]) => `• ${cat}: ${fmtFull(amt)}`)
      .join("\n");
    return `🛍️ **This Month\u2019s Spending by Category:**\n\n${lines}\n\nTotal: ${fmtFull(monthlySpent(expenses))}`;
  }

  // Health score
  if (q.includes("health") || q.includes("score") || q.includes("financial")) {
    const { score, savingsRate, budgetDiscipline } = healthScore(
      profile,
      expenses,
    );
    const emoji = score >= 70 ? "🟢" : score >= 40 ? "🟡" : "🔴";
    const msg =
      score >= 70
        ? "Great job! You're managing your finances well. Keep it up!"
        : score >= 40
          ? "You're doing okay, but there's room to improve. Focus on staying within your daily budget."
          : "Let's work on improving! Try to stick to your daily limit and increase savings gradually.";
    return `${emoji} **Your Financial Health Score: ${score}/100**\n\nSavings Rate: ${savingsRate}%\nBudget Discipline: ${budgetDiscipline}%\n\n${msg}`;
  }

  // Goal progress
  if (q.includes("goal") || q.includes("target")) {
    const saved = savedThisMonth(profile, expenses) + profile.currentSavings;
    const pct =
      profile.savingsGoal > 0
        ? Math.round((saved / profile.savingsGoal) * 100)
        : 0;
    const goalMsg =
      pct >= 100
        ? "🎉 Congratulations! You've reached your goal!"
        : pct >= 50
          ? "You're halfway there! Keep going!"
          : "Every rupee counts. Stay consistent and you'll get there!";
    return `🎯 **Goal: ${profile.goalName}**\n\nTarget: ${fmtFull(profile.savingsGoal)}\nSaved So Far: ${fmtFull(saved)} (${pct}%)\nStill Needed: ${fmtFull(Math.max(0, profile.savingsGoal - saved))}\n\n${goalMsg}`;
  }

  // Balance query
  if (q.includes("balance") || q.includes("how much") || q.includes("left")) {
    const bal = availableBalance(profile, expenses);
    return `💳 Your available balance for this month is **${fmtFull(bal)}**. This is your spendable money after fixed expenses and savings goal for the remaining days.`;
  }

  // Hello / greeting
  if (q.match(/^(hi|hello|hey|namaste)/)) {
    return `Namaste! 👋 I'm your AI Cash Manager. I can help you with:\n\n• Check if you can afford something today\n• Budget & spending summary\n• Savings tips\n• Goal progress\n• Financial health score\n\nJust ask me anything! 😊`;
  }

  return `🤔 I'm not sure about that, but here are some things I can help you with:\n\n• "Can I spend ₹500 today?"\n• "What's my budget status?"\n• "How to save more money?"\n• "Show my expenses"\n• "What's my health score?"\n• "How's my goal progress?"\n\nFeel free to ask!`;
}
