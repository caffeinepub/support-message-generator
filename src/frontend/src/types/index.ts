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
  name: string; // e.g. "Home Loan"
  lender: string; // e.g. "HDFC Bank"
  loanType: LoanType;
  principal: number; // original loan amount
  interestRate: number; // % per annum
  tenureMonths: number; // total tenure
  emiAmount: number; // monthly EMI
  startDate: string; // YYYY-MM-DD
  paidMonths: number; // how many EMIs paid so far
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: number;
}

export type Screen = "dashboard" | "expenses" | "goals" | "chat" | "loans";
