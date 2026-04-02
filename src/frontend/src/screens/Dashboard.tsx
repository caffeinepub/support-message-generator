import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Brain,
  Plus,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
  Zap,
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
  monthlySpent,
  savedThisMonth,
  todayStr,
  totalEMIBurden,
  totalOutstanding,
} from "../lib/engine";
import type { Expense, Loan, Screen, UserProfile } from "../types";

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#FF8A4C",
  Travel: "#4FA6FF",
  Shopping: "#7B5CFF",
  Bills: "#FFD166",
  Other: "#94A3B8",
};

function DonutChart({ catSpend }: { catSpend: Record<string, number> }) {
  const entries = Object.entries(catSpend).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
        {/* Empty donut ring */}
        <svg
          viewBox="0 0 120 120"
          className="w-24 h-24 opacity-30"
          aria-hidden="true"
        >
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-border"
            strokeDasharray="6 4"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            No expenses yet
          </p>
          <p className="text-xs text-muted-foreground/50 mt-0.5">
            Add expenses to unlock chart
          </p>
        </div>
      </div>
    );
  }

  const cx = 60;
  const cy = 60;
  const r = 46;
  const gapAngle = 2; // degrees gap between segments
  let startAngle = -90;
  const segments: {
    path: string;
    color: string;
    label: string;
    pct: number;
  }[] = [];

  for (const [cat, val] of entries) {
    const pct = val / total;
    const angle = pct * 360 - gapAngle;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
    const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
    const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
    const largeArc = angle > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    segments.push({
      path,
      color: CATEGORY_COLORS[cat] || "#94A3B8",
      label: cat,
      pct: Math.round(pct * 100),
    });
    startAngle = endAngle + gapAngle;
  }

  return (
    <div className="flex items-center gap-6">
      {/* SVG donut */}
      <div className="relative flex-shrink-0">
        <svg
          viewBox="0 0 120 120"
          className="w-28 h-28"
          role="img"
          aria-label="Expense category breakdown"
        >
          {segments.map((seg) => (
            <path key={seg.label} d={seg.path} fill={seg.color} opacity="0.9" />
          ))}
          {/* Donut hole — solid fill matching card bg */}
          <circle cx={cx} cy={cy} r={30} className="fill-card" />
        </svg>
        {/* Center label: total spend */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ pointerEvents: "none" }}
        >
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">
            Total
          </p>
          <p className="text-xs font-extrabold text-foreground mt-0.5 leading-none">
            {total >= 1000
              ? `₹${(total / 1000).toFixed(1)}K`
              : `₹${Math.round(total)}`}
          </p>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: seg.color }}
            />
            <span className="text-xs text-muted-foreground flex-1">
              {seg.label}
            </span>
            <span className="text-xs font-semibold text-foreground">
              {seg.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Greeting({ name }: { name?: string }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const date = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return (
    <div>
      <p className="text-muted-foreground text-sm">
        {greeting} {name ? `${name.split(" ")[0]}` : ""} 👋
      </p>
      <p className="text-xs text-muted-foreground/70 mt-0.5">{date}</p>
    </div>
  );
}

interface Props {
  profile: UserProfile;
  userName: string;
  expenses: Expense[];
  loans: Loan[];
  onAddExpense: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onNavigate: (screen: Screen) => void;
}

export default function Dashboard({
  profile,
  userName,
  expenses,
  loans,
  onAddExpense,
  onToggleTheme,
  onNavigate,
}: Props) {
  const balance = availableBalance(profile, expenses);
  const dailyLimit = adjustedDailyLimit(profile, expenses);
  const todaySpent = dailySpent(expenses, todayStr());
  const budget = monthlyBudget(profile);
  const spent = monthlySpent(expenses);
  const saved = savedThisMonth(profile, expenses) + profile.currentSavings;
  const catSpend = categorySpend(expenses);
  const dailyRemaining = Math.max(0, dailyLimit - todaySpent);
  const budgetPct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const savingsPct =
    profile.savingsGoal > 0
      ? Math.min(100, (saved / profile.savingsGoal) * 100)
      : 0;
  const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];
  const totalSpent = Object.values(catSpend).reduce((s, v) => s + v, 0);
  const totalEMI = totalEMIBurden(loans);
  const totalOwed = totalOutstanding(loans);
  const { score } = healthScore(profile, expenses);

  // AI suggestion
  let aiSuggestion = "Your finances look balanced today. Keep it up! 🎯";
  if (todaySpent > dailyLimit && dailyLimit > 0) {
    aiSuggestion = `Overspent today by ${fmtFull(todaySpent - dailyLimit)}. Tomorrow's limit will adjust.`;
  } else if (balance < budget * 0.2 && budget > 0) {
    aiSuggestion = `Low balance warning! Only ${fmt(balance)} left this month.`;
  } else if (topCat && totalSpent > 0 && topCat[1] / totalSpent > 0.4) {
    aiSuggestion = `High ${topCat[0]} spending (${Math.round((topCat[1] / totalSpent) * 100)}%). Consider reducing it.`;
  } else if (savingsPct >= 80) {
    aiSuggestion = `🎉 ${Math.round(savingsPct)}% of savings goal achieved! Almost there!`;
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 animate-fade-up relative">
      {/* Header */}
      <div className="flex items-start justify-between pt-4">
        <Greeting name={userName} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate("insights")}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            style={{ background: "rgba(123,92,255,0.1)" }}
            aria-label="AI Insights"
            data-ocid="dashboard.link"
          >
            <Brain className="w-4 h-4" style={{ color: "#7B5CFF" }} />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
            data-ocid="dashboard.toggle"
          >
            <Sun className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Balance Hero Card */}
      <div
        className="p-5 rounded-2xl relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(79,166,255,0.15) 0%, rgba(123,92,255,0.2) 100%)",
          border: "1px solid rgba(123,92,255,0.25)",
          boxShadow: "0 0 40px rgba(123,92,255,0.08)",
        }}
        data-ocid="dashboard.card"
      >
        {/* Subtle gradient orbs */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
          style={{
            background: "#7B5CFF",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-15 blur-2xl pointer-events-none"
          style={{
            background: "#2EE59D",
            transform: "translate(-20%, 20%)",
          }}
        />

        <div className="relative">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            Available Balance
          </p>
          <p className="text-4xl font-extrabold text-foreground tracking-tight">
            {fmtFull(balance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {fmtFull(spent)} spent of {fmtFull(budget)} budget
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Income", value: fmt(profile.monthlyIncome) },
              { label: "Fixed", value: fmt(profile.fixedExpenses) },
              { label: "Saved", value: fmt(saved) },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-2.5 text-center"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <p className="text-[10px] text-muted-foreground mb-0.5">
                  {s.label}
                </p>
                <p className="text-xs font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary row: Today & Remaining */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Spent */}
        <div
          className={`glass-card p-4 ${
            todaySpent > dailyLimit && dailyLimit > 0
              ? "border-red-500/30"
              : "border-primary/20"
          }`}
          data-ocid="dashboard.panel"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Zap
              className="w-3.5 h-3.5"
              style={{
                color:
                  todaySpent > dailyLimit && dailyLimit > 0
                    ? "#EF4444"
                    : "#4FA6FF",
              }}
            />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Today Spent
            </p>
          </div>
          <p
            className="text-xl font-extrabold"
            style={{
              color:
                todaySpent > dailyLimit && dailyLimit > 0
                  ? "#EF4444"
                  : undefined,
            }}
          >
            <span className={todaySpent > dailyLimit ? "" : "text-foreground"}>
              {fmtFull(todaySpent)}
            </span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            of {fmtFull(dailyLimit)} limit
          </p>
          <div className="mt-2 h-1 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, dailyLimit > 0 ? (todaySpent / dailyLimit) * 100 : 0)}%`,
                background:
                  todaySpent > dailyLimit && dailyLimit > 0
                    ? "#EF4444"
                    : "#4FA6FF",
              }}
            />
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="glass-card p-4" data-ocid="dashboard.panel">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "#2EE59D" }} />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Remaining
            </p>
          </div>
          <p className="text-xl font-extrabold text-foreground">
            {fmtFull(dailyRemaining)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">today</p>
          <div className="mt-2 h-1 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, dailyLimit > 0 ? (dailyRemaining / dailyLimit) * 100 : 0)}%`,
                background: "#2EE59D",
              }}
            />
          </div>
        </div>
      </div>

      {/* AI Suggestion Card */}
      <div
        className="p-4 rounded-2xl flex gap-3 items-start"
        style={{
          background: "rgba(123,92,255,0.08)",
          border: "1px solid rgba(123,92,255,0.2)",
        }}
        data-ocid="dashboard.panel"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
          }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "#7B5CFF" }}
          >
            AI Suggestion
          </p>
          <p className="text-sm text-foreground mt-0.5 leading-relaxed">
            {aiSuggestion}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("insights")}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{
            background: "rgba(123,92,255,0.15)",
            color: "#7B5CFF",
          }}
          data-ocid="dashboard.link"
        >
          More
        </button>
      </div>

      {/* Donut chart */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-foreground">
            Expense Breakdown
          </p>
          <p className="text-xs text-muted-foreground">This Month</p>
        </div>
        <DonutChart catSpend={catSpend} />
      </div>

      {/* Loan Burden Card */}
      {totalEMI > 0 && (
        <div
          className="glass-card p-4"
          style={{
            border: "1px solid rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.04)",
          }}
        >
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            💳 Loan Burden
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total EMI/month</p>
              <p className="text-xl font-extrabold text-red-500">
                {fmtFull(totalEMI)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Outstanding</p>
              <p className="text-xl font-extrabold text-foreground">
                {fmt(totalOwed)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-extrabold text-foreground">
                {loans.filter((l) => l.tenureMonths - l.paidMonths > 0).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress bars */}
      <div className="glass-card p-5 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-foreground">
              Monthly Budget
            </span>
            <span
              className="text-xs font-bold"
              style={{
                color: budgetPct > 85 ? "#EF4444" : "#4FA6FF",
              }}
            >
              {Math.round(budgetPct)}%
            </span>
          </div>
          <Progress value={budgetPct} className="h-2.5" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
            <span>{fmtFull(spent)} spent</span>
            <span>{fmtFull(budget)} total</span>
          </div>
        </div>
        <div className="w-full h-px bg-border/40" />
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-foreground">
              Savings Progress
            </span>
            <span className="text-xs font-bold" style={{ color: "#2EE59D" }}>
              {Math.round(savingsPct)}%
            </span>
          </div>
          <Progress value={savingsPct} className="h-2.5" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
            <span>{fmtFull(saved)} saved</span>
            <span>{fmtFull(profile.savingsGoal)} goal</span>
          </div>
        </div>
      </div>

      {/* Health score quick view */}
      <button
        type="button"
        onClick={() => onNavigate("insights")}
        className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98] text-left"
        style={{
          background:
            "linear-gradient(135deg, rgba(79,166,255,0.1) 0%, rgba(123,92,255,0.1) 100%)",
          border: "1px solid rgba(123,92,255,0.15)",
        }}
        data-ocid="dashboard.link"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
            boxShadow: "0 4px 16px rgba(123,92,255,0.3)",
          }}
        >
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            Financial Health Score
          </p>
          <p className="text-xs text-muted-foreground">
            Tap to see AI insights
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-2xl font-extrabold"
            style={{
              background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {score}
          </p>
          <p className="text-[10px] text-muted-foreground">/100</p>
        </div>
      </button>

      {/* Alerts */}
      {(() => {
        const alerts: { icon: React.ReactNode; text: string; color: string }[] =
          [];
        if (todaySpent > dailyLimit && dailyLimit > 0) {
          alerts.push({
            icon: <AlertTriangle className="w-4 h-4" />,
            text: `Overspending! Exceeded today's limit by ${fmtFull(todaySpent - dailyLimit)}`,
            color:
              "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40",
          });
        }
        if (balance < budget * 0.2 && budget > 0) {
          alerts.push({
            icon: <TrendingDown className="w-4 h-4" />,
            text: `Low balance! Only ${fmt(balance)} left this month`,
            color:
              "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40",
          });
        }
        if (!alerts.length) return null;
        return (
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: positional alerts
                key={i}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-sm ${a.color}`}
                data-ocid={`dashboard.item.${i + 1}`}
              >
                {a.icon}
                <span>{a.text}</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Floating FAB */}
      <button
        type="button"
        onClick={onAddExpense}
        className="fixed flex items-center justify-center text-white rounded-full shadow-2xl transition-all active:scale-90 z-40"
        style={{
          bottom: 80,
          right: "calc(50% - 210px + 16px)",
          width: 52,
          height: 52,
          background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
          boxShadow: "0 6px 24px rgba(123,92,255,0.5)",
        }}
        aria-label="Add expense"
        data-ocid="dashboard.primary_button"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
