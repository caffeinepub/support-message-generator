export type Category = "Food" | "Travel" | "Shopping" | "Bills" | "Other";

export type LoanType = "Home" | "Car" | "Personal" | "Education" | "Other";

export interface UserProfile {
  monthlyIncome: number;
  fixedExpenses: number;
  savingsGoal: number;
  goalName: string;
  currentSavings: number;
}

export interface Expense {
  id: string;
  amount: number;
  note: string;
  category: Category;
  date: string; // YYYY-MM-DD
}

export interface Loan {
  id: string;
  name: string;
  lender: string;
  loanType: LoanType;
  principal: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  startDate: string;
  paidMonths: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: number;
}

export type Screen =
  | "dashboard"
  | "expenses"
  | "goals"
  | "chat"
  | "loans"
  | "insights"
  | "budget"
  | "profile";
