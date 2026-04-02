import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  BadgeIndianRupee,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Plus,
  Trash2,
  TrendingDown,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  fmt,
  fmtFull,
  loanAmountPaid,
  loanOutstanding,
  loanProgressPct,
  loanRemainingMonths,
  loanTotalInterest,
  loanTotalPayable,
  totalEMIBurden,
  totalOutstanding,
} from "../lib/engine";
import type { Loan, LoanType, UserProfile } from "../types";

const LOAN_TYPES: LoanType[] = [
  "Home",
  "Car",
  "Personal",
  "Education",
  "Other",
];

const LOAN_TYPE_COLORS: Record<LoanType, string> = {
  Home: "text-blue-400 bg-blue-400/15",
  Car: "text-purple-400 bg-purple-400/15",
  Personal: "text-orange-400 bg-orange-400/15",
  Education: "text-green-400 bg-green-400/15",
  Other: "text-muted-foreground bg-muted/60",
};

interface Props {
  loans: Loan[];
  profile: UserProfile;
  onAdd: (l: Omit<Loan, "id">) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
}

function loanSuggestion(loan: Loan, profile: UserProfile): string[] {
  const tips: string[] = [];
  const outstanding = loanOutstanding(loan);
  const remaining = loanRemainingMonths(loan);
  const totalInterest = loanTotalInterest(loan);
  const emiToIncomeRatio =
    profile.monthlyIncome > 0
      ? (loan.emiAmount / profile.monthlyIncome) * 100
      : 0;

  if (emiToIncomeRatio > 40) {
    tips.push(
      `⚠️ Your EMI (${fmtFull(loan.emiAmount)}) is ${Math.round(emiToIncomeRatio)}% of income — above the recommended 40%. Consider refinancing or increasing income to reduce stress.`,
    );
  }

  if (loan.interestRate > 12) {
    tips.push(
      `🔥 Interest rate is ${loan.interestRate}% p.a. — this is high. Prioritize clearing this loan first using the **Avalanche Method** (highest interest first) to save the most money.`,
    );
  } else if (loan.interestRate <= 8) {
    tips.push(
      `✅ Your interest rate (${loan.interestRate}%) is relatively low. You can invest surplus money in mutual funds (SIP) for higher returns instead of prepaying aggressively.`,
    );
  }

  if (remaining > 0 && outstanding > 0) {
    const monthlySurplus =
      profile.monthlyIncome -
      profile.fixedExpenses -
      profile.savingsGoal -
      loan.emiAmount;
    const prepayExtra = Math.floor(monthlySurplus * 0.2);
    if (prepayExtra > 0) {
      const monthsSaved = Math.floor(prepayExtra / (outstanding / remaining));
      tips.push(
        `💡 If you pay an extra ${fmtFull(prepayExtra)}/month toward this loan, you could close it ~${monthsSaved} month(s) earlier and save significant interest.`,
      );
    }
  }

  if (totalInterest > loan.principal * 0.5) {
    tips.push(
      `📊 You'll pay ${fmtFull(totalInterest)} in total interest — more than 50% of the principal. Making a lump-sum prepayment of even ${fmt(outstanding * 0.1)} can dramatically reduce this.`,
    );
  }

  if (remaining <= 6 && remaining > 0) {
    tips.push(
      `🎯 Only ${remaining} EMI(s) left! You're almost debt-free on this loan. Stay consistent and close it on time.`,
    );
  }

  if (tips.length === 0) {
    tips.push(
      `👍 You're on track with this loan. Keep paying EMIs on time to maintain a healthy credit score and avoid penalties.`,
    );
  }

  return tips;
}

