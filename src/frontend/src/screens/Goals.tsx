import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Check, Edit3, Target, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import {
  dailySavingsNeeded,
  fmt,
  fmtFull,
  monthlyBudget,
  savedThisMonth,
} from "../lib/engine";
import type { Expense, UserProfile } from "../types";

interface Props {
  profile: UserProfile;
  expenses: Expense[];
  onUpdateProfile: (p: UserProfile) => void;
}

export default function GoalsScreen({
  profile,
  expenses,
  onUpdateProfile,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [goalName, setGoalName] = useState(profile.goalName);
  const [goalAmount, setGoalAmount] = useState(String(profile.savingsGoal));
  const [currentSavings, setCurrentSavings] = useState(
    String(profile.currentSavings),
  );
  const [err, setErr] = useState("");

  const savedMonth = savedThisMonth(profile, expenses);
  const totalSaved = profile.currentSavings + savedMonth;
  const pct =
    profile.savingsGoal > 0
      ? Math.min(100, (totalSaved / profile.savingsGoal) * 100)
      : 0;
  const stillNeeded = Math.max(0, profile.savingsGoal - totalSaved);
  const dailyNeeded = dailySavingsNeeded(profile, expenses);
  const monthlyNeeded = Math.max(0, profile.savingsGoal - totalSaved) / 12;
  const budget = monthlyBudget(profile);
  const savingsRate =
    profile.monthlyIncome > 0
      ? Math.round((profile.savingsGoal / profile.monthlyIncome) * 100)
      : 0;

  function saveEdit() {
    setErr("");
    const amt = Number(goalAmount);
    const cur = Number(currentSavings);
    if (!amt || amt <= 0) {
      setErr("Enter valid goal amount");
      return;
    }
    if (cur < 0) {
      setErr("Current savings can't be negative");
      return;
    }
    onUpdateProfile({
      ...profile,
      goalName: goalName.trim() || "My Goal",
      savingsGoal: amt,
      currentSavings: cur,
    });
    setEditing(false);
  }

  const milestones = [25, 50, 75, 100];

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Goals</h2>
          <p className="text-xs text-muted-foreground">
            Track your savings journey
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="Edit goal"
          data-ocid="goals.edit_button"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="glass-card p-5 space-y-3" data-ocid="goals.panel">
          <h3 className="font-semibold text-foreground text-sm">Edit Goal</h3>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Goal Name
            </Label>
            <Input
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="bg-muted/50 border-border/60 text-foreground h-11"
              data-ocid="goals.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Target (₹)
              </Label>
              <Input
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                className="bg-muted/50 border-border/60 text-foreground h-11"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Saved Already (₹)
              </Label>
              <Input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
                className="bg-muted/50 border-border/60 text-foreground h-11"
              />
            </div>
          </div>
          {err && (
            <p
              className="text-destructive text-xs"
              data-ocid="goals.error_state"
            >
              {err}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              onClick={saveEdit}
              className="flex-1 h-10 brand-bg text-background rounded-xl"
              data-ocid="goals.save_button"
            >
              <Check className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button
              onClick={() => setEditing(false)}
              variant="outline"
              className="flex-1 h-10 rounded-xl"
              data-ocid="goals.cancel_button"
            >
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Goal card */}
      <div className="glass-card p-5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background:
              "radial-gradient(circle at 20% 80%, #18C7B7, transparent 50%)",
          }}
        />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Target className="w-5 h-5 brand-text" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{profile.goalName}</h3>
            <p className="text-xs text-muted-foreground">
              Target: {fmtFull(profile.savingsGoal)}
            </p>
          </div>
        </div>

        {/* Big progress */}
        <div className="flex items-center gap-4 mb-4">
          {/* Circle */}
          <div className="relative flex-shrink-0">
            <svg
              viewBox="0 0 80 80"
              className="w-20 h-20"
              role="img"
              aria-label={`${Math.round(pct)}% of goal achieved`}
            >
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-muted/50"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="#18C7B7"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
                transform="rotate(-90 40 40)"
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold brand-text">
                {Math.round(pct)}%
              </span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">
              {fmtFull(totalSaved)}
            </p>
            <p className="text-xs text-muted-foreground">
              saved of {fmtFull(profile.savingsGoal)}
            </p>
            <Progress value={pct} className="mt-2 h-2" />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Saved So Far",
            value: fmtFull(totalSaved),
            color: "brand-text",
          },
          {
            label: "Still Needed",
            value: fmtFull(stillNeeded),
            color: "text-foreground",
          },
          {
            label: "Daily Savings Needed",
            value: fmt(dailyNeeded),
            color: "text-warning",
          },
          {
            label: "Monthly Savings Needed",
            value: fmt(monthlyNeeded),
            color: "text-foreground",
          },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 brand-text" />
          <p className="font-semibold text-foreground text-sm">Milestones</p>
        </div>
        <div className="space-y-3">
          {milestones.map((m) => (
            <div key={m} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  pct >= m ? "brand-bg" : "bg-muted"
                }`}
              >
                {pct >= m ? (
                  <Check className="w-3 h-3 text-background" />
                ) : (
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs">
                  <span
                    className={
                      pct >= m
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {m}% — {fmtFull((profile.savingsGoal * m) / 100)}
                  </span>
                  {pct >= m && <span className="brand-text">✓ Achieved</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget insight */}
      <div className="glass-card p-4 bg-primary/5 border border-primary/20">
        <p className="text-xs text-muted-foreground mb-1">💡 Savings Insight</p>
        <p className="text-sm text-foreground">
          Your savings goal is{" "}
          <span className="brand-text font-semibold">{savingsRate}%</span> of
          your income. Your spendable budget is{" "}
          <span className="font-semibold">{fmtFull(budget)}/month</span>.
          {savingsRate >= 20
            ? " Great savings discipline! 🎉"
            : " Try to increase savings to 20%+ of income."}
        </p>
      </div>
    </div>
  );
}
