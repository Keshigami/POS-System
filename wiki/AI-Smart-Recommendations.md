# AI Smart Recommendations

Learn how the AI-powered product recommendation system works and how to make the most of it.

## Overview

The **Smart Suggestions** feature uses artificial intelligence to recommend complementary products based on what's currently in the customer's cart. This helps increase sales and improve customer experience by suggesting items they might have forgotten or not considered.

## How It Works

### The Recommendation Engine

The system analyzes the cart contents and suggests products that are frequently purchased together or naturally complement each other.

**Example Recommendations:**

| Cart Contains | AI Suggests |
|---------------|-------------|
| **Coffee** | Pandesal, Sugar, Creamer |
| **Rice Meal** | Softdrink, Bottled Water |
| **Burger** | Fries, Coke, Ketchup |
| **Breakfast items** | Orange Juice, Coffee |

### Real-Time Updates

- Recommendations update **instantly** as items are added or removed
- AI considers the **entire cart context**, not just the last item added
- Suggestions are **non-repeating** – won't suggest items already in cart

### Visual Display

The Smart Suggestions box appears below the cart and shows:

- **Product name** and price
- **Reasoning** (e.g., "Often bought with Coffee")
- **Quick add button** (+) for instant addition to cart

## Using Smart Suggestions

### For Cashiers

1. **Add items to cart** as usual
2. **Glance at suggestions** box below the cart
3. **Ask customer**: "Would you like to add [suggested item]?"
4. **Click the + button** if customer agrees

> [!TIP]
> Training tip: Cashiers can boost sales by proactively mentioning AI suggestions, especially for high-margin items like beverages or add-ons.

### For Customers (Self-Service Kiosks)

If using the POS as a self-service kiosk:

- Suggestions appear automatically
- Customers can browse and add items with one click
- Helpful for discovering new products or deals

## Recommendation Algorithm

### Current Implementation

The system uses a **rule-based AI** that considers:

1. **Product Categories**
   - Beverages pair with snacks
   - Meals pair with drinks
   - Breakfast items pair with coffee

2. **Common Pairings**
   - Historical data from past transactions
   - Manually defined common combinations

3. **Context Awareness**
   - Time of day (e.g., coffee in morning)
   - Cart size (suggest smaller items for small carts)
   - Price point (suggest items in similar price range)

### Example Algorithm Logic

```typescript
if (cart contains "Coffee") {
  suggest: ["Pandesal", "Croissant", "Sugar"]
  because: "Commonly paired breakfast items"
}

if (cart contains "Rice Meal" && no drinks) {
  suggest: ["Coke", "Bottled Water", "Iced Tea"]
  because: "Customers typically buy drinks with meals"
}
```

## Benefits

### For Business Owners

- 📈 **Increased Average Order Value**: Customers buy more per transaction
- 💡 **Upselling Made Easy**: Staff don't need to memorize pairings
- 🎯 **Data-Driven**: Based on actual purchasing patterns
- ⚡ **Faster Service**: Quick suggestions speed up ordering

### For Customers

- 🍽️ **Complete Meals**: Don't forget essential items (e.g., drinks)
- 🆕 **Product Discovery**: Learn about new items they might like
- ⏱️ **Saves Time**: No need to browse entire menu
- 💰 **Better Value**: Discover combo deals and packages

## Customizing Recommendations

> [!NOTE]
> **Coming Soon**: The ability to customize recommendation rules, set product affinities, and train the AI on your specific business data.

### Future Enhancements (Roadmap)

1. **Machine Learning Model**
   - Train on your actual sales data
   - Improve accuracy over time
   - Seasonal adjustments (e.g., hot drinks in rainy season)

2. **Manual Pairing Rules**
   - Define custom product relationships
   - Set priority suggestions
   - Create promotional pairings

3. **Time-Based Suggestions**
   - Morning: Coffee, breakfast items
   - Lunch: Full meals, cold drinks
   - Evening: Snacks, takeaway items

4. **Inventory-Aware**
   - Prioritize items with high stock
   - Avoid suggesting out-of-stock items
   - Push slow-moving inventory

## Performance Metrics

### Measuring Success

Track the effectiveness of AI recommendations:

| Metric | Description | Target |
|--------|-------------|--------|
| **Suggestion Accept Rate** | % of suggestions that are added to cart | > 15% |
| **Average Order Value** | Total sales ÷ number of orders | Increase over time |
| **Items per Transaction** | Average number of items per sale | > 2.5 |

> [!TIP]
> Export transaction data from **Transactions** page to analyze these metrics in a spreadsheet.

### A/B Testing (Advanced)

For businesses wanting to optimize:

1. Track sales before enabling AI suggestions
2. Enable suggestions for 2 weeks
3. Compare metrics (average order value, items per transaction)
4. Adjust as needed

## Technical Details

### API Endpoint

The recommendation engine runs on:

```
POST /api/recommendations
```

**Request Body:**

```json
{
  "cartItems": [
    { "id": "product_1", "name": "Coffee", "category": "Beverages" },
    { "id": "product_2", "name": "Rice Meal", "category": "Meals" }
  ]
}
```

**Response:**

```json
{
  "suggestions": [
    {
      "id": "product_5",
      "name": "Pandesal",
      "price": 15.00,
      "reason": "Often bought with Coffee"
    },
    {
      "id": "product_8",
      "name": "Bottled Water",
      "price": 20.00,
      "reason": "Complements Rice Meal"
    }
  ]
}
```

### Integration with Inventory

The recommendation system is connected to the inventory database, so:

- Only **in-stock items** are suggested
- Price and product details are **real-time**
- New products are **automatically included** in suggestion pool

## Best Practices

### For Maximum Sales Impact

1. **Train Your Staff**
   - Explain how suggestions work
   - Encourage them to mention top suggestions
   - Reward successful upsells

2. **Monitor Performance**
   - Check which suggestions are most accepted
   - Adjust product pairings accordingly
   - Remove unsuccessful suggestions

3. **Keep Products Fresh**
   - Regularly update inventory
   - Add new items for variety
   - Remove discontinued items

4. **Use with Packages**
   - Combine AI suggestions with meal packages
   - Suggest packages when individual items are in cart
   - Example: Cart has "Burger" → Suggest "Burger Meal Package"

### Common Pitfalls to Avoid

❌ **Don't** suggest too many items (max 3-4)  
❌ **Don't** suggest expensive items with cheap purchases (price mismatch)  
❌ **Don't** ignore suggestions – train staff to mention them  
❌ **Don't** suggest out-of-stock items

## Troubleshooting

### No Suggestions Appearing?

**Possible Causes:**

1. Cart is empty
2. All available pairings are already in cart
3. Database has no pairing rules defined

**Solution**: Check database seed data for recommendation rules.

### Irrelevant Suggestions?

**Solution**: This is a learning system. As you gather more transaction data, recommendations will improve. You can also manually define pairings (coming soon).

---

## Learn More

- [User Guide](User-Guide) - Complete POS usage
- [Architecture Overview](Architecture-Overview) - How the system is built
- [API Documentation](API-Documentation) - Developer reference

---

**Next**: Explore [Payment Integration](Payment-Integration) →
