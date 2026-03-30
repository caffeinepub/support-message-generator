# AI Customer Support Agent

## Current State
The app has a Dashboard with a single "Orders Request" main tab containing order-scenario sub-tabs. The backend has a basic chat/session system. No inventory management exists.

## Requested Changes (Diff)

### Add
- New "Inventory" main tab in the Dashboard
- SKU input field where the user types a SKU and triggers a search
- Backend inventory store: a map of SKU -> unit count with pre-seeded sample data
- Backend query function: `checkInventory(sku: Text) -> ?Nat` (returns null if not found)
- Backend admin function: `addInventoryItem(sku: Text, units: Nat) -> Bool`
- Frontend result display: shows "Available - X units" in green if found, "Not Available" in red if not found
- Search button + Enter key support for triggering lookup

### Modify
- App.tsx: Add Inventory tab to DASH_TABS and render InventoryTab component
- backend/main.mo: Add inventory store and query/add functions

### Remove
- Nothing removed

## Implementation Plan
1. Update Motoko backend with inventory map, checkInventory query, addInventoryItem update
2. Seed a few sample SKUs (e.g. SKU-001, SKU-002, etc.) for demo
3. Create InventoryTab component with SKU input, search, and result display
4. Add Inventory tab to Dashboard in App.tsx
