import { Toaster } from "@/components/ui/sonner";
import { Principal } from "@icp-sdk/core/principal";
import { useEffect, useRef, useState } from "react";
import type { Expense as BackendExpense } from "./backend.d.ts";
import BottomNav from "./components/BottomNav";
import Onboarding from "./components/Onboarding";
import { useActor } from "./hooks/useActor";
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
import type {
  Category,
  ChatMessage,
  Expense,
  Loan,
  Screen,
  UserProfile,
} from "./types";

type AppFlow = "splash" | "login" | "onboarding" | "app";

// Convert backend expense shape to frontend Expense shape.
// Backend: { id, date, notes, timestamp, category, amount }
// Frontend: { id, amount, note, category, date }
function backendToFrontend(e: BackendExpense): Expense {
  return {
    id: e.id,
    amount: e.amount,
    note: e.notes,
    category: (e.category as Category) || "Other",
    date: e.date,
  };
}

const ANON_PRINCIPAL = Principal.anonymous();

export default function App() {
  const { actor } = useActor();

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
  const [transitionKey, setTransitionKey] = useState(0);
  const prevScreenRef = useRef<Screen>("dashboard");

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

  // Sync expenses and profile from backend when actor is ready and app is in flow
  useEffect(() => {
    if (flow !== "app" || !actor) return;
    void (async () => {
      try {
        const [backendExpenses, backendProfile] = await Promise.all([
          actor.getExpenses(ANON_PRINCIPAL),
          actor.getProfile(ANON_PRINCIPAL),
        ]);
        const converted = backendExpenses.map(backendToFrontend);
        if (converted.length > 0) {
          setExpenses(converted);
          storage.setExpenses(converted);
        }
        if (backendProfile) {
          setProfile(backendProfile);
          storage.setProfile(backendProfile);
        }
      } catch {
        // Silently fall back to localStorage cache
      }
    })();
  }, [flow, actor]);

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
    if (actor) {
      void actor
        .saveProfile(
          ANON_PRINCIPAL,
          p.monthlyIncome,
          p.fixedExpenses,
          p.savingsGoal,
          p.goalName,
          p.currentSavings,
        )
        .catch(() => {});
    }
  }

  function handleUpdateProfile(p: UserProfile) {
    storage.setProfile(p);
    setProfile(p);
    if (actor) {
      void actor
        .saveProfile(
          ANON_PRINCIPAL,
          p.monthlyIncome,
          p.fixedExpenses,
          p.savingsGoal,
          p.goalName,
          p.currentSavings,
        )
        .catch(() => {});
    }
  }

  function handleAddExpense(e: Omit<Expense, "id">) {
    // Optimistic update with a temporary local ID
    const tempId = `tmp_${Date.now()}`;
    const newExpense: Expense = { ...e, id: tempId };
    const optimistic = [newExpense, ...expenses];
    setExpenses(optimistic);
    storage.setExpenses(optimistic);

    // Background sync — swap temp ID with server-assigned ID on success
    if (actor) {
      void actor
        .addExpense(ANON_PRINCIPAL, e.category, e.amount, e.note, e.date)
        .then((saved) => {
          setExpenses((prev) => {
            const updated = prev.map((x) =>
              x.id === tempId ? { ...x, id: saved.id } : x,
            );
            storage.setExpenses(updated);
            return updated;
          });
        })
        .catch(() => {});
    }
  }

  function handleDeleteExpense(id: string) {
    // Optimistic delete
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    storage.setExpenses(updated);

    if (actor) {
      void actor.deleteExpense(ANON_PRINCIPAL, id).catch(() => {});
    }
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
    setTransitionKey((k) => k + 1);
  }

  function handleNavigate(s: Screen) {
    if (s !== screen) {
      prevScreenRef.current = screen;
      setScreen(s);
      setTransitionKey((k) => k + 1);
    }
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

  if (flow === "splash") {
    return (
      <>
        <SplashScreen onComplete={handleSplashComplete} />
        <Toaster richColors position="top-center" />
      </>
    );
  }

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
        <main
          className="flex-1 overflow-y-auto scrollbar-none"
          style={{ paddingBottom: 80 }}
        >
          <div
            key={transitionKey}
            style={{
              animation:
                "screenSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
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
                onNavigate={handleNavigate}
              />
            )}
            {screen === "insights" && (
              <AIInsightsScreen
                profile={profile}
                expenses={expenses}
                loans={loans}
                onNavigate={handleNavigate}
              />
            )}
            {screen === "expenses" && (
              <ExpensesScreen
                expenses={expenses}
                onAdd={handleAddExpense}
                onDelete={handleDeleteExpense}
                onNavigate={handleNavigate}
              />
            )}
            {screen === "history" && (
              <HistoryScreen
                expenses={expenses}
                onDelete={handleDeleteExpense}
                onNavigate={handleNavigate}
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
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
          </div>
        </main>

        <BottomNav active={screen} onChange={handleNavigate} />

        <Toaster richColors position="top-center" />
      </div>
    </div>
  );
}
