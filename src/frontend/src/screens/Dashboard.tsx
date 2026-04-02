import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Plus,
  ShoppingBag,
  Sun,
  TrendingDown,
  Zap,
} from "lucide-react";
import {
  adjustedDailyLimit,
  availableBalance,
  categorySpend,
  dailySpent,
  fmt,
  fmtFull,
  monthlyBudget,
  monthlySpent,
  savedThisMonth,
  todayStr,
} from "../lib/engine";
import type { Expense, UserProfile } from "../types";

interface Props {
  profile: UserProfile;
  expenses: Expense[];
  onAddExpense: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

function Greeting() {
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
      <p className="text-muted-foreground text-sm">{greeting} 👋</p>
      <p className="text-xs text-muted-foreground/70 mt-0.5">{date}</p>
    </div>
  );
}

export default function Dashboard({
  profile,
  expenses,
  onAddExpense,
  onToggleTheme,
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

  const alerts: { icon: React.ReactNode; text: string; color: string }[] = [];
  if (todaySpent > dailyLimit && dailyLimit > 0) {
    alerts.push({
      icon: <AlertTriangle className="w-4 h-4" />,
      text: `Overspending alert! You've exceeded today's limit by ${fmtFull(todaySpent - dailyLimit)}`,
      color: "text-destructive bg-destructive/10 border-destructive/20",
    });
  }
  if (balance < budget * 0.2 && budget > 0) {
    alerts.push({
      icon: <TrendingDown className="w-4 h-4" />,
      text: `Low balance warning! Only ${fmt(balance)} left this month`,
      color: "text-warning bg-warning/10 border-warning/20",
    });
  }
  if (topCat && totalSpent > 0 && topCat[1] / totalSpent > 0.4) {
    alerts.push({
      icon: <ShoppingBag className="w-4 h-4" />,
      text: `High spending in ${topCat[0]}: ${fmt(topCat[1])} (${Math.round((topCat[1] / totalSpent) * 100)}% of total)`,
      color: "text-warning bg-warning/10 border-warning/20",
    });
  }

  // Sparkline: last 7 days daily spend
  const last7: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const ds = d.toISOString().slice(0, 10);
    last7.push(dailySpent(expenses, ds));
  }
  const maxVal = Math.max(...last7, dailyLimit, 1);

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between pt-4">
        <Greeting />
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

      {/* Balance Card */}
      <div
        className="glass-card p-5 relative overflow-hidden"
        data-ocid="dashboard.card"
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, #18C7B7, transparent 60%)",
          }}
        />
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          Available Balance
        </p>
        <p className="text-4xl font-bold text-foreground tracking-tight">
          {fmtFull(balance)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {fmtFull(spent)} spent of {fmtFull(budget)} budget
        </p>
        <div className="mt-4 flex gap-3">
          <div className="flex-1 bg-muted/40 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Income</p>
            <p className="font-semibold text-foreground text-sm">
              {fmt(profile.monthlyIncome)}
            </p>
          </div>
          <div className="flex-1 bg-muted/40 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Fixed</p>
            <p className="font-semibold text-foreground text-sm">
              {fmt(profile.fixedExpenses)}
            </p>
          </div>
          <div className="flex-1 bg-muted/40 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Savings</p>
            <p className="font-semibold text-foreground text-sm">
              {fmt(profile.savingsGoal)}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Limit Card */}
      <div
        className="glass-card p-5 border border-primary/20"
        data-ocid="dashboard.panel"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Zap className="w-4 h-4 brand-text" />
            </div>
            <p className="font-semibold text-foreground text-sm">
              Today's Limit
            </p>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              todaySpent > dailyLimit
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/15 brand-text"
            }`}
          >
            {todaySpent > dailyLimit
              ? "Over limit"
              : `${fmtFull(dailyRemaining)} left`}
          </span>
        </div>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold brand-text">{fmtFull(dailyLimit)}</p>
          <p className="text-muted-foreground text-sm pb-1">/day</p>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Spent today: {fmtFull(todaySpent)}</span>
            <span>
              {dailyLimit > 0 ? Math.round((todaySpent / dailyLimit) * 100) : 0}
              %
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                todaySpent > dailyLimit ? "bg-destructive" : "brand-bg"
              }`}
              style={{
                width: `${Math.min(100, dailyLimit > 0 ? (todaySpent / dailyLimit) * 100 : 0)}%`,
              }}
            />
          </div>
        </div>

        {/* Sparkline */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Last 7 days</p>
          <svg
            viewBox="0 0 200 40"
            className="w-full h-10"
            preserveAspectRatio="none"
            role="img"
            aria-label="Daily spending last 7 days"
          >
            <defs>
              <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#18C7B7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#18C7B7" stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const pts = last7.map((v, i) => ({
                x: (i / 6) * 198 + 1,
                y: 38 - (v / maxVal) * 36,
              }));
              const path = pts
                .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                .join(" ");
              const area = `${path} L ${pts[pts.length - 1].x} 40 L ${pts[0].x} 40 Z`;
              return (
                <>
                  <path d={area} fill="url(#spark-grad)" />
                  <path
                    d={path}
                    fill="none"
                    stroke="#18C7B7"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="0"
                    y1={38 - (dailyLimit / maxVal) * 36}
                    x2="200"
                    y2={38 - (dailyLimit / maxVal) * 36}
                    stroke="#18C7B7"
                    strokeWidth="0.5"
                    strokeDasharray="3 3"
                    opacity="0.5"
                  />
                </>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Progress bars */}
      <div className="glass-card p-5 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-foreground">Monthly Budget</span>
            <span className="text-muted-foreground">
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
            <span className="font-medium text-foreground">
              Savings Progress
            </span>
            <span className="brand-text font-medium">
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

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2" data-ocid="dashboard.panel">
          {alerts.map((a, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: alerts are positional
              key={i}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-sm ${a.color}`}
              data-ocid={`dashboard.item.${i + 1}`}
            >
              {a.icon}
              <span>{a.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Category chips */}
      {Object.keys(catSpend).length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            This Month
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(catSpend)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amt]) => (
                <span
                  key={cat}
                  className="px-3 py-1.5 rounded-full bg-muted/60 text-xs font-medium text-foreground border border-border/50"
                >
                  {cat}: {fmt(amt)}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Quick add */}
      <Button
        onClick={onAddExpense}
        className="w-full h-12 brand-bg text-background font-semibold rounded-xl hover:opacity-90 transition-opacity glow-brand"
        data-ocid="dashboard.primary_button"
      >
        <Plus className="w-4 h-4 mr-2" /> Add Expense
      </Button>
    </div>
  );
}
