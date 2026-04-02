import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Plane,
  Plus,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";
import { fmt, todayStr } from "../lib/engine";
import type { Category, Expense } from "../types";

const CATEGORY_META: Record<
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

function groupByDate(expenses: Expense[]) {
  const groups: Record<string, Expense[]> = {};
  for (const e of [...expenses].sort((a, b) => b.date.localeCompare(a.date))) {
    groups[e.date] = groups[e.date] || [];
    groups[e.date].push(e);
  }
  return groups;
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
}

export default function ExpensesScreen({ expenses, onAdd, onDelete }: Props) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState(todayStr());
  const [showForm, setShowForm] = useState(true);
  const [error, setError] = useState("");

  const handleNoteChange = useCallback((val: string) => {
    setNote(val);
    if (val.length > 2) setCategory(autoCategory(val));
  }, []);

  function handleSubmit() {
    setError("");
    const amt = Number.parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount");
      return;
    }
    onAdd({ amount: amt, note: note.trim() || category, category, date });
    setAmount("");
    setNote("");
    setCategory("Food");
    setDate(todayStr());
  }

  const groups = groupByDate(expenses);
  const totalThisMonth = expenses
    .filter((e) => e.date.startsWith(todayStr().slice(0, 7)))
    .reduce((s, e) => s + e.amount, 0);

  const catTotals: Record<string, number> = {};
  for (const e of expenses.filter((e) =>
    e.date.startsWith(todayStr().slice(0, 7)),
  )) {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Expenses</h2>
          <p className="text-xs text-muted-foreground">
            Total this month: {fmt(totalThisMonth)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 text-xs brand-text bg-primary/10 px-3 py-1.5 rounded-full"
          data-ocid="expenses.toggle"
        >
          <Plus className="w-3.5 h-3.5" />
          {showForm ? "Hide" : "Add"}
          {showForm ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass-card p-5 space-y-3" data-ocid="expenses.panel">
          <h3 className="font-semibold text-foreground text-sm">Add Expense</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Amount (₹)
              </Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="bg-muted/50 border-border/60 text-foreground h-11 text-base"
                data-ocid="expenses.input"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Date
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-muted/50 border-border/60 text-foreground h-11"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Note (auto-categorizes)
            </Label>
            <Input
              type="text"
              placeholder="e.g. Lunch at Zomato"
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-muted/50 border-border/60 text-foreground h-11"
              data-ocid="expenses.textarea"
            />
          </div>
          {/* Category selector */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Category
            </Label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
                const { icon, color, bg } = CATEGORY_META[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      category === cat
                        ? `${bg} ${color} border-current`
                        : "bg-muted/40 text-muted-foreground border-border/50 hover:border-border"
                    }`}
                    data-ocid={`expenses.${cat.toLowerCase()}.toggle`}
                  >
                    {icon} {cat}
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
          <Button
            onClick={handleSubmit}
            className="w-full h-11 brand-bg text-background font-semibold rounded-xl hover:opacity-90"
            data-ocid="expenses.submit_button"
          >
            Add Expense
          </Button>
        </div>
      )}

      {/* Category summary chips */}
      {Object.keys(catTotals).length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {Object.entries(catTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amt]) => {
              const meta = CATEGORY_META[cat as Category];
              return (
                <span
                  key={cat}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${meta.bg} ${meta.color}`}
                >
                  {meta.icon} {cat}: {fmt(amt)}
                </span>
              );
            })}
        </div>
      )}

      {/* Expense list */}
      {Object.keys(groups).length === 0 ? (
        <div className="text-center py-12" data-ocid="expenses.empty_state">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-muted-foreground font-medium">No expenses yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Add your first expense above
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groups).map(([dateKey, items], gi) => (
            <div key={dateKey}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {formatDateLabel(dateKey)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fmt(items.reduce((s, e) => s + e.amount, 0))}
                </p>
              </div>
              <div
                className="glass-card overflow-hidden"
                data-ocid={`expenses.item.${gi + 1}`}
              >
                {items.map((expense, i) => {
                  const meta = CATEGORY_META[expense.category];
                  return (
                    <div
                      key={expense.id}
                      className={`flex items-center gap-3 px-4 py-3 ${
                        i < items.length - 1 ? "border-b border-border/30" : ""
                      }`}
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
                        <p className={`text-xs ${meta.color}`}>
                          {expense.category}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground flex-shrink-0">
                        {fmt(expense.amount)}
                      </p>
                      <button
                        type="button"
                        onClick={() => onDelete(expense.id)}
                        className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0 hover:bg-destructive/20 transition-colors"
                        aria-label="Delete expense"
                        data-ocid={`expenses.delete_button.${gi + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
