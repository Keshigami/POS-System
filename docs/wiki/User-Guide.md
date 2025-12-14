# User Guide

Complete guide to using the POS System for daily operations.

## Table of Contents

1. [Logging In](#logging-in)
2. [Making a Sale](#making-a-sale)
3. [Managing Inventory](#managing-inventory)
4. [Creating Packages](#creating-packages)
5. [Configuring Settings](#configuring-settings)
6. [Viewing Transaction History](#viewing-transaction-history)

---

## Logging In

When you first access the system, you'll see a PIN entry screen.

- **Default PIN**: `1234`
- Enter the PIN and click **Login**

> [!TIP]
> You can change the PIN in the Settings page for security.

---

## Making a Sale

### Step 1: Add Items to Cart

There are two ways to add products:

#### Method 1: Click Product Cards

- Browse through the product grid
- Click on any product card to add it to the cart
- Items are organized by category (Beverages, Food, Meals, etc.)

#### Method 2: Use Search

- Type the product name in the search bar
- Click the product from the filtered results

### Step 2: AI Smart Suggestions ✨

As you add items, watch the **"Smart Suggestions"** box below your cart:

- AI recommends complementary products (e.g., Pandesal with Coffee)
- Click the **+** button to instantly add suggested items
- Suggestions update dynamically based on cart contents

### Step 3: Adjust Quantities

- Click **+** or **−** buttons next to cart items to adjust quantities
- Click the **trash icon** to remove an item completely

### Step 4: Apply Discounts (Optional)

Click the discount selector and choose:

| Discount Type | Effect |
|---------------|--------|
| **Senior Citizen** | 20% discount + VAT exemption (per Philippine law) |
| **PWD** | 20% discount + VAT exemption (per Philippine law) |

> [!IMPORTANT]
> Discount is applied to the total cart amount. Ensure you verify customer eligibility (valid ID).

### Step 5: Proceed to Checkout

- Click the **"Charge"** button at the bottom
- Review the order summary and total

### Step 6: Select Payment Method

Choose from the available payment methods:

#### 💵 Cash

1. Select **Cash**
2. Enter the amount received from customer
3. The system shows the change to return

#### 💳 Card

1. Select **Card**
2. Process the card payment on your terminal
3. Confirm transaction

#### 📱 E-Wallet (GCash / Maya)

1. Select **GCash** or **Maya**
2. Customer scans QR code or enters merchant number
3. Confirm payment received

> [!NOTE]
> E-wallet integrations require API keys to be configured in Settings. See [Payment Integration](Payment-Integration).

### Step 7: Complete Transaction

- Click **"Pay"** to finalize
- A receipt is generated and displayed
- You can print or download the receipt as PDF

The cart is automatically cleared, ready for the next customer.

---

## Managing Inventory

Click the **📦 Inventory** icon in the top-right header.

### Products Tab

#### Viewing Products

- See all products with current stock levels
- Products with stock ≤ 10 show a ⚠️ low stock warning

#### Adding a New Product

1. Click **"Add Product"**
2. Fill in the form:
   - **Name**: Product name (e.g., "Iced Coffee")
   - **Price**: Sale price (e.g., 65.00)
   - **Stock**: Initial quantity (e.g., 50)
   - **Category**: Choose from dropdown (Beverages, Food, Meals, etc.)
3. Click **"Save"**

#### Editing a Product

1. Click the **pencil icon** next to the product
2. Update the details
3. Click **"Save Changes"**

#### Deleting a Product

1. Click the **trash icon** next to the product
2. Confirm deletion

> [!WARNING]
> Deleting a product is permanent and cannot be undone.

### Packages Tab

See [Creating Packages](#creating-packages) below.

---

## Creating Packages

Packages (meal combos) let you bundle multiple products together at a special price.

### Examples of Packages

- **"Breakfast Combo"**: Coffee + Pandesal
- **"Student Meal"**: Rice Meal + Softdrink
- **"Family Pack"**: 3 Rice Meals + 2 Drinks

### Creating a Package

1. Go to **Inventory** → **Packages Tab**
2. Click **"New Package"**
3. Fill in package details:
   - **Package Name**: e.g., "Breakfast Combo"
   - **Price**: Special package price (can be lower than individual items)
4. Select products to include:
   - Check the boxes next to products
   - Set quantity for each product (e.g., 2× Coffee, 3× Pandesal)
5. Click **"Create Package"**

### How Packages Work

- Packages appear as single items on the POS page
- When sold, stock is deducted from all included products
- Package price is independent of individual product prices

### Editing a Package

1. Click the **pencil icon** next to the package
2. Modify name, price, or included products
3. Click **"Save Changes"**

---

## Configuring Settings

Click the **⚙️ Settings** icon in the header.

### Business Information

Update your business details for BIR-compliant receipts:

- **Business Name**: Appears on receipts
- **TIN**: Your Tax Identification Number
- **Address**: Business location
- **Contact**: Phone/email for receipts

### Payment Gateways

Enable and configure payment providers:

#### GCash / Maya

1. Toggle **Enable GCash** or **Enable Maya**
2. Enter your **API Key** and **Secret Key**
3. Select mode:
   - **Sandbox**: For testing (use test credentials)
   - **Live**: For real transactions (use production credentials)

> [!TIP]
> Always test in Sandbox mode first before switching to Live.

See [Payment Integration](Payment-Integration) for detailed setup.

### Delivery Platforms

Configure integrations with delivery services:

#### GrabFood / foodpanda

1. Toggle **Enable GrabFood** or **Enable foodpanda**
2. Enter your **Store ID** and **Webhook Secret**
3. Orders from these platforms will appear in your POS

See [Delivery Platforms](Delivery-Platforms) for more details.

---

## Viewing Transaction History

Click the **📊 Transactions** icon in the header.

### Transaction List

- View all completed sales
- See order number, date, total, and payment method
- Filter by date range or payment type

### Transaction Details

Click on any transaction to view:

- Full itemized list
- Applied discounts
- Payment method
- Receipt copy

### Exporting Data

- Click **"Export CSV"** to download transaction history
- Useful for accounting and reporting

---

## Tips for Efficient Operation

### Keyboard Shortcuts

- **Enter**: Focus search bar
- **Esc**: Clear search or close dialogs

### Best Practices

1. **Daily Stock Check**: Review inventory every morning
2. **End-of-Day Reports**: Export transactions at close of business
3. **Regular Backups**: Backup your database weekly
4. **Test Payments**: Always verify payment gateway integration in sandbox first

### Mobile Usage

The system is responsive and works on tablets:

- Recommended: iPad or Android tablet (10"+ screen)
- Use in landscape mode for best experience

---

## Need Help?

- 📖 Check [Troubleshooting](Troubleshooting) for common issues
- 💡 See [FAQ](Troubleshooting#faq) for quick answers
- 🐛 Report issues on [GitHub](https://github.com/Keshigami/POS-System/issues)

---

**Next**: Learn about [BIR Compliance](BIR-Compliance) features →
