import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Target, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import { fmtFull } from "../lib/engine";
import type { UserProfile } from "../types";

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const STEPS = [
  {
    id: 1,
    icon: Wallet,
    title: "Monthly Income",
    subtitle: "How much do you earn each month?",
    field: "monthlyIncome" as const,
    placeholder: "e.g. 50000",
  },
  {
    id: 2,
    icon: TrendingUp,
    title: "Fixed Expenses",
    subtitle: "Rent, EMI, bills — regular monthly costs",
    field: "fixedExpenses" as const,
    placeholder: "e.g. 15000",
  },
  {
    id: 3,
    icon: Target,
    title: "Savings Goal",
    subtitle: "How much do you want to save?",
    field: "savingsGoal" as const,
    placeholder: "e.g. 10000",
  },
];

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({
    monthlyIncome: "",
    fixedExpenses: "",
    savingsGoal: "",
    goalName: "",
  });
  const [error, setError] = useState("");

  const current = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  function handleNext() {
    setError("");
    if (step < STEPS.length - 1) {
      const val = Number(values[current.field]);
      if (!val || val <= 0) {
        setError("Please enter a valid amount");
        return;
      }
      setStep((s) => s + 1);
    } else {
      const income = Number(values.monthlyIncome);
      const fixed = Number(values.fixedExpenses);
      const goal = Number(values.savingsGoal);
      const goalName = values.goalName.trim() || "My Savings Goal";
      if (!goal || goal <= 0) {
        setError("Please enter a valid goal amount");
        return;
      }
      if (fixed >= income) {
        setError("Fixed expenses should be less than income");
        return;
      }
      onComplete({
        monthlyIncome: income,
        fixedExpenses: fixed,
        savingsGoal: goal,
        goalName,
        currentSavings: 0,
      });
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleNext();
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-10 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl brand-bg flex items-center justify-center mx-auto mb-3 glow-brand">
          <Wallet className="w-8 h-8 text-background" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">AI Cash Manager</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your smart financial companion
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-8">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full brand-bg rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-xs glass-card p-6 animate-fade-up">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 brand-text" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{current.title}</h2>
            <p className="text-xs text-muted-foreground">{current.subtitle}</p>
          </div>
        </div>

        {isLastStep ? (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Monthly Goal Amount (₹)
              </Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder={current.placeholder}
                value={values.savingsGoal}
                onChange={(e) =>
                  setValues((v) => ({ ...v, savingsGoal: e.target.value }))
                }
                onKeyDown={handleKey}
                className="bg-muted/50 border-border/60 text-foreground placeholder:text-muted-foreground/60 text-base h-12"
                autoFocus
                data-ocid="onboarding.input"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Goal Name
              </Label>
              <Input
                type="text"
                placeholder="e.g. New Laptop, Emergency Fund"
                value={values.goalName}
                onChange={(e) =>
                  setValues((v) => ({ ...v, goalName: e.target.value }))
                }
                onKeyDown={handleKey}
                className="bg-muted/50 border-border/60 text-foreground placeholder:text-muted-foreground/60 text-base h-12"
              />
            </div>
          </div>
        ) : (
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Amount (₹)
            </Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder={current.placeholder}
              value={values[current.field]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [current.field]: e.target.value }))
              }
              onKeyDown={handleKey}
              className="bg-muted/50 border-border/60 text-foreground placeholder:text-muted-foreground/60 text-base h-12"
              autoFocus
              data-ocid="onboarding.input"
            />
          </div>
        )}

        {error && (
          <p
            className="text-destructive text-xs mt-2"
            data-ocid="onboarding.error_state"
          >
            {error}
          </p>
        )}

        {/* Preview of summary on last step */}
        {isLastStep && values.monthlyIncome && values.fixedExpenses && (
          <div className="mt-4 p-3 rounded-xl bg-primary/10 space-y-1">
            <p className="text-xs text-muted-foreground">
              Your disposable budget:
            </p>
            <p className="text-lg font-bold brand-text">
              {fmtFull(
                Math.max(
                  0,
                  Number(values.monthlyIncome) -
                    Number(values.fixedExpenses) -
                    Number(values.savingsGoal),
                ),
              )}
              /mo
            </p>
          </div>
        )}

        <Button
          onClick={handleNext}
          className="w-full mt-5 h-12 brand-bg text-background font-semibold rounded-xl hover:opacity-90 transition-opacity glow-brand"
          data-ocid="onboarding.primary_button"
        >
          {isLastStep ? "Get Started 🚀" : "Continue"}
          {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>

      {/* Step dots */}
      <div className="flex gap-2 mt-6">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step
                ? "w-6 brand-bg"
                : i < step
                  ? "w-3 brand-bg opacity-40"
                  : "w-3 bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
