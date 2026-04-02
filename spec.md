# AI Cash Manager

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- User onboarding flow: collect monthly income, fixed expenses, savings goal
- Dashboard: total balance, today's spending limit, monthly budget overview, savings progress bar
- Expense tracking: manual add form, auto-categorization (Food, Travel, Shopping, Bills)
- AI Budget Engine: calculate daily spending limit = (income - fixed expenses - savings goal) / days in month; adjust next day's limit if overspent today
- Smart Alerts: in-app notifications for overspending, low balance, high category spending
- Goal System: user sets a savings goal, shows daily/monthly savings needed
- AI Assistant Chat: simple rule-based chat that answers questions like "Can I spend ₹500 today?" and "How to save more?"
- Financial Health Score (0-100): calculated from savings %, spending discipline, budget adherence
- Dark/Light mode toggle

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Backend: store user profile (income, fixed expenses, savings goal), expenses (amount, category, date, note), and compute budget stats
2. Frontend: onboarding screen → main dashboard with bottom nav (Dashboard, Expenses, Goals, Chat, Score)
3. Dashboard tab: balance card, daily limit card, budget ring, savings progress
4. Expenses tab: add expense form with category picker, expense list
5. Goals tab: goal card with progress, daily/monthly savings needed
6. Chat tab: AI assistant with rule-based financial advice
7. Health Score tab: score gauge with breakdown
8. Alerts: banner notifications shown when thresholds crossed
9. Dark/light mode via CSS variables
