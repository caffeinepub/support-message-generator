import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import Onboarding from "./components/Onboarding";
import { storage } from "./lib/storage";
import ChatScreen from "./screens/ChatScreen";
import Dashboard from "./screens/Dashboard";
import ExpensesScreen from "./screens/Expenses";
import GoalsScreen from "./screens/Goals";
import LoanScreen from "./screens/LoanScreen";
import type { ChatMessage, Expense, Loan, Screen, UserProfile } from "./types";

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(() =>
    storage.getProfile(),
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    storage.getExpenses(),
  );
  const [loans, setLoans] = useState<Loan[]>(() => storage.getLoans());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    storage.getChat(),
  );
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    storage.getTheme(),
  );
  const [screen, setScreen] = useState<Screen>("dashboard");

  // Apply theme to html element
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
    }
    html.style.colorScheme = theme;
    storage.setTheme(theme);
  }, [theme]);

  function handleOnboardingComplete(p: UserProfile) {
    storage.setProfile(p);
    setProfile(p);
  }

  function handleUpdateProfile(p: UserProfile) {
    storage.setProfile(p);
    setProfile(p);
  }

  function handleAddExpense(e: Omit<Expense, "id">) {
    const newExpense: Expense = { ...e, id: Date.now().toString() };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    storage.setExpenses(updated);
  }

  function handleDeleteExpense(id: string) {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    storage.setExpenses(updated);
  }

  function handleAddLoan(l: Omit<Loan, "id">) {
    const newLoan: Loan = { ...l, id: Date.now().toString() };
    const updated = [newLoan, ...loans];
    setLoans(updated);
    storage.setLoans(updated);
  }

  function handleDeleteLoan(id: string) {
    const updated = loans.filter((l) => l.id !== id);
    setLoans(updated);
    storage.setLoans(updated);
  }

  function handleMarkEMIPaid(id: string) {
    const updated = loans.map((l) =>
      l.id === id
        ? { ...l, paidMonths: Math.min(l.paidMonths + 1, l.tenureMonths) }
        : l,
    );
    setLoans(updated);
    storage.setLoans(updated);
  }

  function handleChatUpdate(msgs: ChatMessage[]) {
    setChatMessages(msgs);
    storage.setChat(msgs);
  }

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  function goToAddExpense() {
    setScreen("expenses");
  }

  if (!profile) {
    return (
      <>
        <meta name="theme-color" content="#0B0E10" />
        <Onboarding onComplete={handleOnboardingComplete} />
        <Toaster richColors position="top-center" />
      </>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-black">
      <div
        className="relative w-full max-w-[430px] min-h-screen bg-background flex flex-col overflow-hidden"
        style={{ boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}
      >
        {/* Scrollable content area */}
        <main
          className="flex-1 overflow-y-auto scrollbar-none"
          style={{ paddingBottom: 60 }}
        >
          {screen === "dashboard" && (
            <Dashboard
              profile={profile}
              expenses={expenses}
              loans={loans}
              onAddExpense={goToAddExpense}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )}
          {screen === "expenses" && (
            <ExpensesScreen
              expenses={expenses}
              onAdd={handleAddExpense}
              onDelete={handleDeleteExpense}
            />
          )}
          {screen === "goals" && (
            <GoalsScreen
              profile={profile}
              expenses={expenses}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
          {screen === "chat" && (
            <ChatScreen
              messages={chatMessages}
              profile={profile}
              expenses={expenses}
              loans={loans}
              onSendMessage={handleChatUpdate}
            />
          )}
          {screen === "loans" && (
            <LoanScreen
              loans={loans}
              profile={profile}
              onAdd={handleAddLoan}
              onDelete={handleDeleteLoan}
              onMarkPaid={handleMarkEMIPaid}
            />
          )}
        </main>

        {/* Bottom navigation */}
        <BottomNav active={screen} onChange={setScreen} />

        <Toaster richColors position="top-center" />
      </div>
    </div>
  );
}
