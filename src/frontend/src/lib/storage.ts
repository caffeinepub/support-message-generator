import type { ChatMessage, Expense, Loan, UserProfile } from "../types";

const KEYS = {
  PROFILE: "acm_profile",
  EXPENSES: "acm_expenses",
  CHAT: "acm_chat",
  THEME: "acm_theme",
  DAILY_HISTORY: "acm_daily_history",
  LOANS: "acm_loans",
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
};
