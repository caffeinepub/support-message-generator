# AI Expense Pro

## Current State
- `src/frontend/src/screens/Expenses.tsx` — Add expense form with category picker, expense list grouped by date. No animations, no success state, no history tab.
- `src/frontend/src/types/index.ts` — Screen type includes `expenses` but no `history` screen.
- `src/frontend/src/components/BottomNav.tsx` — Left: Home, Insights. Center: Add (+). Right: Goals, Profile. No History tab.
- `src/frontend/src/App.tsx` — Routes to `expenses` screen for the add form. No History screen.
- `src/frontend/src/index.css` — Has `shimmer`, `slideUpCard` keyframes. No `bounce-in` or success tick keyframes.

## Requested Changes (Diff)

### Add
- Input field expand-on-focus: scale up slightly + border glow when focused
- Category icon bounce animation when selected
- Save button pulse animation when form is "ready" (amount > 0 filled)
- Success tick overlay animation after save, then auto-navigate to dashboard (after ~1.2s)
- New `HistoryScreen` component (`src/frontend/src/screens/HistoryScreen.tsx`) with:
  - Search bar (filter by note/category text)
  - Filter button that opens filter panel
  - Date range filter (from/to date)
  - Category filter (multi-select chips)
  - Transaction list with card-style items (icon, title, date, amount)
  - Empty state
- `history` added to `Screen` type in types/index.ts
- History tab added to BottomNav (replace Goals or add as 5th tab — use History icon, place it where Goals is, move Goals to profile area or keep 5 tabs)
- App.tsx wired to render HistoryScreen

### Modify
- `Expenses.tsx`: Add focus expand, category bounce, save button pulse, success tick overlay + onNavigate prop
- `types/index.ts`: Add `"history"` to Screen union
- `BottomNav.tsx`: Add History tab — use `ClockIcon` or `Receipt` icon. Keep 4 nav items + center FAB. Replace the Goals slot with History; move Goals to be navigable from Profile or keep all 5 with smaller icons.
- `App.tsx`: Wire `history` screen, pass `onNavigate` to ExpensesScreen

### Remove
- Nothing removed

## Implementation Plan
1. Update `types/index.ts`: add `"history"` to Screen union
2. Enhance `Expenses.tsx`:
   - Accept `onNavigate: (s: Screen) => void` prop
   - Input focus: add `onFocus`/`onBlur` state per field to apply `scale-[1.01] ring-2 ring-primary/40` transition
   - Category select: add `selectedCat` bounce — when category changes, apply a `animate-bounce-in` class for 300ms then remove it (via setTimeout + state)
   - Save button: pulse class when `amount` is non-empty and valid (≥1 char)
   - On submit success: set `showSuccess = true`, show fullscreen/overlay tick animation for 1.1s, then call `onNavigate("dashboard")`
3. Add keyframes to `index.css`: `bounceIn` for category icon pop, `successPop` for tick
4. Create `src/frontend/src/screens/HistoryScreen.tsx`:
   - Props: `expenses: Expense[], onNavigate: (s: Screen) => void`
   - State: `search`, `showFilters`, `fromDate`, `toDate`, `selectedCategories`
   - Filter logic: filter expenses by search text, date range, categories
   - UI: header, search bar with filter button, collapsible filter panel, sorted transaction card list
5. Update `BottomNav.tsx`: add History tab (use `Receipt` from lucide). Layout: Home | History | [+] | Goals | Profile
6. Update `App.tsx`: import HistoryScreen, render on `screen === "history"`, pass `onNavigate` to ExpensesScreen
