# POS System with Inventory & BIR Compliance 🇵🇭

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/Keshigami/POS-System)](https://github.com/Keshigami/POS-System/issues)
[![GitHub stars](https://img.shields.io/github/stars/Keshigami/POS-System)](https://github.com/Keshigami/POS-System/stargazers)
[![Documentation](https://img.shields.io/badge/docs-wiki-blue)](https://github.com/Keshigami/POS-System/wiki)

A modern, web-based Point of Sale (POS) system built specifically for Philippine businesses. This application combines robust inventory management, meal package creation, and BIR-compliant receipt generation in a sleek, user-friendly interface.

**📖 [View Full Documentation →](https://github.com/Keshigami/POS-System/wiki)**

## 🎥 Demo

<!-- markdownlint-disable-next-line MD033 -->
<video src="https://github.com/user-attachments/assets/38205206-8969-4156-8208-0927df73e870" controls="controls" style="max-width: 100%;">
</video>

> **Note**: If the video doesn't play above, you can [download the demo](https://github.com/Keshigami/POS-System/raw/main/demo/pos-demo.mp4).

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

### 🧠 True AI & Machine Learning

The system features **real machine learning models** powered by **TensorFlow.js**, moving beyond simple statistical rules:

- **Neural Network Forecasting** (Implemented ✅): LSTM (Long Short-Term Memory) models trained on historical sales data to predict future demand with high accuracy.
- **ML-Based Dynamic Pricing** (Implemented ✅): Regression neural networks that optimize prices based on stock levels, sales velocity, and time factors.
- **Smart Recommendations** (Rule-Based, ML Roadmap): Intelligent product suggestions based on cart context.
- **Voice Commands** (Roadmap): Hands-free POS operation.

> **Technical Note**: Models are trained on-device/server-side using `@tensorflow/tfjs-node`, allowing for continuous learning and privacy-preserving AI.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [SQLite](https://www.sqlite.org/) (via [Prisma ORM](https://www.prisma.io/))
- **AI/ML**: [TensorFlow.js](https://www.tensorflow.org/js) (Neural Networks)
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

```text
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

## 🗺️ Project Phases

This project follows a phased development approach to deliver value incrementally:

### ✅ Phase 1: Core POS Functionality (Completed)

- Basic point of sale operations
- Product management and inventory tracking
- Receipt generation with BIR compliance
- Payment processing (Cash, Card, E-Wallets)

### ✅ Phase 2: Enhanced Features (Completed)

- Package/meal combo creation
- Senior Citizen & PWD discount support
- Integration framework for payment gateways
- AI-powered smart product recommendations

### ✅ Phase 3: TRUE AI & Machine Learning (Completed)

- **Neural Network Forecasting** - LSTM model trained on historical sales data
- **ML-based Dynamic Pricing** - Regression neural network for price optimization  
- **TensorFlow.js Integration** - Real machine learning, not just statistics
- **Model Training Pipeline** - Train, evaluate, and persist models
- **Advanced Analytics** - Revenue trends, top products, peak hours analysis
- **Customer Insights** - Purchase pattern analysis with ML recommendations
- **Evaluation Metrics** - MAE, RMSE, MAPE for model accuracy
- **REST APIs** - `/api/analytics`, `/api/forecast`, `/api/ml/train`, `/api/insights`

> **Note**: This uses actual neural networks (LSTM + regression) that learn from data and improve over time, not simple rule-based logic.
>
> **🇵🇭 Localized Data**: The system includes a seed script (`prisma/seed-ph-data.ts`) to generate realistic Philippine market data (e.g., Pandesal, Lucky Me, GCash transactions) for testing the AI models.

### 📋 Phase 4: Cloud & Multi-Location (Planned)

- Cloud deployment options
- Multi-store support with centralized management
- Real-time synchronization across locations
- Mobile app for inventory management

### 🔮 Phase 5: Advanced Integrations (Future)

- Voice command support for hands-free operation
- Third-party accounting software integration (e.g., QuickBooks)
- Advanced delivery platform integrations
- Loyalty program management

## 🤝 How You Can Help

This is a community-driven project, and contributions are welcome! Here's how you can help:

### 🐛 Report Bugs

- Found an issue? [Open a GitHub issue](https://github.com/Keshigami/POS-System/issues)
- Include steps to reproduce, expected vs actual behavior, and screenshots if applicable

### 💡 Suggest Features

- Have an idea? Share it via [GitHub Discussions](https://github.com/Keshigami/POS-System/discussions)
- Describe the feature, use case, and potential implementation approach

### 👨‍💻 Contribute Code

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit with clear messages (`git commit -m 'Add amazing feature'`)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request with a detailed description

### 📚 Improve Documentation

- Help clarify the README or add guides
- Create video tutorials or walkthroughs
- Translate documentation to other Philippine languages (Tagalog, Cebuano, etc.)

### 🧪 Test & Provide Feedback

- Try the system in real-world scenarios
- Share your experience and suggestions
- Help identify edge cases or workflow improvements

### 💬 Spread the Word

- Star the repository on GitHub
- Share the project with Philippine SMEs who might benefit
- Write about your experience using the system

## ⚖️ Disclaimer

> [!IMPORTANT]
> **Community Contribution, Not Competition**
>
> This project is developed as an **open-source contribution to the Philippine business community**, particularly for small and medium enterprises (SMEs) who may not have access to expensive commercial POS solutions.
>
> **I do not intend to compete with established POS companies in the Philippines.** Instead, this project aims to:
>
> - Provide a **free, transparent alternative** for learning and experimentation
> - **Empower small businesses** with modern technology
> - **Foster innovation** in the local tech community
> - Serve as an **educational resource** for developers learning full-stack development
>
> If you represent a POS company and have concerns or would like to collaborate, please feel free to reach out. This project is built in the spirit of community support and knowledge sharing.

## 📄 License

This project is open-source and available for personal and commercial use.
