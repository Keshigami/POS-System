# POS System Enhancement Plan

## 🚀 High Priority (Core Retail Operations)

### 1. Shift Management (X-Reading/Z-Reading) <!-- id: shift-mgmt -->

Real POS systems require cash control.

- [ ] Create `Shift` model (id, userId, storeId, startCash, endCash, startTime, endTime, status).
- [ ] Implement "Open Shift" modal at login.
- [ ] Implement "Close Shift" (Z-Reading) with cash reconciliation report.
- [ ] Print Z-Reading implementation.

### 2. Order Parking / Holding <!-- id: order-hold -->

Essential for busy queues when a customer forgets an item.

- [ ] Add "Hold Order" button in Cart.
- [ ] Create `HeldOrder` model or add `status="HELD"` to Order.
- [ ] UI to view and restore held orders.

### 3. Split Payments <!-- id: split-pay -->

Customers often pay with mixed methods (e.g., Cash + GCash).

- [ ] Update `Order` model to support multiple `Payment` records instead of single fields.
- [ ] Create `Payment` model (id, orderId, method, amount, reference).
- [ ] Update Checkout UI to allow adding multiple payment types until Total is covered.

### 4. Returns & Refunds <!-- id: returns -->

- [ ] Implement Refund logic (create negative Order or `Refund` model).
- [ ] Add "Refund" button in Transaction History.
- [ ] Update Inventory stock on refund.

## 📦 Inventory & Products

### 5. Product Variants & Modifiers <!-- id: variants -->

"Coffee" needs sizes (S/M/L) and add-ons (Sugar/Milk) without creating separate products for every combo.

- [ ] Create `ProductVariant` model (name, priceAdjustment, stock).
- [ ] Create `ModifierGroup` and `Modifier` models.
- [ ] Update POS UI to show variant selector on product click.

### 6. Barcode Scanning Support <!-- id: barcode -->

- [ ] Add `barcode` field to Product.
- [ ] Implement global key listener in `page.tsx` to detect barcode scanner input (usually fast keyboard input ending in Enter).
- [ ] Auto-add items to cart on scan.

## 👥 Customer & Loyalty (CRM)

### 7. Customer Profiles <!-- id: crm -->

- [ ] Create `Customer` model (name, phone, email, points).
- [ ] Add "Select Customer" feature in Checkout.
- [ ] Implement simple points system logic (e.g., 1 point per ₱100).

## 🎨 UI/UX "Easiest Interface" Improvements

### 8. Touch-Optimized Layout <!-- id: ui-touch -->

- [ ] **Bigger Touch Targets**: Ensure all buttons are at least 48px height.
- [ ] **Numpad Modal**: For cash input, obscure keyboard is annoying. specific on-screen numpad is better.
- [ ] **Mobile View**: Stack cart at bottom as a "drawer" on small screens instead of sidebar.

### 9. Speed Improvements

- [ ] **Optimistic UI**: Update cart immediately before API return.
- [ ] **Keyboard Shortcuts**: F1 for Search, F12 for Checkout, ESC to clear.

## 🛠 Technical Tasks

- [ ] **Offline Sync Queue**: If API fails, store order in `localStorage` and retry when online.
- [ ] **Receipt Thermal Printing**: Integrate with WebUSB or ESC/POS library for raw printing (if requested) or optimize CSS for `@media print`.
