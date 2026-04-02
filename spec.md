# AI Expense Pro

## Current State
Full CRED-style dark fintech app with:
- Bottom nav (Dashboard, History, Goals, Profile) + center FAB
- Dashboard: animated balance count-up, donut/bar charts, shimmer loading, stat cards
- Add Expense screen with category icons, success tick overlay
- History screen: search, filters, grouped by date
- Profile screen: avatar card, settings rows, dark mode toggle
- Screen transition animation (`screenSlideIn` keyframe on `key={transitionKey}` wrapper)
- BottomNav with glow pill on active tab, vibration, FAB pulse
- Keyframes: `screenSlideIn`, `tabGlowIn`, `tabIndicatorIn`, `fabPulse`, `shimmer`, `fadeSlideUp`, `slideUpCard`, `bounceIn`, `pulseGlow`, `successPop`, `checkDraw`

## Requested Changes (Diff)

### Add
- **Ripple effect** on every tappable button (thin expanding ring, CSS-only via a shared `.ripple` utility + JS click handler injected via a custom `useRipple` hook)
- **Haptic feedback** via `navigator.vibrate` on all interactive button taps (already on BottomNav, needs to extend to form buttons, expense cards, delete buttons)
- **Skeleton loaders** for screens that load data: History screen and Goals screen — show shimmer skeleton cards while loading (500ms delay like Dashboard)
- **Empty state illustrations** — replace plain emoji with a proper SVG illustration + descriptive subtext on: Dashboard (no transactions), History (no results), Expenses (no recent), Goals (no goal set)
- **Dynamic dashboard color theming** based on financial state:
  - Saving well (savings% >= 60 or daily spend < 50% limit): hero card uses blue-green gradient, stat cards tinted green
  - Overspending (today spent > daily limit OR balance < 20% budget): hero card shifts to red-orange, AI suggestion card border turns red, stat cards get red tint
  - Neutral: current blue-purple gradient
- **Dynamic color signals throughout**:
  - Budget progress bar: green when < 60% used, amber 60–85%, red > 85%
  - Daily spending card: already has red on overspend — add animated pulse border when overspending
  - Savings card: green glow when savings% >= 80%
  - Health score color: green ≥70, amber 40–69, red <40

### Modify
- `index.css`: add `.ripple-container` (position:relative, overflow:hidden), `.ripple-wave` keyframe (scale 0→4, opacity 0.3→0)
- `Dashboard.tsx`: implement dynamic color state (`financialMood`: 'healthy' | 'neutral' | 'danger'), pass mood-derived gradients to hero card and stat cards; update budget bar color dynamically; add pulse border to today's spending card when overspending
- `HistoryScreen.tsx`: add 500ms skeleton loading state with shimmer cards before rendering list
- `Goals.tsx`: add skeleton loader + improved empty state SVG
- All screens: wrap primary action buttons with ripple + haptic

### Remove
- Nothing removed

## Implementation Plan
1. Add `useRipple` hook in `src/frontend/src/hooks/useRipple.ts` — returns a `handleRipple` function and `rippleElements` JSX; inject ripple on mousedown/touchstart
2. Add `.ripple-container`, `@keyframes rippleWave` to `index.css`
3. Update `Dashboard.tsx`:
   - Compute `financialMood` from `todaySpent`, `dailyLimit`, `balance`, `budget`, `savingsPct`
   - Use mood to pick hero gradient, accent colors, stat card gradients
   - Add pulsing red border on Today card when overspending
   - Dynamic budget bar color
   - Green glow on savings card when on track
   - Replace empty transactions emoji with inline SVG illustration
4. Update `HistoryScreen.tsx`: add 500ms `isLoading` state with shimmer skeleton rows; improved empty state SVG
5. Update `Goals.tsx`: skeleton loader + improved empty state
6. Update `Expenses.tsx`: improved empty state SVG for the "no expenses" state
7. Add haptic to key buttons in `Expenses.tsx` (save button, delete), `HistoryScreen.tsx` (delete, filter), `ProfileScreen.tsx` (logout, settings rows)
