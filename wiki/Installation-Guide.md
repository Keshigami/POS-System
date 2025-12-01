# Installation Guide

This guide will walk you through setting up the POS System on your local machine or server.

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Download Link |
|-------------|---------|---------------|
| **Node.js** | 18.0 or higher | [nodejs.org](https://nodejs.org/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **Code Editor** | Any (VS Code recommended) | [code.visualstudio.com](https://code.visualstudio.com/) |

### Verifying Prerequisites

Run these commands to verify your installations:

```bash
node --version   # Should show v18.0.0 or higher
npm --version    # Should show 8.0.0 or higher
git --version    # Should show git version 2.x.x
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Keshigami/POS-System.git
cd POS-System/pos-app
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Prisma, Tailwind CSS, and other dependencies.

### 3. Setup Database

The system uses SQLite with Prisma ORM. Initialize and seed the database:

```bash
# Push the schema to the database
npx prisma db push

# Seed with sample data
npx prisma db seed
```

> [!NOTE]
> The seed command will create:
>
> - Sample products (Coffee, Pandesal, Rice Meals, etc.)
> - Sample packages (Breakfast Combo, Student Meal)
> - Default user with PIN `1234`
> - Sample transaction history

### 4. Environment Configuration (Optional)

For advanced configurations, create a `.env` file in the root directory:

```env
# Database (SQLite by default)
DATABASE_URL="file:./prisma/dev.db"

# Payment Gateway API Keys (for testing)
GCASH_API_KEY="test_gcash_key"
MAYA_API_KEY="test_maya_key"

# Delivery Platform Credentials
GRABFOOD_STORE_ID="your_store_id"
FOODPANDA_WEBHOOK_SECRET="your_secret"
```

> [!TIP]
> You can skip environment variables for local testing. The system will work with default settings.

### 5. Start the Development Server

```bash
npm run dev
```

You should see output like:

```
> pos-app@0.1.0 dev
> next dev

   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Ready in 2.3s
```

### 6. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the POS interface. The default PIN is **1234**.

## Post-Installation Setup

### Configure Business Details

1. Click the **Settings** icon (⚙️) in the header
2. Update your business information:
   - Business Name
   - TIN (Tax Identification Number)
   - Address
   - Contact Information

These details will appear on receipts for BIR compliance.

### Add Your Products

1. Click the **Inventory** icon (📦)
2. Go to the **Products** tab
3. Click **Add Product** and fill in:
   - Product name
   - Price
   - Stock quantity
   - Category

### Test the System

1. Add items to cart on the POS page
2. Click **Charge** to proceed to checkout
3. Select a payment method and complete the transaction
4. Verify the receipt displays correctly

## Production Deployment

For production deployment, see our [Deployment Guide](Deployment-Guide) (coming soon).

### Quick Production Build

```bash
# Build the production bundle
npm run build

# Start the production server
npm start
```

## Troubleshooting

### Issue: `Command not found: prisma`

**Solution**: Ensure dependencies are installed:

```bash
npm install
```

### Issue: Database connection error

**Solution**: Delete the database and reinitialize:

```bash
rm prisma/dev.db
npx prisma db push
npx prisma db seed
```

### Issue: Port 3000 already in use

**Solution**: Either:

- Stop the process using port 3000
- Or run on a different port:

  ```bash
  PORT=3001 npm run dev
  ```

For more issues, see the [Troubleshooting](Troubleshooting) page.

## Next Steps

- 📖 Read the [User Guide](User-Guide) to learn how to use the system
- 🤖 Explore [AI Smart Recommendations](AI-Smart-Recommendations)
- 💳 Set up [Payment Integration](Payment-Integration)
- 👨‍💻 Check the [Developer Guide](Architecture-Overview) if you want to contribute

---

Need help? [Open an issue on GitHub](https://github.com/Keshigami/POS-System/issues) or check our [FAQ](Troubleshooting#faq).
