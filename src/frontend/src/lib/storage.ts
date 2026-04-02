import type { ChatMessage, Expense, Loan, UserProfile } from "../types";

const KEYS = {
  PROFILE: "acm_profile",
  EXPENSES: "acm_expenses",
  CHAT: "acm_chat",
  THEME: "acm_theme",
  DAILY_HISTORY: "acm_daily_history",
  LOANS: "acm_loans",
  BUDGET_PLAN: "acm_budget_plan",
  AUTH: "acm_auth",
} as const;

export const storage = {
  getProfile(): UserProfile | null {
    try {
      const raw = localStorage.getItem(KEYS.PROFILE);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  },
  setProfile(p: UserProfile) {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(p));
  },

  getExpenses(): Expense[] {
    try {
      const raw = localStorage.getItem(KEYS.EXPENSES);
      return raw ? (JSON.parse(raw) as Expense[]) : [];
    } catch {
      return [];
    }
  },
  setExpenses(items: Expense[]) {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(items));
  },

  getChat(): ChatMessage[] {
    try {
      const raw = localStorage.getItem(KEYS.CHAT);
      return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    } catch {
      return [];
    }
  },
  setChat(msgs: ChatMessage[]) {
    localStorage.setItem(KEYS.CHAT, JSON.stringify(msgs));
  },

  getTheme(): "dark" | "light" {
    return (localStorage.getItem(KEYS.THEME) as "dark" | "light") || "dark";
  },
  setTheme(t: "dark" | "light") {
    localStorage.setItem(KEYS.THEME, t);
  },

  getDailyHistory(): Record<string, number> {
    try {
      const raw = localStorage.getItem(KEYS.DAILY_HISTORY);
      return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch {
      return {};
    }
  },
  setDailyHistory(h: Record<string, number>) {
    localStorage.setItem(KEYS.DAILY_HISTORY, JSON.stringify(h));
  },

  getLoans(): Loan[] {
    try {
      const raw = localStorage.getItem(KEYS.LOANS);
      return raw ? (JSON.parse(raw) as Loan[]) : [];
    } catch {
      return [];
    }
  },
  setLoans(loans: Loan[]) {
    localStorage.setItem(KEYS.LOANS, JSON.stringify(loans));
  },

  getBudgetPlan(): { needs: number; wants: number; savings: number } | null {
    try {
      const raw = localStorage.getItem(KEYS.BUDGET_PLAN);
      return raw
        ? (JSON.parse(raw) as { needs: number; wants: number; savings: number })
        : null;
    } catch {
      return null;
    }
  },
  setBudgetPlan(plan: { needs: number; wants: number; savings: number }) {
    localStorage.setItem(KEYS.BUDGET_PLAN, JSON.stringify(plan));
  },

  getAuth(): { email: string; name: string } | null {
    try {
      const raw = localStorage.getItem(KEYS.AUTH);
      return raw ? (JSON.parse(raw) as { email: string; name: string }) : null;
    } catch {
      return null;
    }
  },
  setAuth(auth: { email: string; name: string }) {
    localStorage.setItem(KEYS.AUTH, JSON.stringify(auth));
  },
  clearAuth() {
    localStorage.removeItem(KEYS.AUTH);
  },

  clearAll() {
    for (const k of Object.values(KEYS)) {
      localStorage.removeItem(k);
    }
  },
};
