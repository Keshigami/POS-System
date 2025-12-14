# BIR Compliance

Understanding the Bureau of Internal Revenue (BIR) compliance features in the POS System.

## Overview

The POS System automatically generates BIR-compliant receipts that meet Philippine tax regulations. This ensures your business follows the law and avoids penalties.

## What is BIR Compliance?

The Bureau of Internal Revenue (BIR) requires all businesses in the Philippines to:

1. Issue **Official Receipts (OR)** or **Sales Invoices** for every transaction
2. Show proper **VAT breakdown** on receipts
3. Display business **TIN** and registration details
4. Maintain **sequential numbering** of receipts

This POS system handles all of these requirements automatically.

## Required Information on Receipts

### Business Details

Every receipt includes:

- **Business Name**: Your registered business name
- **TIN**: Tax Identification Number
- **Address**: Business location
- **Contact**: Phone number or email

These are configured in **Settings** → **Business Information**.

### Transaction Details

Each receipt shows:

- **Order Number**: Sequential, auto-incrementing (e.g., #000001, #000002)
- **Date & Time**: When the transaction occurred
- **Cashier/User**: Who processed the sale
- **Payment Method**: Cash, Card, GCash, Maya, etc.

### Itemized List

- Product names and quantities
- Individual prices
- Subtotals for each line item

### Tax Breakdown

The system automatically calculates and displays:

| Field | Description | Calculation |
|-------|-------------|-------------|
| **Vatable Sales** | Taxable amount before VAT | Total ÷ 1.12 |
| **VAT (12%)** | Value-Added Tax | Vatable Sales × 0.12 |
| **VAT Exempt** | Sales exempt from VAT (e.g., SC/PWD discounts) | If discount applied |
| **Total** | Final amount to pay | Vatable Sales + VAT - Discounts |

## VAT Calculation Example

### Regular Sale (No Discount)

**Cart Total**: ₱224.00

```
Vatable Sales:  ₱224.00 ÷ 1.12 = ₱200.00
VAT (12%):      ₱200.00 × 0.12  = ₱24.00
Total:          ₱224.00
```

### Senior Citizen / PWD Discount

**Cart Total (before discount)**: ₱224.00  
**Discount**: 20% + VAT Exemption

```
Subtotal:        ₱224.00
SC/PWD Discount: ₱224.00 × 0.20 = ₱44.80
VAT Exempt:      ₱224.00 - ₱44.80 = ₱179.20
Total:           ₱179.20
```

> [!IMPORTANT]
> Under Philippine law, Senior Citizens and PWDs are entitled to:
>
> - **20% discount** on goods and services
> - **VAT exemption** on the discounted amount
>
> The system applies both automatically when you select the discount type.

## Receipt Format

Here's what a BIR-compliant receipt looks like:

```
═══════════════════════════════════════
        KESHIGAMI FOOD STORE
    123 Main St, Quezon City, Metro Manila
         TIN: 123-456-789-000
           Tel: 0912-345-6789
═══════════════════════════════════════

Order #000042
Date: 2025-12-01 13:45:32
Cashier: Admin
Payment: GCash

───────────────────────────────────────
ITEM                    QTY   AMOUNT
───────────────────────────────────────
Coffee                   2    ₱130.00
Pandesal                 3     ₱45.00
Rice Meal                1     ₱85.00
───────────────────────────────────────

Subtotal:                     ₱260.00
Discount (Senior Citizen):    ₱52.00
───────────────────────────────────────

Vatable Sales:                ₱185.71
VAT (12%):                    ₱22.29
VAT Exempt:                   ₱208.00
───────────────────────────────────────
TOTAL:                        ₱208.00
Amount Paid:                  ₱300.00
Change:                       ₱92.00
───────────────────────────────────────

THIS SERVES AS YOUR OFFICIAL RECEIPT

Thank you for your business!
═══════════════════════════════════════
```

## Configuring Business Information

To ensure BIR compliance, you must configure your business details:

1. Click **⚙️ Settings** in the header
2. Go to **Business Information**
3. Fill in all required fields:
   - Business Name
   - TIN (format: XXX-XXX-XXX-XXX)
   - Complete Address
   - Contact Number

> [!WARNING]
> Using incorrect or fake TIN information is illegal. Always use your actual BIR-registered details.

## Sequential Receipt Numbering

The system maintains a sequential order number for all transactions:

- Starts at **#000001**
- Auto-increments with each sale
- Cannot be skipped or duplicated

This is stored in the database and persists across sessions.

## Receipt Storage

All receipts are:

- ✅ Stored in the database permanently
- ✅ Viewable in **Transaction History**
- ✅ Exportable as CSV for accounting
- ✅ Printable or downloadable as PDF

## BIR Registration Requirements

> [!NOTE]
> While this POS system generates BIR-compliant receipts, you are still responsible for:
>
> 1. **Registering your business** with the BIR
> 2. Obtaining a **TIN** (Tax Identification Number)
> 3. Filing **monthly and quarterly tax returns**
> 4. Keeping physical or digital copies of receipts for **5 years**
>
> This software does NOT replace proper BIR registration and compliance obligations.

## Audit Trail

For BIR audit purposes, the system maintains:

- Complete transaction history with timestamps
- User who processed each transaction
- Payment method used
- Discount applications with justification

All data is stored securely in the database.

## Exporting Data for BIR

To generate reports for BIR filing:

1. Go to **Transactions**
2. Set the date range (e.g., monthly)
3. Click **"Export CSV"**
4. Use the CSV file for your accountant or BIR submissions

The export includes:

- Order numbers
- Dates and times
- Item details
- Tax breakdowns
- Payment methods

## Common BIR Compliance Questions

### Q: Do I need to register this POS with BIR?

**A**: Currently, BIR requires registration of electronic cash registers (ECRs) and POS systems. Consult with your BIR Revenue District Office (RDO) for specific requirements. This software can generate the necessary documentation.

### Q: Can I use this for BIR audits?

**A**: Yes, the system maintains all required transaction records. However, ensure you also keep backups and follow BIR's record retention policies (5 years minimum).

### Q: What if I make a mistake on a receipt?

**A**: The system does not allow editing completed transactions to maintain audit integrity. If you need to void a sale, contact BIR for proper procedures or implement a refund/return process.

### Q: Are digital receipts BIR-compliant?

**A**: Yes, BIR recognizes electronic receipts if they contain all required information. You can email PDF receipts to customers or print them.

---

## Resources

- **BIR Official Website**: [bir.gov.ph](https://www.bir.gov.ph)
- **BIR Hotline**: 8538-3200
- **Revenue Regulations**: Check RR 18-2012 and RR 5-2014 for POS requirements

---

**Next**: Learn about [AI Smart Recommendations](AI-Smart-Recommendations) →
