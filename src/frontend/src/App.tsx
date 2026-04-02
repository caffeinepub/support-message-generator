import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import Onboarding from "./components/Onboarding";
import { storage } from "./lib/storage";
import AIInsightsScreen from "./screens/AIInsightsScreen";
import BudgetPlannerScreen from "./screens/BudgetPlannerScreen";
import ChatScreen from "./screens/ChatScreen";
import Dashboard from "./screens/Dashboard";
import ExpensesScreen from "./screens/Expenses";
import GoalsScreen from "./screens/Goals";
import HistoryScreen from "./screens/HistoryScreen";
import LoanScreen from "./screens/LoanScreen";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SplashScreen from "./screens/SplashScreen";
import type { ChatMessage, Expense, Loan, Screen, UserProfile } from "./types";

type AppFlow = "splash" | "login" | "onboarding" | "app";

export default function App() {
  const [flow, setFlow] = useState<AppFlow>("splash");
  const [userName, setUserName] = useState<string>(() => {
    return storage.getAuth()?.name || "";
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return storage.getAuth()?.email || "";
  });
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

  // Apply theme
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

  function handleSplashComplete() {
    const auth = storage.getAuth();
    if (auth?.email) {
      setUserName(auth!.name);
      setUserEmail(auth!.email);
      const p = storage.getProfile();
      if (p) {
        setProfile(p);
        setFlow("app");
      } else {
        setFlow("onboarding");
      }
    } else {
      setFlow("login");
    }
  }

  function handleLoginComplete(name: string, email: string) {
    setUserName(name);
    setUserEmail(email);
    storage.setAuth({ name, email });
    const p = storage.getProfile();
    if (p) {
      setProfile(p);
      setFlow("app");
    } else {
      setFlow("onboarding");
    }
  }

  function handleOnboardingComplete(p: UserProfile) {
    storage.setProfile(p);
    setProfile(p);
    setFlow("app");
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

  function handleLogout() {
    storage.clearAuth();
    storage.setProfile({
      monthlyIncome: 0,
      fixedExpenses: 0,
      savingsGoal: 0,
      goalName: "",
      currentSavings: 0,
    });
    setProfile(null);
    setUserName("");
    setUserEmail("");
    setScreen("dashboard");
    setFlow("login");
  }

  // Splash screen
  if (flow === "splash") {
    return (
      <>
        <SplashScreen onComplete={handleSplashComplete} />
        <Toaster richColors position="top-center" />
      </>
    );
  }

  // Login screen
  if (flow === "login") {
    return (
      <div className="flex justify-center items-start min-h-screen bg-black">
        <div
          className="relative w-full max-w-[430px] min-h-screen overflow-hidden"
          style={{ boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}
        >
          <LoginScreen onComplete={handleLoginComplete} />
        </div>
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  // Onboarding
  if (flow === "onboarding" || !profile) {
    return (
      <div className="flex justify-center items-start min-h-screen bg-black">
        <div
          className="relative w-full max-w-[430px] min-h-screen bg-background overflow-hidden"
          style={{ boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}
        >
          <Onboarding onComplete={handleOnboardingComplete} />
        </div>
        <Toaster richColors position="top-center" />
      </div>
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
          style={{ paddingBottom: 80 }}
        >
          {screen === "dashboard" && (
            <Dashboard
              profile={profile}
              userName={userName}
              expenses={expenses}
              loans={loans}
              onAddExpense={goToAddExpense}
              theme={theme}
              onToggleTheme={toggleTheme}
              onNavigate={setScreen}
            />
          )}
          {screen === "insights" && (
            <AIInsightsScreen
              profile={profile}
              expenses={expenses}
              loans={loans}
              onNavigate={setScreen}
            />
          )}
          {screen === "expenses" && (
            <ExpensesScreen
              expenses={expenses}
              onAdd={handleAddExpense}
              onDelete={handleDeleteExpense}
              onNavigate={setScreen}
            />
          )}
          {screen === "history" && (
            <HistoryScreen
              expenses={expenses}
              onDelete={handleDeleteExpense}
              onNavigate={setScreen}
            />
          )}
          {screen === "goals" && (
            <GoalsScreen
              profile={profile}
              expenses={expenses}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
          {screen === "budget" && <BudgetPlannerScreen profile={profile} />}
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
          {screen === "profile" && (
            <ProfileScreen
              profile={profile}
              userName={userName || userEmail.split("@")[0]}
              userEmail={userEmail}
              theme={theme}
              onToggleTheme={toggleTheme}
              onNavigate={setScreen}
              onLogout={handleLogout}
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
