import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  HelpCircle,
  Plane,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";
import { fmt, todayStr } from "../lib/engine";
import type { Category, Expense, Screen } from "../types";

export const CATEGORY_META: Record<
  Category,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  Food: {
    icon: <UtensilsCrossed className="w-4 h-4" />,
    color: "text-orange-400",
    bg: "bg-orange-400/15",
  },
  Travel: {
    icon: <Plane className="w-4 h-4" />,
    color: "text-blue-400",
    bg: "bg-blue-400/15",
  },
  Shopping: {
    icon: <ShoppingBag className="w-4 h-4" />,
    color: "text-purple-400",
    bg: "bg-purple-400/15",
  },
  Bills: {
    icon: <Zap className="w-4 h-4" />,
    color: "text-yellow-400",
    bg: "bg-yellow-400/15",
  },
  Other: {
    icon: <HelpCircle className="w-4 h-4" />,
    color: "text-muted-foreground",
    bg: "bg-muted/60",
  },
};

const KEYWORDS: Record<Category, string[]> = {
  Food: [
    "food",
    "eat",
    "lunch",
    "dinner",
    "breakfast",
    "coffee",
    "pizza",
    "swiggy",
    "zomato",
    "restaurant",
    "chai",
    "snack",
    "biryani",
    "hotel",
  ],
  Travel: [
    "uber",
    "ola",
    "auto",
    "bus",
    "train",
    "flight",
    "petrol",
    "fuel",
    "metro",
    "cab",
    "travel",
    "trip",
    "toll",
    "parking",
  ],
  Shopping: [
    "amazon",
    "flipkart",
    "clothes",
    "shop",
    "buy",
    "purchase",
    "shirt",
    "shoes",
    "bag",
    "mall",
    "myntra",
  ],
  Bills: [
    "bill",
    "electric",
    "gas",
    "water",
    "internet",
    "phone",
    "recharge",
    "emi",
    "rent",
    "subscription",
    "netflix",
    "spotify",
  ],
  Other: [],
};

function autoCategory(note: string): Category {
  const lower = note.toLowerCase();
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (cat === "Other") continue;
    if (words.some((w) => lower.includes(w))) return cat as Category;
  }
  return "Other";
}

