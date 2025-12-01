# POS System with Inventory & BIR Compliance 🇵🇭

A modern, web-based Point of Sale (POS) system built specifically for Philippine businesses. This application combines robust inventory management, meal package creation, and BIR-compliant receipt generation in a sleek, user-friendly interface.

![POS System Demo](public/pos-demo.webp)

## 🚀 Key Features

### 🛒 Point of Sale (POS)
- **Fast Checkout**: Quick product selection and cart management.
- **Smart Search**: Instantly find products by name.
- **Discounts**: Built-in support for **Senior Citizen** and **PWD** discounts (20% + VAT exemption).
- **Payment Methods**: Support for Cash, Card, GCash, and Maya.

### 📦 Inventory Management
- **Product CRUD**: Add, edit, and delete products easily.
- **Stock Tracking**: Real-time inventory updates with low-stock warnings.
- **Categories**: Organize products for faster access.

### 🍱 Package Management
- **Meal Combos**: Create special deals (e.g., "Breakfast Meal", "Student Promo").
- **Flexible Pricing**: Set custom prices for packages independent of individual item costs.
- **Bundle Items**: Group multiple products into a single sellable unit.

### 🧾 BIR Compliance
- **Official Receipts**: Generates receipts with required BIR details.
- **Tax Breakdown**: Automatic calculation of VAT, Vatable Sales, and VAT Exempt sales.
- **Company Details**: Configurable TIN, Business Name, and Address on receipts.
- **Sequential Numbering**: Auto-incrementing Order/Receipt numbers.

### ⚙️ Integration Framework
- **Payment Gateways**: Configuration ready for **GCash**, **Maya**, and **PayMaya**.
- **Delivery Platforms**: Setup available for **GrabFood** and **foodpanda**.
- **Sandbox Mode**: Test integrations safely before going live.

### 🤖 AI Capabilities
- **Smart Recommendations** (Implemented ✅): Suggests add-ons based on current cart items (e.g., "Customer bought Coffee, suggest Pandesal").
- **Sales Forecasting** (Roadmap): Predict demand for specific days/times to optimize inventory.
- **Dynamic Pricing** (Roadmap): AI-driven price adjustments for meal packages based on popularity and stock levels.
- **Voice Commands** (Roadmap): Hands-free POS operation for busy staff.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [SQLite](https://www.sqlite.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites
- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **Git** installed ([Download](https://git-scm.com/))
- A code editor like **VS Code** (Recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Keshigami/POS-System.git
   cd pos-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Database**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open the App**
   Visit `http://localhost:3000` in your browser.

### Default Login
- **PIN**: `1234`

## 📖 Usage Guide

### Making a Sale
1. **Add Items**: Click on product cards or use the search bar to find items.
2. **AI Suggestions**: Watch for the "Smart Suggestions" box below the cart – click the **+** button to add recommended items instantly.
3. **Checkout**: Click "Charge" to proceed.
4. **Payment**: Select Cash, Card, or E-Wallet.
   - For **Cash**: Enter the amount received.
   - For **E-Wallets**: Select the provider (GCash/Maya).
5. **Discounts**: Select "Senior Citizen" or "PWD" to apply the 20% discount + VAT exemption.
6. **Complete**: Click "Pay" to finalize and print the receipt.

### Managing Inventory
1. Click the **Package Icon** (📦) in the header.
2. **Products Tab**: Add new items, update prices, or check stock levels.
3. **Packages Tab**: Create meal combos (e.g., "Breakfast Meal").
   - Click "New Package".
   - Select items to bundle.
   - Set a special package price.

### Configuring Settings & Integrations
1. Click the **Gear Icon** (⚙️) in the header.
2. **Payment Gateways**:
   - Toggle **GCash** or **Maya**.
   - Enter your API Keys (or use mock keys for testing).
   - Switch between **Sandbox** (Test) and **Live** modes.
3. **Delivery Platforms**:
   - Enable **GrabFood** or **foodpanda**.
   - Configure store IDs and webhook secrets.

## 📂 Project Structure

```
/app
  /api          # Backend API routes (Next.js Route Handlers)
  /inventory    # Inventory management page
  /settings     # Integration settings page
  /transactions # Transaction history page
  page.tsx      # Main POS interface
/components
  /ui           # Reusable UI components (shadcn)
  Receipt.tsx   # Receipt generation component
/prisma
  schema.prisma # Database schema
  seed.ts       # Initial data seeding
/lib            # Utility functions and Prisma client
```

## 📄 License

This project is open-source and available for personal and commercial use.
