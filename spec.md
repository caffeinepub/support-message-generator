# AI Cash Manager – Loan Manager Feature

## Current State
App has: Dashboard, Expenses, Goals, Chat, Score screens. No loan tracking exists. UserProfile and Expense types are defined in types/index.ts. Storage uses localStorage. Engine has financial calculation helpers.

## Requested Changes (Diff)

### Add
- `Loan` type in types/index.ts with fields: id, name (loan name), lender, principal, interestRate (% p.a.), tenureMonths, emiAmount, startDate, remainingMonths, loanType (Home/Car/Personal/Education/Other)
- `"loans"` screen to Screen type union
- Loan storage helpers (getLoans / setLoans) in storage.ts
- Loan calculation helpers in engine.ts: totalInterest, totalPayable, amountPaid, amountRemaining, progressPct, monthlyInterestBurden
- New `LoanScreen` component: add loan form, list of active loans with progress, per-loan AI suggestion card (avalanche vs snowball strategy, prepayment tips, interest saved if prepaid)
- Loan summary card on Dashboard showing total EMI burden and total outstanding
- BottomNav: replace "Score" with "Loans" tab (Landmark icon), keep Score accessible via Dashboard link or add back in later
- Actually: ADD "Loans" tab alongside existing 5 tabs (use BanknoteIcon), keep all existing tabs intact; since space is tight, replace "Score" tab with "Loans" and add Score access from Dashboard
- ChatScreen AI: add loan-related responses for queries like "my loans", "how to repay faster", "loan burden", "emi"

### Modify
- `types/index.ts` – add Loan interface, add "loans" to Screen type
- `lib/storage.ts` – add LOANS key, getLoans/setLoans methods
- `lib/engine.ts` – add loan calculation functions
- `lib/chatAI.ts` – add loan query handling
- `components/BottomNav.tsx` – add Loans tab (replace Score with Loans, Score moved to link in screen)
- `App.tsx` – add loans state, handleAddLoan, handleDeleteLoan, wire LoanScreen
- `screens/Dashboard.tsx` – add loan burden summary card

### Remove
- Nothing removed

## Implementation Plan
1. Update types/index.ts with Loan interface and updated Screen type
2. Update lib/storage.ts with loan persistence
3. Update lib/engine.ts with loan math helpers
4. Create src/frontend/src/screens/LoanScreen.tsx
5. Update BottomNav to include Loans tab (swap Score for Loans; Score still works)
6. Update App.tsx to add loans state and LoanScreen rendering
7. Update Dashboard.tsx to show loan burden summary
8. Update lib/chatAI.ts to handle loan queries
