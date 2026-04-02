import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Check, Sparkles, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { fmt, fmtFull, monthlyBudget } from "../lib/engine";
import { storage } from "../lib/storage";
import type { UserProfile } from "../types";

const SEGMENT_COLORS = [
  { label: "Needs", color: "#4FA6FF", darkColor: "#4FA6FF" },
  { label: "Wants", color: "#7B5CFF", darkColor: "#9B7FFF" },
  { label: "Savings", color: "#2EE59D", darkColor: "#2EE59D" },
];

interface Props {
  profile: UserProfile;
}

export default function BudgetPlannerScreen({ profile }: Props) {
  const disposable = Math.max(0, profile.monthlyIncome - profile.fixedExpenses);
  const budget = monthlyBudget(profile);

  const saved = storage.getBudgetPlan();

  const [needs, setNeeds] = useState(saved?.needs ?? 50);
  const [wants, setWants] = useState(saved?.wants ?? 30);
  const [savingsPct, setSavingsPct] = useState(saved?.savings ?? 20);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Keep sum at 100
  function adjustNeeds(val: number) {
    const newNeeds = Math.min(val, 100);
    const remaining = 100 - newNeeds;
    const ratio = wants + savingsPct > 0 ? wants / (wants + savingsPct) : 0.5;
    const newWants = Math.round(remaining * ratio);
    const newSavings = remaining - newWants;
    setNeeds(newNeeds);
    setWants(Math.max(0, newWants));
    setSavingsPct(Math.max(0, newSavings));
  }

  function adjustWants(val: number) {
    const newWants = Math.min(val, 100 - needs);
    const newSavings = Math.max(0, 100 - needs - newWants);
    setWants(newWants);
    setSavingsPct(newSavings);
  }

  function adjustSavings(val: number) {
    const newSavings = Math.min(val, 100 - needs);
    const newWants = Math.max(0, 100 - needs - newSavings);
    setSavingsPct(newSavings);
    setWants(newWants);
  }

  function applyAIRecommended() {
    setNeeds(50);
    setWants(30);
    setSavingsPct(20);
  }

  function handleSave() {
    storage.setBudgetPlan({ needs, wants, savings: savingsPct });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }

  const segments = [
    { ...SEGMENT_COLORS[0], pct: needs, amount: (disposable * needs) / 100 },
    { ...SEGMENT_COLORS[1], pct: wants, amount: (disposable * wants) / 100 },
    {
      ...SEGMENT_COLORS[2],
      pct: savingsPct,
      amount: (disposable * savingsPct) / 100,
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
            boxShadow: "0 4px 16px rgba(123, 92, 255, 0.35)",
          }}
        >
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-foreground">
            Budget Planner
          </h2>
          <p className="text-xs text-muted-foreground">
            Allocate your income wisely
          </p>
        </div>
      </div>

      {/* Income summary */}
      <div
        className="p-4 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(79,166,255,0.12) 0%, rgba(123,92,255,0.12) 100%)",
          border: "1px solid rgba(123,92,255,0.2)",
        }}
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Disposable Income
        </p>
        <p className="text-3xl font-extrabold text-foreground">
          {fmtFull(disposable)}
          <span className="text-sm font-normal text-muted-foreground">
            /month
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Income {fmtFull(profile.monthlyIncome)} − Fixed{" "}
          {fmtFull(profile.fixedExpenses)}
        </p>
      </div>

      {/* Stacked bar visual */}
      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Allocation Preview
        </p>
        <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className="transition-all duration-300 h-full"
              style={{
                width: `${seg.pct}%`,
                background: seg.color,
                minWidth: seg.pct > 0 ? "4px" : "0",
              }}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: seg.color }}
              />
              <span className="text-xs text-muted-foreground">
                {seg.label} {seg.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="glass-card p-5 space-y-6">
        {/* Needs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: SEGMENT_COLORS[0].color }}
              />
              <span className="text-sm font-semibold text-foreground">
                Needs
              </span>
              <span className="text-xs text-muted-foreground">
                (rent, food, bills)
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-foreground">
                {needs}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                · {fmt((disposable * needs) / 100)}
              </span>
            </div>
          </div>
          <Slider
            value={[needs]}
            min={10}
            max={80}
            step={1}
            onValueChange={([val]) => adjustNeeds(val)}
            className="w-full"
          />
        </div>

        {/* Wants */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: SEGMENT_COLORS[1].color }}
              />
              <span className="text-sm font-semibold text-foreground">
                Wants
              </span>
              <span className="text-xs text-muted-foreground">
                (travel, fun)
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-foreground">
                {wants}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                · {fmt((disposable * wants) / 100)}
              </span>
            </div>
          </div>
          <Slider
            value={[wants]}
            min={0}
            max={100 - needs - 5}
            step={1}
            onValueChange={([val]) => adjustWants(val)}
            className="w-full"
          />
        </div>

        {/* Savings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: SEGMENT_COLORS[2].color }}
              />
              <span className="text-sm font-semibold text-foreground">
                Savings
              </span>
              <span className="text-xs text-muted-foreground">
                (goal, emergency)
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-foreground">
                {savingsPct}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                · {fmt((disposable * savingsPct) / 100)}
              </span>
            </div>
          </div>
          <Slider
            value={[savingsPct]}
            min={0}
            max={100 - needs - 5}
            step={1}
            onValueChange={([val]) => adjustSavings(val)}
            className="w-full"
          />
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Total: {needs + wants + savingsPct}% of {fmtFull(disposable)}
        </div>
      </div>

      {/* Amount breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {segments.map((seg) => (
          <div key={seg.label} className="glass-card p-3 text-center">
            <div
              className="w-2 h-2 rounded-full mx-auto mb-1.5"
              style={{ background: seg.color }}
            />
            <p className="text-xs text-muted-foreground">{seg.label}</p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {fmt(seg.amount)}
            </p>
          </div>
        ))}
      </div>

      {/* AI Recommended button */}
      <button
        type="button"
        onClick={applyAIRecommended}
        className="w-full h-11 rounded-2xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{
          background: "rgba(123,92,255,0.08)",
          border: "1px solid rgba(123,92,255,0.3)",
          color: "#7B5CFF",
        }}
        data-ocid="budget.secondary_button"
      >
        <Sparkles className="w-4 h-4" />
        AI Recommended (50/30/20)
      </button>

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{
          background: saveSuccess
            ? "linear-gradient(135deg, #2EE59D 0%, #1EC68A 100%)"
            : "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
          boxShadow: saveSuccess
            ? "0 4px 20px rgba(46, 229, 157, 0.4)"
            : "0 4px 20px rgba(123, 92, 255, 0.4)",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
        }}
        data-ocid="budget.save_button"
      >
        {saveSuccess ? (
          <>
            <Check className="w-4 h-4" /> Saved!
          </>
        ) : (
          "Save Budget Plan"
        )}
      </button>

      {/* Budget context */}
      {budget > 0 && (
        <div
          className="p-4 rounded-2xl text-sm"
          style={{
            background: "rgba(46,229,157,0.08)",
            border: "1px solid rgba(46,229,157,0.2)",
          }}
        >
          <p className="text-muted-foreground">
            Your monthly budget is{" "}
            <span className="font-semibold text-foreground">
              {fmtFull(budget)}
            </span>{" "}
            (after savings goal of{" "}
            <span className="font-semibold">
              {fmtFull(profile.savingsGoal)}
            </span>
            ).
          </p>
        </div>
      )}
    </div>
  );
}
