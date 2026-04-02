import { BarChart3, Lightbulb, Shield, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { fmt, healthScore, monthlyBudget, monthlySpent } from "../lib/engine";
import type { Expense, UserProfile } from "../types";

interface Props {
  profile: UserProfile;
  expenses: Expense[];
}

function ScoreGauge({ score }: { score: number }) {
  const norm = 65;
  const circumference = Math.PI * norm;
  const offset = circumference * (1 - score / 100);

  const color = score >= 70 ? "#18C7B7" : score >= 40 ? "#F5A623" : "#E74C3C";
  const label =
    score >= 70 ? "Excellent" : score >= 40 ? "Needs Work" : "Critical";
  const emoji = score >= 70 ? "🌟" : score >= 40 ? "📈" : "⚠️";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 160, height: 95 }}>
        <svg
          viewBox="0 0 160 95"
          className="w-full h-full"
          role="img"
          aria-label={`Financial health score: ${score} out of 100`}
        >
          <defs>
            <filter id="score-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 15 80 A 65 65 0 0 1 145 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            className="text-muted/50"
          />
          <path
            d="M 15 80 A 65 65 0 0 1 145 80"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${offset}`}
            filter="url(#score-glow)"
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
          <text
            x="80"
            y="72"
            textAnchor="middle"
            fontSize="28"
            fontWeight="bold"
            fill={color}
            fontFamily="Plus Jakarta Sans"
          >
            {score}
          </text>
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1">
          <span className="text-xs font-semibold" style={{ color }}>
            {emoji} {label}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">out of 100</p>
    </div>
  );
}

const TIPS_BY_SCORE: Record<string, string[]> = {
  high: [
    "🎉 Amazing! You're saving more than 20% of your income.",
    "📈 Keep building your emergency fund (3-6 months of expenses).",
    "💼 Consider investing surplus savings in mutual funds or FDs.",
    "🎯 Set stretch savings goals to keep growing your wealth.",
  ],
  mid: [
    "⚡ Try to cut one unnecessary subscription this month.",
    "🍱 Meal prep 2 days a week to reduce food spending.",
    "📊 Review your top spending category and set a cap.",
    "💡 Automate your savings on salary day to save first, spend later.",
    "🎯 Track daily spending to stay within your limit.",
  ],
  low: [
    "🚨 Your spending is exceeding your income — take immediate action.",
    "✂️ Cut all non-essential expenses for the next 30 days.",
    "💳 Avoid credit card debt — pay full balance monthly.",
    "📋 List every expense and mark it as 'need' or 'want'.",
    "🤝 Consider a side income to increase your cash flow.",
    "📱 Use the AI Chat to check before every spending decision.",
  ],
};

const BREAKDOWN_ITEMS = [
  {
    label: "Savings Rate",
    icon: <TrendingUp className="w-4 h-4" />,
    desc: "% of income saved",
    weight: "40%",
    key: "savingsRate" as const,
  },
  {
    label: "Budget Discipline",
    icon: <Shield className="w-4 h-4" />,
    desc: "Days within daily limit",
    weight: "35%",
    key: "budgetDiscipline" as const,
  },
  {
    label: "Consistency",
    icon: <BarChart3 className="w-4 h-4" />,
    desc: "Stable spending pattern",
    weight: "25%",
    key: "consistency" as const,
  },
];

export default function ScoreScreen({ profile, expenses }: Props) {
  const scoreData = useMemo(
    () => healthScore(profile, expenses),
    [profile, expenses],
  );
  const { score, savingsRate, budgetDiscipline, consistency } = scoreData;

  const tips =
    score >= 70
      ? TIPS_BY_SCORE.high
      : score >= 40
        ? TIPS_BY_SCORE.mid
        : TIPS_BY_SCORE.low;
  const budget = monthlyBudget(profile);
  const spent = monthlySpent(expenses);
  const budgetUsed = budget > 0 ? Math.round((spent / budget) * 100) : 0;

  const values: Record<string, number> = {
    savingsRate,
    budgetDiscipline,
    consistency,
  };

  function barColor(v: number) {
    if (v >= 70) return "brand-bg";
    if (v >= 40) return "bg-warning";
    return "bg-destructive";
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 animate-fade-up">
      <div className="pt-4">
        <h2 className="text-lg font-bold text-foreground">Financial Health</h2>
        <p className="text-xs text-muted-foreground">
          Your money management score
        </p>
      </div>

      {/* Score Card */}
      <div
        className="glass-card p-6 flex flex-col items-center"
        data-ocid="score.card"
      >
        <ScoreGauge score={score} />
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Budget used:{" "}
            <span className="font-semibold text-foreground">{budgetUsed}%</span>{" "}
            this month
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Spendable: {fmt(budget - spent > 0 ? budget - spent : 0)} remaining
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="glass-card p-5 space-y-4" data-ocid="score.panel">
        <p className="font-semibold text-foreground text-sm">Score Breakdown</p>
        {BREAKDOWN_ITEMS.map((item, i) => (
          <div key={item.key} data-ocid={`score.item.${i + 1}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="brand-text">{item.icon}</span>
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
                <span className="text-xs text-muted-foreground/60">
                  ({item.weight})
                </span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {values[item.key]}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${barColor(values[item.key])}`}
                style={{
                  width: `${values[item.key]}%`,
                  transitionDelay: `${i * 150}ms`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 brand-text" />
          <p className="font-semibold text-foreground text-sm">
            Personalized Tips
          </p>
        </div>
        <div className="space-y-2.5">
          {tips.map((tip, i) => (
            <div
              key={tip}
              className="flex items-start gap-2 text-sm text-foreground/90 leading-relaxed"
              data-ocid={`score.item.${i + 4}`}
            >
              <span className="mt-0.5 flex-shrink-0 text-base leading-none">
                {tip.slice(0, 2)}
              </span>
              <span>{tip.slice(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How score is calculated */}
      <div className="glass-card p-4 bg-primary/5 border border-primary/20">
        <p className="text-xs text-muted-foreground mb-1.5">
          ℹ️ How it's calculated
        </p>
        <p className="text-xs text-foreground/80 leading-relaxed">
          Your score combines <strong>savings rate</strong> (40%),{" "}
          <strong>budget discipline</strong> (35%), and{" "}
          <strong>spending consistency</strong> (25%). Add more expenses over
          time for a more accurate score.
        </p>
      </div>
    </div>
  );
}
