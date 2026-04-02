import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  Info,
  MessageCircle,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  adjustedDailyLimit,
  availableBalance,
  categorySpend,
  dailySpent,
  fmt,
  fmtFull,
  healthScore,
  monthlyBudget,
  savedThisMonth,
  todayStr,
} from "../lib/engine";
import type { Expense, Loan, Screen, UserProfile } from "../types";

interface InsightCard {
  id: string;
  type: "error" | "warning" | "success" | "info";
  icon: React.ReactNode;
  title: string;
  description: string;
}

const TYPE_STYLES: Record<
  InsightCard["type"],
  { bg: string; border: string; iconBg: string; iconColor: string; bar: string }
> = {
  error: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800/40",
    iconBg: "bg-red-100 dark:bg-red-900/50",
    iconColor: "text-red-500",
    bar: "bg-red-500",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/40",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-500",
    bar: "bg-amber-500",
  },
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/40",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-500",
    bar: "bg-emerald-500",
  },
  info: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800/40",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    iconColor: "text-violet-500",
    bar: "bg-violet-500",
  },
};

interface Props {
  profile: UserProfile;
  expenses: Expense[];
  loans: Loan[];
  onNavigate: (screen: Screen) => void;
}

export default function AIInsightsScreen({
  profile,
  expenses,
  loans: _loans,
  onNavigate,
}: Props) {
  const today = todayStr();
  const dailyLimit = adjustedDailyLimit(profile, expenses);
  const todaySpent = dailySpent(expenses, today);
  const balance = availableBalance(profile, expenses);
  const budget = monthlyBudget(profile);
  const catSpend = categorySpend(expenses);
  const totalCatSpend = Object.values(catSpend).reduce((s, v) => s + v, 0);
  const saved = savedThisMonth(profile, expenses) + profile.currentSavings;
  const savingsPct =
    profile.savingsGoal > 0 ? (saved / profile.savingsGoal) * 100 : 0;
  const { score, savingsRate, budgetDiscipline } = healthScore(
    profile,
    expenses,
  );

  const insights: InsightCard[] = [];

  // Overspending today
  if (dailyLimit > 0 && todaySpent > dailyLimit) {
    insights.push({
      id: "overspend-today",
      type: "error",
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "Daily Limit Exceeded",
      description: `You've exceeded today's limit by ${fmtFull(todaySpent - dailyLimit)}. Your adjusted limit tomorrow will be lower.`,
    });
  }

  // Low balance warning
  if (budget > 0 && balance < budget * 0.2) {
    insights.push({
      id: "low-balance",
      type: "error",
      icon: <TrendingDown className="w-5 h-5" />,
      title: "Low Monthly Balance",
      description: `Only ${fmt(balance)} remaining of your ${fmt(budget)} monthly budget. Consider pausing non-essential spending.`,
    });
  }

  // High category spend
  const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];
  if (topCat && totalCatSpend > 0 && topCat[1] / totalCatSpend > 0.4) {
    insights.push({
      id: "high-cat",
      type: "warning",
      icon: <AlertTriangle className="w-5 h-5" />,
      title: `High ${topCat[0]} Spending`,
      description: `${topCat[0]} takes up ${Math.round((topCat[1] / totalCatSpend) * 100)}% of your total spending (${fmt(topCat[1])}). Try to reduce it by 20%.`,
    });
  }

  // Savings on track
  if (savingsPct >= 50) {
    insights.push({
      id: "savings-good",
      type: "success",
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Savings On Track 🎉",
      description: `You're ${Math.round(savingsPct)}% toward your goal "${profile.goalName}". Keep up the great work!`,
    });
  } else if (profile.currentSavings === 0 && expenses.length === 0) {
    insights.push({
      id: "get-started",
      type: "info",
      icon: <Info className="w-5 h-5" />,
      title: "Start Tracking Today",
      description:
        "Add your first expense to unlock personalized AI insights and smart suggestions.",
    });
  }

  // Today is good
  if (
    dailyLimit > 0 &&
    todaySpent <= dailyLimit &&
    expenses.some((e) => e.date === today)
  ) {
    insights.push({
      id: "today-good",
      type: "success",
      icon: <TrendingUp className="w-5 h-5" />,
      title: "On Track Today 🎯",
      description: `Spent ${fmtFull(todaySpent)} of your ${fmtFull(dailyLimit)} daily limit. ${fmtFull(Math.max(0, dailyLimit - todaySpent))} left for today.`,
    });
  }

  // Health score
  const scoreType: InsightCard["type"] =
    score >= 70 ? "success" : score >= 40 ? "warning" : "error";
  insights.push({
    id: "health-score",
    type: scoreType,
    icon: <Brain className="w-5 h-5" />,
    title: `Financial Health: ${score}/100`,
    description: `Savings Rate: ${savingsRate}% · Budget Discipline: ${budgetDiscipline}%`,
  });

  // Static AI tips
  const staticTips: InsightCard[] = [
    {
      id: "tip-5020",
      type: "info",
      icon: <Sparkles className="w-5 h-5" />,
      title: "Try the 50/30/20 Rule",
      description:
        "Allocate 50% of income to needs, 30% to wants, and 20% to savings for a balanced financial life.",
    },
    {
      id: "tip-automate",
      type: "info",
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Automate Your Savings",
      description:
        "Set up auto-transfer to savings on payday. Pay yourself first before spending on anything else.",
    },
    {
      id: "tip-subscriptions",
      type: "info",
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "Review Subscriptions Monthly",
      description:
        "Cancel unused OTT and app subscriptions. Even ₹500/month saved = ₹6,000/year compounding.",
    },
  ];

  const allCards = [...insights, ...staticTips];

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* Header */}
      <div
        className="pt-4 pb-5 rounded-2xl mt-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(79,166,255,0.15) 0%, rgba(123,92,255,0.15) 100%)",
          border: "1px solid rgba(123,92,255,0.2)",
        }}
      >
        <div className="flex items-center gap-3 px-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
              boxShadow: "0 4px 16px rgba(123, 92, 255, 0.35)",
            }}
          >
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-foreground">
              AI Insights
            </h2>
            <p className="text-xs text-muted-foreground">
              Smart analysis of your finances
            </p>
          </div>
        </div>

        {/* Score summary */}
        <div className="grid grid-cols-3 gap-2 px-4 mt-4">
          {[
            { label: "Health Score", value: `${score}`, suffix: "/100" },
            { label: "Savings Rate", value: `${savingsRate}`, suffix: "%" },
            {
              label: "Budget Discipline",
              value: `${budgetDiscipline}`,
              suffix: "%",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center rounded-xl p-3 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 2px 8px rgba(79,92,255,0.06)",
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
                style={{
                  background: "linear-gradient(90deg, #4FA6FF, #7B5CFF)",
                  opacity: 0.7,
                }}
              />
              <div className="flex items-baseline justify-center gap-0.5">
                <span
                  className="text-xl font-extrabold"
                  style={{
                    background:
                      "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.value}
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.suffix}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Insight cards */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Live Alerts
        </p>
        <div className="space-y-3" data-ocid="insights.list">
          {allCards.slice(0, insights.length).map((card, i) => {
            const styles = TYPE_STYLES[card.type];
            return (
              <div
                key={card.id}
                className={`flex gap-3 p-4 rounded-2xl border ${styles.bg} ${styles.border} animate-fade-up`}
                style={{ animationDelay: `${i * 60}ms` }}
                data-ocid={`insights.item.${i + 1}`}
              >
                {/* Color bar */}
                <div
                  className={`w-1 rounded-full flex-shrink-0 self-stretch ${styles.bar}`}
                />
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.iconBg} ${styles.iconColor}`}
                >
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">
                    {card.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress section */}
      {profile.savingsGoal > 0 && (
        <div className="glass-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Goal Progress
          </p>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-foreground">
              {profile.goalName}
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.round(savingsPct)}%
            </p>
          </div>
          <Progress value={savingsPct} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
            <span>{fmt(saved)} saved</span>
            <span>{fmt(profile.savingsGoal)} target</span>
          </div>
        </div>
      )}

      {/* AI Tips */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          AI Tips
        </p>
        <div className="space-y-3">
          {staticTips.map((card, i) => {
            const styles = TYPE_STYLES[card.type];
            return (
              <div
                key={card.id}
                className={`flex gap-3 p-4 rounded-2xl border ${styles.bg} ${styles.border} animate-fade-up`}
                style={{ animationDelay: `${(insights.length + i) * 60}ms` }}
                data-ocid={`insights.item.${insights.length + i + 1}`}
              >
                <div
                  className={`w-1 rounded-full flex-shrink-0 self-stretch ${styles.bar}`}
                />
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.iconBg} ${styles.iconColor}`}
                >
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">
                    {card.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ask AI button */}
      <button
        type="button"
        onClick={() => onNavigate("chat")}
        className="w-full h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
          boxShadow: "0 4px 20px rgba(123, 92, 255, 0.4)",
        }}
        data-ocid="insights.primary_button"
      >
        <MessageCircle className="w-4 h-4" />
        Ask AI Assistant
      </button>
    </div>
  );
}
