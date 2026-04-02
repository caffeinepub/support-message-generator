import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronUp, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRipple } from "../hooks/useRipple";
import { fmt, todayStr } from "../lib/engine";
import type { Category, Expense, Screen } from "../types";
import { CATEGORY_META } from "./Expenses";

const ALL_CATEGORIES: Category[] = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Other",
];

function formatDateLabel(dateStr: string): string {
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMonthLabel(dateStr: string): string {
  return new Date(`${dateStr}-01`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

interface Props {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onNavigate: (s: Screen) => void;
}

export default function HistoryScreen({ expenses, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const ripple = useRipple();

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const hasActiveFilter =
    search.trim() !== "" ||
    fromDate !== "" ||
    toDate !== "" ||
    selectedCategories.length > 0;

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function clearFilters() {
    setSearch("");
    setFromDate("");
    setToDate("");
    setSelectedCategories([]);
  }

  const filtered = expenses
    .filter((e) => {
      const q = search.toLowerCase();
      if (
        q &&
        !e.note.toLowerCase().includes(q) &&
        !e.category.toLowerCase().includes(q)
      )
        return false;
      if (fromDate && e.date < fromDate) return false;
      if (toDate && e.date > toDate) return false;
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(e.category)
      )
        return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // Group by date
  const byDate: Record<string, Expense[]> = {};
  for (const e of filtered) {
    byDate[e.date] = byDate[e.date] || [];
    byDate[e.date].push(e);
  }

  // Group by month for summary
  const byMonth: Record<string, number> = {};
  for (const e of filtered) {
    const m = e.date.slice(0, 7);
    byMonth[m] = (byMonth[m] || 0) + e.amount;
  }

  const dateKeys = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  // Track row index for deterministic markers
  let globalIdx = 0;

  return (
    <div className="flex flex-col px-4 pb-6 animate-fade-up">
      {/* Header */}
      <div className="pt-5 pb-3">
        <h2 className="text-2xl font-bold text-foreground">History</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search + Filter row */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50 border-border/60 rounded-2xl h-11"
            data-ocid="history.search_input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          onMouseDown={ripple}
          onTouchStart={ripple}
          className={`ripple-container relative w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${
            showFilters || hasActiveFilter
              ? "bg-primary/15 border-primary/40 brand-text"
              : "bg-muted/50 border-border/60 text-muted-foreground hover:border-border"
          }`}
          data-ocid="history.filter.toggle"
          aria-label="Toggle filters"
        >
          {showFilters ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <SlidersHorizontal className="w-4 h-4" />
          )}
          {hasActiveFilter && !showFilters && (
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div
          className="glass-card p-4 mb-3 space-y-3"
          style={{ animation: "fadeSlideUp 0.2s ease both" }}
          data-ocid="history.filter.panel"
        >
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Date Range
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label
                  htmlFor="history-from-date"
                  className="text-xs text-muted-foreground/70 block mb-1"
                >
                  From
                </Label>
                <Input
                  id="history-from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-muted/50 border-border/60 h-10 text-sm rounded-xl"
                  data-ocid="history.from_date.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="history-to-date"
                  className="text-xs text-muted-foreground/70 block mb-1"
                >
                  To
                </Label>
                <Input
                  id="history-to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-muted/50 border-border/60 h-10 text-sm rounded-xl"
                  data-ocid="history.to_date.input"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Category
            </p>
            <div className="flex gap-2 flex-wrap">
              {ALL_CATEGORIES.map((cat) => {
                const { icon, color, bg } = CATEGORY_META[cat];
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? `${bg} ${color} border-current scale-105`
                        : "bg-muted/40 text-muted-foreground border-border/50 hover:border-border"
                    }`}
                    data-ocid={`history.${cat.toLowerCase()}.toggle`}
                  >
                    {icon} {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearFilters}
              onMouseDown={ripple}
              onTouchStart={ripple}
              className="ripple-container w-full h-9 rounded-xl border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              data-ocid="history.clear_filters.button"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilter && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {selectedCategories.map((cat) => (
            <span
              key={cat}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/15 brand-text"
            >
              {cat}
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                aria-label={`Remove ${cat} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {fromDate && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground">
              From: {fromDate}
              <button
                type="button"
                onClick={() => setFromDate("")}
                aria-label="Remove from date filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {toDate && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground">
              To: {toDate}
              <button
                type="button"
                onClick={() => setToDate("")}
                aria-label="Remove to date filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Skeleton loader */}
      {isLoading ? (
        <div className="space-y-3 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton positions
              key={i}
              className="glass-card px-4 py-3 flex items-center gap-3"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-10 h-10 rounded-xl shimmer-dark flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded shimmer-dark w-2/3" />
                <div className="h-2 rounded shimmer-dark w-1/3" />
              </div>
              <div className="h-4 rounded shimmer-dark w-16 flex-shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-16" data-ocid="history.empty_state">
              <svg
                viewBox="0 0 120 100"
                className="w-28 h-24 mx-auto mb-4 opacity-40"
                fill="none"
                role="img"
                aria-label="No transactions found illustration"
              >
                <circle
                  cx="50"
                  cy="45"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-muted-foreground"
                />
                <line
                  x1="70"
                  y1="65"
                  x2="95"
                  y2="90"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="text-muted-foreground"
                />
                <line
                  x1="42"
                  y1="45"
                  x2="58"
                  y2="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-muted-foreground"
                  opacity="0.5"
                />
                <line
                  x1="50"
                  y1="37"
                  x2="50"
                  y2="53"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-muted-foreground"
                  opacity="0.5"
                />
              </svg>
              <p className="font-semibold text-foreground">
                No transactions found
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                {hasActiveFilter
                  ? "Try adjusting your search or filters"
                  : "Start adding expenses to build your history"}
              </p>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-xs brand-text font-semibold underline underline-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Transaction list grouped by date */}
          {filtered.length > 0 && (
            <div className="space-y-5">
              {dateKeys.map((dateKey) => {
                const items = byDate[dateKey];
                const monthKey = dateKey.slice(0, 7);
                const isFirstOfMonth =
                  dateKeys.indexOf(dateKey) === 0 ||
                  dateKeys[dateKeys.indexOf(dateKey) - 1].slice(0, 7) !==
                    monthKey;

                return (
                  <div key={dateKey}>
                    {isFirstOfMonth && (
                      <div className="flex items-center justify-between px-1 mb-3">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {formatMonthLabel(monthKey)}
                        </span>
                        <span className="text-xs font-semibold brand-text">
                          {fmt(byMonth[monthKey])}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {formatDateLabel(dateKey)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fmt(items.reduce((s, e) => s + e.amount, 0))}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {items.map((expense) => {
                        const meta = CATEGORY_META[expense.category];
                        globalIdx++;
                        const cardIdx = globalIdx;
                        return (
                          <div
                            key={expense.id}
                            className="glass-card px-4 py-3 flex items-center gap-3"
                            style={{
                              animation: `fadeSlideUp 0.35s cubic-bezier(0.16,1,0.3,1) ${Math.min(cardIdx * 30, 300)}ms both`,
                            }}
                            data-ocid={`history.item.${cardIdx}`}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}
                            >
                              {meta.icon}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {expense.note}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Badge
                                  className={`text-[10px] px-1.5 py-0 h-4 font-medium border-0 ${meta.bg} ${meta.color}`}
                                >
                                  {expense.category}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(
                                    `${expense.date}T00:00:00`,
                                  ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <p className="text-sm font-bold text-red-400">
                                -{fmt(expense.amount)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => onDelete(expense.id)}
                              onMouseDown={ripple}
                              onTouchStart={ripple}
                              className="ripple-container w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0 hover:bg-destructive/20 transition-colors"
                              aria-label="Delete expense"
                              data-ocid={`history.delete_button.${cardIdx}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
