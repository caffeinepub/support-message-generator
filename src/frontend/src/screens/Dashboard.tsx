import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Brain,
  Eye,
  EyeOff,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
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

const CATEGORY_ICONS: Record<string, string> = {
  Food: "🍔",
  Travel: "✈️",
  Shopping: "🛍️",
  Bills: "💡",
  Other: "💫",
};

// ─── useCountUp Hook ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, enabled = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled || target === 0) {
      setValue(target);
      return;
    }
    setValue(0);
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);
  return value;
}

// ─── ShimmerBlock Component ──────────────────────────────────────────────────
function ShimmerBlock({
  className,
  style,
}: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl shimmer-dark ${className || ""}`}
      style={style}
    />
  );
}

// ─── Animated Donut Chart ────────────────────────────────────────────────────
function AnimatedDonutChart({
  catSpend,
  animateNow,
}: { catSpend: Record<string, number>; animateNow: boolean }) {
  const [animated, setAnimated] = useState(false);
  const entries = Object.entries(catSpend).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  useEffect(() => {
    if (animateNow) setAnimated(true);
  }, [animateNow]);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
        <svg
          viewBox="0 0 120 120"
          className="w-28 h-28 opacity-25"
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
          <p className="text-sm font-semibold text-muted-foreground">
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
  const r = 44;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * r;
  const gapAngle = 0.03;
  let currentOffset = 0;

  const segments = entries.map(([cat, val]) => {
    const pct = val / total;
    const dash = pct * circumference - gapAngle * circumference;
    const gap = circumference - dash;
    const rotation = (currentOffset / circumference) * 360 - 90;
    currentOffset += pct * circumference;
    return {
      cat,
      val,
      pct: Math.round(pct * 100),
      dash,
      gap,
      rotation,
      color: CATEGORY_COLORS[cat] || "#94A3B8",
    };
  });

  return (
    <div className="flex items-center gap-5">
      {/* SVG donut */}
      <div className="relative flex-shrink-0">
        <svg
          viewBox="0 0 120 120"
          className="w-32 h-32"
          role="img"
          aria-label="Category spending breakdown"
        >
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border/30"
          />
          {/* Segments */}
          {segments.map((seg) => (
            <circle
              key={seg.cat}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${animated ? seg.dash : 0} ${circumference}`}
              strokeDashoffset={0}
              style={{
                transform: `rotate(${seg.rotation}deg)`,
                transformOrigin: "60px 60px",
                transition: animated
                  ? "stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                  : "none",
                transitionDelay: animated
                  ? `${segments.indexOf(seg) * 0.12}s`
                  : "0s",
              }}
            />
          ))}
        </svg>
        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
            Total
          </p>
          <p className="text-sm font-extrabold text-foreground">{fmt(total)}</p>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {segments.map((seg) => (
          <div key={seg.cat} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: seg.color }}
            />
            <span className="text-xs text-muted-foreground flex-1 truncate">
              {seg.cat}
            </span>
            <span className="text-xs font-bold text-foreground">
              {seg.pct}%
            </span>
            <span className="text-[10px] text-muted-foreground ml-1">
              {fmt(seg.val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Animated Weekly Bar Chart ───────────────────────────────────────────────
function WeeklyBarChart({
  expenses,
  animateNow,
}: { expenses: Expense[]; animateNow: boolean }) {
  const [barsVisible, setBarsVisible] = useState(false);
  const today = new Date();
  const todayKey = todayStr();

  useEffect(() => {
    if (animateNow) {
      const t = setTimeout(() => setBarsVisible(true), 150);
      return () => clearTimeout(t);
    }
  }, [animateNow]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 6 + i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const amount = expenses
      .filter((e) => e.date === key)
      .reduce((s, e) => s + e.amount, 0);
    return { key, label, amount, isToday: key === todayKey };
  });

  const maxAmount = Math.max(...days.map((d) => d.amount), 1);
  const hasData = days.some((d) => d.amount > 0);

  return (
    <div>
      {/* Bars */}
      <div className="flex items-end justify-between gap-1 h-24">
        {days.map((day, idx) => {
          const heightPct = day.amount > 0 ? (day.amount / maxAmount) * 100 : 0;
          const actualHeight = barsVisible
            ? Math.max(heightPct, day.amount > 0 ? 8 : 4)
            : 4;
          return (
            <div
              key={day.key}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <div
                className="w-full relative flex items-end justify-center"
                style={{ height: "100%" }}
              >
                <div
                  className="w-full rounded-t-lg relative overflow-hidden"
                  style={{
                    height: `${actualHeight}%`,
                    minHeight: 3,
                    transition: "height 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    transitionDelay: `${idx * 0.07}s`,
                    background: day.isToday
                      ? "linear-gradient(180deg, #4FA6FF 0%, #7B5CFF 100%)"
                      : day.amount > 0
                        ? "rgba(123, 92, 255, 0.35)"
                        : "rgba(148, 163, 184, 0.15)",
                    boxShadow: day.isToday
                      ? "0 0 12px rgba(79,166,255,0.4)"
                      : "none",
                  }}
                >
                  {day.isToday && (
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        background:
                          "linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.3) 100%)",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {days.map((day) => (
          <div key={day.key} className="flex-1 text-center">
            <span
              className="text-[10px] font-semibold"
              style={{
                color: day.isToday ? "#4FA6FF" : undefined,
                opacity: day.isToday ? 1 : 0.5,
              }}
            >
              {day.label}
            </span>
          </div>
        ))}
      </div>
      {!hasData && (
        <p className="text-center text-xs text-muted-foreground/50 mt-2">
          No spending data yet
        </p>
      )}
    </div>
  );
}

// ─── Greeting ────────────────────────────────────────────────────────────────
function Greeting({ name }: { name?: string }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const date = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const firstName = name ? name.split(" ")[0] : "";
  return (
    <div>
      <p className="text-lg font-bold text-foreground">
        {greeting}
        {firstName ? `, ${firstName}` : ""} 👋
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: React.ReactNode;
  gradient: string;
  delay?: number;
  animationDelay?: number;
}
function StatCard({
  icon,
  label,
  value,
  sub,
  gradient,
  delay = 0,
  animationDelay,
}: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-4 flex-shrink-0 w-[160px] hover:scale-[1.02] transition-transform cursor-default select-none animate-slide-up-card"
      style={{
        background: gradient,
        boxShadow:
          "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
        animationDelay: `${animationDelay ?? delay}ms`,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: "rgba(255,255,255,0.2)" }}
      >
        {icon}
      </div>
      <p className="text-[10px] font-semibold text-white/70 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-xl font-extrabold text-white leading-tight">{value}</p>
      {sub && <div className="mt-2">{sub}</div>}
    </div>
  );
}

// ─── Main Props ──────────────────────────────────────────────────────────────
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
  theme,
  onToggleTheme,
  onNavigate,
}: Props) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [countUpEnabled, setCountUpEnabled] = useState(false);

  useEffect(() => {
    const shimmerTimer = setTimeout(() => {
      setIsLoading(false);
      // Start count-up slightly after shimmer dissolves
      setTimeout(() => setCountUpEnabled(true), 100);
    }, 1000);
    return () => clearTimeout(shimmerTimer);
  }, []);

  // Derived values
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

  // Animated count-up values
  const animatedBalance = useCountUp(balance, 1200, countUpEnabled);
  const animatedSpent = useCountUp(spent, 1000, countUpEnabled);
  const animatedSaved = useCountUp(saved, 1000, countUpEnabled);
  const animatedIncome = useCountUp(profile.monthlyIncome, 900, countUpEnabled);
  const animatedFixed = useCountUp(profile.fixedExpenses, 900, countUpEnabled);

  // Recent transactions
  const recentExpenses = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

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

  const hiddenBalance = "₹ ••••••";

  return (
    <div className="flex flex-col gap-4 px-4 pb-28 relative">
      {/* ── TOP HEADER ── */}
      <div
        className="flex items-start justify-between pt-5 animate-fade-up"
        style={{ animationDelay: "0ms" }}
      >
        <Greeting name={userName} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate("insights")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:opacity-80"
            style={{ background: "rgba(123,92,255,0.12)" }}
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
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* ── HERO BALANCE CARD ── */}
      <div
        className="p-5 rounded-2xl relative overflow-hidden animate-fade-up"
        style={{
          background:
            "linear-gradient(135deg, #1a3a6e 0%, #2d1b6e 50%, #1a2d5a 100%)",
          boxShadow:
            "0 8px 40px rgba(79,100,255,0.35), 0 0 0 1px rgba(123,92,255,0.2)",
          animationDelay: "60ms",
        }}
        data-ocid="dashboard.card"
      >
        {/* Glow orbs */}
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(79,166,255,0.25) 0%, transparent 70%)",
            transform: "translate(20%, -20%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-36 h-36 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(46,229,157,0.18) 0%, transparent 70%)",
            transform: "translate(-15%, 25%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(123,92,255,0.15) 0%, transparent 70%)",
            transform: "translate(-50%, -50%)",
          }}
        />

        <div className="relative">
          {/* Balance label + eye toggle */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-semibold text-white/60 uppercase tracking-widest">
              Total Balance
            </p>
            <button
              type="button"
              onClick={() => setBalanceVisible((v) => !v)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.12)" }}
              aria-label={balanceVisible ? "Hide balance" : "Show balance"}
              data-ocid="dashboard.toggle"
            >
              {balanceVisible ? (
                <Eye className="w-3.5 h-3.5 text-white/70" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-white/70" />
              )}
            </button>
          </div>

          {/* Balance content — shimmer or real */}
          {isLoading ? (
            <div className="space-y-3 mt-2">
              <ShimmerBlock className="h-10 w-48" />
              <ShimmerBlock className="h-3 w-36" />
              <div className="grid grid-cols-3 gap-2 mt-4">
                <ShimmerBlock className="h-14" />
                <ShimmerBlock className="h-14" />
                <ShimmerBlock className="h-14" />
              </div>
            </div>
          ) : (
            <>
              {/* Balance */}
              <p
                className="text-4xl font-extrabold text-white tracking-tight leading-tight select-none"
                style={{
                  letterSpacing: "-0.02em",
                  filter: balanceVisible ? "none" : "blur(0px)",
                }}
              >
                {balanceVisible ? fmtFull(animatedBalance) : hiddenBalance}
              </p>
              <p className="text-xs text-white/50 mt-1">
                {balanceVisible
                  ? `${fmtFull(animatedSpent)} spent of ${fmtFull(budget)} budget`
                  : "Tap eye to reveal"}
              </p>

              {/* Mini pill cards */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Income",
                    value: balanceVisible ? fmt(animatedIncome) : "₹ •••",
                  },
                  {
                    label: "Fixed",
                    value: balanceVisible ? fmt(animatedFixed) : "₹ •••",
                  },
                  {
                    label: "Saved",
                    value: balanceVisible ? fmt(animatedSaved) : "₹ •••",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl p-2.5 text-center"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <p className="text-[10px] text-white/50 mb-0.5">
                      {s.label}
                    </p>
                    <p className="text-xs font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── 3 STAT CARDS (horizontal scroll) ── */}
      <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
        {isLoading ? (
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
            {[0, 1, 2].map((i) => (
              <ShimmerBlock
                key={i}
                className="rounded-2xl flex-shrink-0 w-[160px] h-[120px]"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
            {/* Card 1: Monthly Spending */}
            <StatCard
              icon={<TrendingDown className="w-5 h-5 text-white" />}
              label="Monthly Spending"
              value={fmt(animatedSpent)}
              sub={
                <p className="text-[10px] text-white/60">
                  of {fmt(budget)} budget
                </p>
              }
              gradient="linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)"
              animationDelay={0}
            />
            {/* Card 2: Budget Left */}
            <StatCard
              icon={<Wallet className="w-5 h-5 text-white" />}
              label="Budget Left"
              value={fmt(animatedBalance)}
              sub={
                <div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, budgetPct)}%`,
                        background: "rgba(255,255,255,0.8)",
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-white/60 mt-1">
                    {Math.round(budgetPct)}% used
                  </p>
                </div>
              }
              gradient="linear-gradient(135deg, #4FA6FF 0%, #2E86AB 100%)"
              animationDelay={80}
            />
            {/* Card 3: Savings */}
            <StatCard
              icon={<Target className="w-5 h-5 text-white" />}
              label="Savings"
              value={fmt(animatedSaved)}
              sub={
                <p className="text-[10px] text-white/60">
                  {Math.round(savingsPct)}% of goal
                </p>
              }
              gradient="linear-gradient(135deg, #2EE59D 0%, #0BA360 100%)"
              animationDelay={160}
            />
          </div>
        )}
      </div>

      {/* ── TODAY'S STATUS ROW ── */}
      <div
        className="grid grid-cols-2 gap-3 animate-fade-up"
        style={{ animationDelay: "180ms" }}
      >
        {/* Today Spent */}
        <div
          className="glass-card p-4"
          style={{
            borderColor:
              todaySpent > dailyLimit && dailyLimit > 0
                ? "rgba(239,68,68,0.3)"
                : undefined,
          }}
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
              Today
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

        {/* Remaining */}
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

      {/* ── AI SUGGESTION CARD ── */}
      <div
        className="p-4 rounded-2xl flex gap-3 items-start animate-fade-up"
        style={{
          background: "rgba(123,92,255,0.08)",
          border: "1px solid rgba(123,92,255,0.2)",
          animationDelay: "220ms",
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
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 transition-opacity hover:opacity-80"
          style={{ background: "rgba(123,92,255,0.15)", color: "#7B5CFF" }}
          data-ocid="dashboard.link"
        >
          More
        </button>
      </div>

      {/* ── CHARTS SECTION ── */}
      {/* Spending by Category — Animated Donut */}
      <div
        className="glass-card p-5 animate-fade-up"
        style={{ animationDelay: "280ms" }}
        data-ocid="dashboard.panel"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-foreground">
            Spending by Category
          </p>
          <p className="text-xs text-muted-foreground">This Month</p>
        </div>
        {isLoading ? (
          <ShimmerBlock className="h-[180px]" />
        ) : (
          <AnimatedDonutChart catSpend={catSpend} animateNow={countUpEnabled} />
        )}
      </div>

      {/* Weekly Bar Chart */}
      <div
        className="glass-card p-5 animate-fade-up"
        style={{ animationDelay: "340ms" }}
        data-ocid="dashboard.panel"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-foreground">This Week</p>
          <p className="text-xs text-muted-foreground">Daily Spending</p>
        </div>
        {isLoading ? (
          <ShimmerBlock className="h-[140px]" />
        ) : (
          <WeeklyBarChart expenses={expenses} animateNow={countUpEnabled} />
        )}
      </div>

      {/* ── RECENT TRANSACTIONS ── */}
      <div
        className="glass-card p-5 animate-fade-up"
        style={{ animationDelay: "400ms" }}
        data-ocid="dashboard.panel"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-foreground">
            Recent Transactions
          </p>
          <button
            type="button"
            onClick={() => onNavigate("expenses")}
            className="text-[11px] font-semibold px-3 py-1 rounded-full transition-opacity hover:opacity-75"
            style={{ background: "rgba(79,166,255,0.12)", color: "#4FA6FF" }}
            data-ocid="dashboard.link"
          >
            View All
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-6" data-ocid="dashboard.empty_state">
            <p className="text-2xl mb-2">💸</p>
            <p className="text-sm font-medium text-muted-foreground">
              No transactions yet.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Tap + to add your first expense.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense, idx) => {
              const color = CATEGORY_COLORS[expense.category] || "#94A3B8";
              const icon = CATEGORY_ICONS[expense.category] || "💫";
              const dateLabel = new Date(
                `${expense.date}T00:00:00`,
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              });
              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3"
                  data-ocid={`dashboard.item.${idx + 1}`}
                >
                  {/* Category icon pill */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                    style={{
                      background: `${color}22`,
                      border: `1px solid ${color}44`,
                    }}
                  >
                    {icon}
                  </div>
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {expense.note || expense.category}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {dateLabel}
                    </p>
                  </div>
                  {/* Amount */}
                  <p
                    className="text-sm font-bold flex-shrink-0"
                    style={{ color: "#EF4444" }}
                  >
                    −{fmtFull(expense.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── BUDGET + SAVINGS PROGRESS ── */}
      <div
        className="glass-card p-5 space-y-4 animate-fade-up"
        style={{ animationDelay: "460ms" }}
      >
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-foreground">
              Monthly Budget
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: budgetPct > 85 ? "#EF4444" : "#4FA6FF" }}
            >
              {Math.round(budgetPct)}%
            </span>
          </div>
          <Progress value={budgetPct} className="h-2.5" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
            <span>{fmtFull(animatedSpent)} spent</span>
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
            <span>{fmtFull(animatedSaved)} saved</span>
            <span>{fmtFull(profile.savingsGoal)} goal</span>
          </div>
        </div>
      </div>

      {/* ── LOAN BURDEN ── */}
      {totalEMI > 0 && (
        <div
          className="glass-card p-4 animate-fade-up"
          style={{
            border: "1px solid rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.04)",
            animationDelay: "500ms",
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
              <p className="text-xs text-muted-foreground">Outstanding</p>
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

      {/* ── HEALTH SCORE CARD ── */}
      <button
        type="button"
        onClick={() => onNavigate("insights")}
        className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98] text-left animate-fade-up hover:opacity-90"
        style={{
          background:
            "linear-gradient(135deg, rgba(79,166,255,0.1) 0%, rgba(123,92,255,0.1) 100%)",
          border: "1px solid rgba(123,92,255,0.15)",
          animationDelay: "540ms",
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

      {/* ── SMART ALERTS ── */}
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
          <div
            className="space-y-2 animate-fade-up"
            style={{ animationDelay: "580ms" }}
          >
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

      {/* ── FLOATING FAB ── */}
      <button
        type="button"
        onClick={onAddExpense}
        className="fixed flex items-center justify-center text-white rounded-full shadow-2xl transition-all active:scale-90 z-40"
        style={{
          bottom: 80,
          right: "calc(50% - 210px + 16px)",
          width: 54,
          height: 54,
          background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
          boxShadow:
            "0 6px 28px rgba(123,92,255,0.55), 0 0 0 3px rgba(123,92,255,0.15)",
        }}
        aria-label="Add expense"
        data-ocid="dashboard.primary_button"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
