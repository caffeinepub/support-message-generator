# AI Expense Pro – Backend Integration

## Current State
- All expense/profile/loan data is stored in browser `localStorage` only.
- The Motoko backend has: chat sessions, inventory management.
- No expense or user-profile data is persisted to the backend canister.
- Dashboard, History, and Expenses screens all read from `localStorage` via the `storage` helper.

## Requested Changes (Diff)

### Add
- Backend: `addExpense(category, amount, notes, date)` → returns the saved `Expense` record with a server-generated ID.
- Backend: `getExpenses()` → returns all expenses for the current caller as an array.
- Backend: `deleteExpense(id)` → removes an expense by ID.
- Backend: `saveProfile(monthlyIncome, fixedExpenses, savingsGoal, goalName, currentSavings)` → persists user profile.
- Backend: `getProfile()` → retrieves caller's profile.
- Frontend: A `useBackendSync` hook (or inline logic in App.tsx) that:
  - On mount, fetches expenses from backend and merges with localStorage (backend is source of truth).
  - On `handleAddExpense`: first updates React state + localStorage (optimistic), then calls backend `addExpense` and reconciles ID.
  - On `handleDeleteExpense`: updates state + localStorage optimistically, then calls backend `deleteExpense`.
- Frontend: `Dashboard` receives real expense data (already does, via props — no change needed).
- Frontend: `HistoryScreen` receives real expense data (already does, via props — no change needed).

### Modify
- `App.tsx`: Add backend sync on mount (fetch expenses from backend, set as state). Add async backend calls in `handleAddExpense` and `handleDeleteExpense`.
- `storage.ts`: No structural changes. Continues to serve as fast local cache.
- `main.mo`: Add `Expense` type, per-user expense store (Map of caller → List<Expense>), and CRUD functions for expenses. Add `UserProfile` type and per-user profile store.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `src/backend/main.mo`:
   - Add `Expense` type: `{ id: Text; category: Text; amount: Float; notes: Text; date: Text }`
   - Add `UserProfile` type mirroring frontend types
   - Add `expenses` Map: Principal → List<Expense>
   - Add `profiles` Map: Principal → UserProfile
   - Implement `addExpense`, `getExpenses`, `deleteExpense`, `saveProfile`, `getProfile`
2. Generate Motoko code and updated `backend.d.ts` bindings.
3. Update `App.tsx`:
   - Import `useActor` hook for backend calls
   - On mount (after `flow === 'app'`): call `backend.getExpenses()`, convert to frontend `Expense[]`, merge into state
   - Wrap `handleAddExpense` to also call `backend.addExpense(...)` after optimistic update
   - Wrap `handleDeleteExpense` to also call `backend.deleteExpense(id)` after optimistic update
4. Keep all screens unchanged — they receive data via props.
