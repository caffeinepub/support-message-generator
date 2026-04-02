# AI Expense Pro

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- New full-stack app: AI Expense Pro (AI Cash Manager)
- Bottom Navigation Bar with 4 tabs: Dashboard, Add Expense (floating center button), History, Profile
- Dashboard screen: total balance, spending overview, AI insights card, expense category breakdown
- Add Expense screen: amount input, category selector, notes, AI auto-categorization, save with animation
- History screen: chronological expense list, filter by date/category, totals summary
- Profile screen: user info, monthly income/goal settings, dark mode toggle, stats
- Backend: expense CRUD, user profile storage, category management, monthly summaries
- Dark mode default with CRED-like fintech premium aesthetic

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend (Motoko): User profile, expenses (CRUD), categories, monthly summary queries
2. Frontend: Mobile-first single-page app with bottom nav, 4 main screens
   - Dashboard: balance card, spending ring/chart, AI suggestion card, recent expenses
   - Add Expense: modal/sheet with amount, category picker, notes, save
   - History: filterable list view, totals
   - Profile: user settings, income/goal input
3. Design: Deep navy background (#070B1A), glassmorphism cards, teal/indigo accents, rounded corners, soft shadows
4. Responsive mobile-first layout constrained to ~390px max-width centered