export default function LoanScreen({
  loans,
  profile,
  onAdd,
  onDelete,
  onMarkPaid,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [lender, setLender] = useState("");
  const [loanType, setLoanType] = useState<LoanType>("Personal");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [emiAmount, setEmiAmount] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [paidMonths, setPaidMonths] = useState("0");
  const [err, setErr] = useState("");

  const totalEMI = totalEMIBurden(loans);
  const totalOwed = totalOutstanding(loans);
  const activeLoans = loans.filter((l) => loanRemainingMonths(l) > 0);
  const closedLoans = loans.filter((l) => loanRemainingMonths(l) <= 0);

  function calcEMI() {
    const p = Number(principal);
    const r = Number(interestRate) / 100 / 12;
    const n = Number(tenureMonths);
    if (!p || !n) return;
    if (r === 0) {
      setEmiAmount(String(Math.ceil(p / n)));
      return;
    }
    const emi = (p * r * (1 + r) ** n) / ((1 + r) ** n - 1);
    setEmiAmount(String(Math.ceil(emi)));
  }

  function handleAdd() {
    setErr("");
    const p = Number(principal);
    const rate = Number(interestRate);
    const tenure = Number(tenureMonths);
    const emi = Number(emiAmount);
    const paid = Number(paidMonths);
    if (!name.trim()) {
      setErr("Enter loan name");
      return;
    }
    if (!p || p <= 0) {
      setErr("Enter valid principal amount");
      return;
    }
    if (rate < 0 || rate > 50) {
      setErr("Enter valid interest rate (0–50%)");
      return;
    }
    if (!tenure || tenure <= 0) {
      setErr("Enter valid tenure in months");
      return;
    }
    if (!emi || emi <= 0) {
      setErr("Enter valid EMI amount");
      return;
    }
    if (paid < 0 || paid >= tenure) {
      setErr("Paid months must be between 0 and tenure-1");
      return;
    }
    onAdd({
      name: name.trim(),
      lender: lender.trim() || "Unknown",
      loanType,
      principal: p,
      interestRate: rate,
      tenureMonths: tenure,
      emiAmount: emi,
      startDate: `${startDate}-01`,
      paidMonths: paid,
    });
    setName("");
    setLender("");
    setLoanType("Personal");
    setPrincipal("");
    setInterestRate("");
    setTenureMonths("");
    setEmiAmount("");
    setPaidMonths("0");
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Loan Manager</h2>
          <p className="text-xs text-muted-foreground">Track & repay smarter</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="w-9 h-9 rounded-xl brand-bg flex items-center justify-center text-background hover:opacity-90 glow-brand"
          aria-label="Add loan"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Summary cards */}
      {loans.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Total EMI/month
            </p>
            <p className="text-xl font-bold text-destructive">
              {fmtFull(totalEMI)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Total Outstanding
            </p>
            <p className="text-xl font-bold text-foreground">
              {fmt(totalOwed)}
            </p>
          </div>
        </div>
      )}

      {/* EMI vs Income warning */}
      {totalEMI > 0 &&
        profile.monthlyIncome > 0 &&
        (() => {
          const ratio = (totalEMI / profile.monthlyIncome) * 100;
          if (ratio > 50)
            return (
              <div className="flex items-start gap-2.5 p-3 rounded-xl border text-sm text-destructive bg-destructive/10 border-destructive/20">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Your total EMIs ({fmtFull(totalEMI)}) are{" "}
                  <strong>{Math.round(ratio)}%</strong> of your income —
                  dangerously high. Consider refinancing or consolidating loans.
                </span>
              </div>
            );
          if (ratio > 35)
            return (
              <div className="flex items-start gap-2.5 p-3 rounded-xl border text-sm text-warning bg-warning/10 border-warning/20">
                <TrendingDown className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  EMI-to-income ratio is <strong>{Math.round(ratio)}%</strong>.
                  The safe limit is 40%. Try to reduce discretionary spending.
                </span>
              </div>
            );
          return null;
        })()}

      {/* Add Loan Form */}
      {showForm && (
        <div className="glass-card p-5 space-y-3">
          <h3 className="font-semibold text-foreground text-sm">
            Add New Loan
          </h3>

          {/* Loan type */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Loan Type
            </Label>
            <div className="flex flex-wrap gap-2">
              {LOAN_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLoanType(t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    loanType === t
                      ? "brand-bg text-background border-transparent"
                      : "bg-muted/50 text-muted-foreground border-border/60"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Loan Name *
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Home Loan"
                className="bg-muted/50 border-border/60 text-foreground h-10 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Lender / Bank
              </Label>
              <Input
                value={lender}
                onChange={(e) => setLender(e.target.value)}
                placeholder="e.g. SBI"
                className="bg-muted/50 border-border/60 text-foreground h-10 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Principal (₹) *
              </Label>
              <Input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                onBlur={calcEMI}
                placeholder="500000"
                className="bg-muted/50 border-border/60 text-foreground h-10 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Interest Rate (% p.a.) *
              </Label>
              <Input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                onBlur={calcEMI}
                placeholder="8.5"
                className="bg-muted/50 border-border/60 text-foreground h-10 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Tenure (months) *
              </Label>
              <Input
                type="number"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(e.target.value)}
                onBlur={calcEMI}
                placeholder="240"
                className="bg-muted/50 border-border/60 text-foreground h-10 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                EMI Amount (₹) *
              </Label>
              <Input
                type="number"
                value={emiAmount}
                onChange={(e) => setEmiAmount(e.target.value)}
                placeholder="Auto-calculated"
                className="bg-muted/50 border-border/60 text-foreground h-10 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Start Month (YYYY-MM)
              </Label>
              <Input
                type="month"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-muted/50 border-border/60 text-foreground h-10 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                EMIs Paid So Far
              </Label>
              <Input
                type="number"
                value={paidMonths}
                onChange={(e) => setPaidMonths(e.target.value)}
                placeholder="0"
                className="bg-muted/50 border-border/60 text-foreground h-10 text-sm"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            💡 Fill Principal, Rate, Tenure and tap elsewhere to auto-calculate
            EMI.
          </p>

          {err && <p className="text-destructive text-xs">{err}</p>}

          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              className="flex-1 h-10 brand-bg text-background rounded-xl text-sm"
            >
              Add Loan
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              className="flex-1 h-10 rounded-xl text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {loans.length === 0 && !showForm && (
        <div className="glass-card p-8 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl brand-bg/20 flex items-center justify-center">
            <BadgeIndianRupee className="w-7 h-7 brand-text" />
          </div>
          <p className="font-semibold text-foreground">No loans added yet</p>
          <p className="text-xs text-muted-foreground">
            Add your loans to track EMIs, outstanding balance, and get
            AI-powered repayment suggestions.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="h-10 px-6 brand-bg text-background rounded-xl text-sm glow-brand"
          >
            <Plus className="w-4 h-4 mr-1" /> Add First Loan
          </Button>
        </div>
      )}

      {/* Active loans */}
      {activeLoans.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Active Loans ({activeLoans.length})
          </p>
          <div className="space-y-3">
            {activeLoans.map((loan) => {
              const pct = loanProgressPct(loan);
              const outstanding = loanOutstanding(loan);
              const remaining = loanRemainingMonths(loan);
              const paid = loanAmountPaid(loan);
              const totalPayable = loanTotalPayable(loan);
              const totalInterest = loanTotalInterest(loan);
              const suggestions = loanSuggestion(loan, profile);
              const isExpanded = expandedId === loan.id;

              return (
                <div key={loan.id} className="glass-card overflow-hidden">
                  {/* Loan header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${LOAN_TYPE_COLORS[loan.loanType]}`}
                        >
                          {loan.loanType}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {loan.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {loan.lender} · {loan.interestRate}% p.a.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : loan.id)
                          }
                          className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(loan.id)}
                          className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20"
                          aria-label="Delete loan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* EMI + remaining */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Monthly EMI
                        </p>
                        <p className="text-lg font-bold text-destructive">
                          {fmtFull(loan.emiAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Outstanding
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {fmt(outstanding)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Remaining
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {remaining} mo.
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{pct}% repaid</span>
                        <span>
                          {loan.paidMonths}/{loan.tenureMonths} EMIs
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-border/40 p-4 space-y-4">
                      {/* Numbers grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {
                            label: "Principal",
                            value: fmtFull(loan.principal),
                          },
                          {
                            label: "Total Payable",
                            value: fmtFull(totalPayable),
                          },
                          {
                            label: "Amount Paid",
                            value: fmtFull(paid),
                            color: "brand-text",
                          },
                          {
                            label: "Total Interest",
                            value: fmtFull(totalInterest),
                            color: "text-warning",
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            className="bg-muted/30 rounded-xl p-3"
                          >
                            <p className="text-xs text-muted-foreground mb-0.5">
                              {s.label}
                            </p>
                            <p
                              className={`text-sm font-bold ${s.color || "text-foreground"}`}
                            >
                              {s.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* AI Suggestions */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 brand-text" />
                          <p className="text-sm font-semibold text-foreground">
                            AI Repayment Tips
                          </p>
                        </div>
                        {suggestions.map((tip) => (
                          <div
                            key={tip.slice(0, 30)}
                            className="bg-primary/5 border border-primary/20 rounded-xl p-3"
                          >
                            <p className="text-xs text-foreground leading-relaxed">
                              {tip}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Mark as paid button */}
                      <Button
                        onClick={() => onMarkPaid(loan.id)}
                        variant="outline"
                        className="w-full h-9 text-xs rounded-xl border-primary/30 brand-text hover:bg-primary/10"
                      >
                        + Mark 1 EMI as Paid
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Closed loans */}
      {closedLoans.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Closed Loans 🎉
          </p>
          <div className="space-y-2">
            {closedLoans.map((loan) => (
              <div key={loan.id} className="glass-card p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {loan.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {loan.lender} · {fmtFull(loan.principal)} · Fully Paid
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-success/15 text-success font-medium">
                      Closed
                    </span>
                    <button
                      type="button"
                      onClick={() => onDelete(loan.id)}
                      className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategy card */}
      {activeLoans.length > 1 && (
        <div className="glass-card p-5 bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 brand-text" />
            <p className="font-semibold text-foreground text-sm">
              Repayment Strategy
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xs font-semibold text-foreground mb-1">
                🏔️ Avalanche Method (Recommended to save money)
              </p>
              <p className="text-xs text-muted-foreground">
                Pay minimum on all loans. Put extra money toward the loan with
                the <strong>highest interest rate</strong> first. Saves the most
                total interest.
              </p>
              <p className="text-xs brand-text mt-1 font-medium">
                Focus first:{" "}
                {
                  [...activeLoans].sort(
                    (a, b) => b.interestRate - a.interestRate,
                  )[0]?.name
                }{" "}
                (
                {
                  [...activeLoans].sort(
                    (a, b) => b.interestRate - a.interestRate,
                  )[0]?.interestRate
                }
                % p.a.)
              </p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xs font-semibold text-foreground mb-1">
                ⛄ Snowball Method (Best for motivation)
              </p>
              <p className="text-xs text-muted-foreground">
                Pay off the <strong>smallest outstanding balance</strong> first
                for quick wins. Great for staying motivated.
              </p>
              <p className="text-xs text-warning mt-1 font-medium">
                Focus first:{" "}
                {
                  [...activeLoans].sort(
                    (a, b) => loanOutstanding(a) - loanOutstanding(b),
                  )[0]?.name
                }{" "}
                (
                {fmt(
                  [...activeLoans].sort(
                    (a, b) => loanOutstanding(a) - loanOutstanding(b),
                  )[0]
                    ? loanOutstanding(
                        [...activeLoans].sort(
                          (a, b) => loanOutstanding(a) - loanOutstanding(b),
                        )[0],
                      )
                    : 0,
                )}{" "}
                outstanding)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