function formatDateLabel(dateStr: string): string {
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

interface Props {
  expenses: Expense[];
  onAdd: (e: Omit<Expense, "id">) => void;
  onDelete: (id: string) => void;
  onNavigate: (s: Screen) => void;
}

export default function ExpensesScreen({
  expenses,
  onAdd,
  onDelete,
  onNavigate,
}: Props) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState(todayStr());
  const [error, setError] = useState("");
  const [animatingCat, setAnimatingCat] = useState<Category | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleNoteChange = useCallback((val: string) => {
    setNote(val);
    if (val.length > 2) setCategory(autoCategory(val));
  }, []);

  function handleCategorySelect(cat: Category) {
    setCategory(cat);
    setAnimatingCat(cat);
    setTimeout(() => setAnimatingCat(null), 400);
  }

  const formReady = Number.parseFloat(amount) > 0;

  function handleSubmit() {
    setError("");
    const amt = Number.parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount");
      return;
    }
    onAdd({ amount: amt, note: note.trim() || category, category, date });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onNavigate("dashboard");
    }, 1300);
    setAmount("");
    setNote("");
    setCategory("Food");
    setDate(todayStr());
  }

  const totalThisMonth = expenses
    .filter((e) => e.date.startsWith(todayStr().slice(0, 7)))
    .reduce((s, e) => s + e.amount, 0);

  // Last 3 expenses for recent preview
  const recentExpenses = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <>
      {/* Success overlay */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="flex flex-col items-center gap-4"
            style={{
              animation: "successPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #2EE59D 0%, #0BA360 100%)",
                boxShadow: "0 0 40px rgba(46,229,157,0.5)",
              }}
            >
              <svg
                viewBox="0 0 40 40"
                className="w-12 h-12"
                fill="none"
                aria-hidden="true"
                role="presentation"
              >
                <polyline
                  points="8,20 17,29 33,13"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="60"
                  strokeDashoffset="0"
                  style={{ animation: "checkDraw 0.4s ease 0.2s both" }}
                />
              </svg>
            </div>
            <p className="text-white font-bold text-lg">Expense Added!</p>
            <p className="text-white/60 text-sm">Redirecting to dashboard…</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5 px-4 pb-6 animate-fade-up">
        {/* Header */}
        <div className="pt-5">
          <h2 className="text-2xl font-bold text-foreground">Add Expense</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            This month: {fmt(totalThisMonth)}
          </p>
        </div>

        {/* Add Form */}
        <div className="glass-card p-5 space-y-4" data-ocid="expenses.panel">
          {/* Amount */}
          <div className="input-focus-expand">
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Amount (₹)
            </Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-muted/50 border-border/60 text-foreground h-12 text-lg font-semibold rounded-xl"
              data-ocid="expenses.input"
            />
          </div>

          {/* Date */}
          <div className="input-focus-expand">
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Date
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-muted/50 border-border/60 text-foreground h-11 rounded-xl"
            />
          </div>

          {/* Note */}
          <div className="input-focus-expand">
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Note{" "}
              <span className="text-muted-foreground/50">
                (auto-categorizes)
              </span>
            </Label>
            <Input
              type="text"
              placeholder="e.g. Lunch at Zomato"
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-muted/50 border-border/60 text-foreground h-11 rounded-xl"
              data-ocid="expenses.textarea"
            />
          </div>

          {/* Category selector */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Category
            </Label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
                const { icon, color, bg } = CATEGORY_META[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      category === cat
                        ? `${bg} ${color} border-current scale-105`
                        : "bg-muted/40 text-muted-foreground border-border/50 hover:border-border"
                    }`}
                    data-ocid={`expenses.${cat.toLowerCase()}.toggle`}
                  >
                    <span
                      className={
                        animatingCat === cat ? "animate-bounce-in" : ""
                      }
                    >
                      {icon}
                    </span>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p
              className="text-destructive text-xs"
              data-ocid="expenses.error_state"
            >
              {error}
            </p>
          )}

          {/* Save button — pulses when form is ready */}
          <Button
            onClick={handleSubmit}
            className="w-full h-11 font-semibold rounded-xl hover:opacity-90 transition-all"
            style={{
              background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
              color: "white",
              ...(formReady
                ? { animation: "pulseGlow 1.2s ease-in-out infinite" }
                : {}),
              opacity: formReady ? 1 : 0.6,
            }}
            data-ocid="expenses.submit_button"
          >
            Save Expense
          </Button>
        </div>

        {/* Recent expenses preview */}
        {recentExpenses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Recent</h3>
              <button
                type="button"
                onClick={() => onNavigate("history")}
                className="flex items-center gap-1 text-xs brand-text"
                data-ocid="expenses.history.link"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="glass-card overflow-hidden">
              {recentExpenses.map((expense, i) => {
                const meta = CATEGORY_META[expense.category];
                return (
                  <div
                    key={expense.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < recentExpenses.length - 1
                        ? "border-b border-border/30"
                        : ""
                    }`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {expense.note}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateLabel(expense.date)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground flex-shrink-0">
                      -{fmt(expense.amount)}
                    </p>
                    <button
                      type="button"
                      onClick={() => onDelete(expense.id)}
                      className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0 hover:bg-destructive/20 transition-colors"
                      aria-label="Delete expense"
                      data-ocid={`expenses.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {recentExpenses.length === 0 && (
          <div className="text-center py-10" data-ocid="expenses.empty_state">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-muted-foreground font-medium">No expenses yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Add your first expense above
            </p>
          </div>
        )}
      </div>
    </>
  );
}
