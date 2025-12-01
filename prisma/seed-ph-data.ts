import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🇵🇭 Philippine Market Products
const PH_PRODUCTS = [
    // Breakfast / Daily Essentials
    { name: 'Pandesal (10pcs)', price: 25.00, category: 'Bakery', stock: 200 },
    { name: 'Tasty Bread (Gardenia)', price: 85.00, category: 'Bakery', stock: 50 },
    { name: 'Kopiko Brown Coffee (Twin Pack)', price: 15.00, category: 'Beverages', stock: 500 },
    { name: 'Nescafe Original (Stick)', price: 12.00, category: 'Beverages', stock: 500 },
    { name: 'Bear Brand Powdered Milk (33g)', price: 22.00, category: 'Beverages', stock: 300 },
    { name: 'Milo Sachet (24g)', price: 18.00, category: 'Beverages', stock: 300 },

    // Canned Goods & Instant Food
    { name: 'Lucky Me! Pancit Canton (Calamansi)', price: 16.00, category: 'Instant Food', stock: 400 },
    { name: 'Lucky Me! Beef Mami', price: 14.00, category: 'Instant Food', stock: 300 },
    { name: '555 Sardines (Green)', price: 22.00, category: 'Canned Goods', stock: 200 },
    { name: 'Century Tuna Flakes in Oil', price: 38.00, category: 'Canned Goods', stock: 200 },
    { name: 'Argentina Corned Beef (150g)', price: 45.00, category: 'Canned Goods', stock: 150 },
    { name: 'San Marino Corned Tuna', price: 35.00, category: 'Canned Goods', stock: 150 },

    // Condiments & Cooking
    { name: 'Silver Swan Soy Sauce (350ml)', price: 25.00, category: 'Condiments', stock: 100 },
    { name: 'Datu Puti Vinegar (350ml)', price: 22.00, category: 'Condiments', stock: 100 },
    { name: 'Magic Sarap (8g)', price: 5.00, category: 'Condiments', stock: 1000 },
    { name: 'Knorr Sinigang Mix (Original)', price: 20.00, category: 'Condiments', stock: 300 },
    { name: 'Golden Fiesta Cooking Oil (1L)', price: 110.00, category: 'Cooking Essentials', stock: 50 },
    { name: 'Sinandomeng Rice (1kg)', price: 52.00, category: 'Rice', stock: 500 },

    // Snacks & Drinks
    { name: 'Coca-Cola Mismo (295ml)', price: 20.00, category: 'Beverages', stock: 200 },
    { name: 'C2 Apple Green Tea (500ml)', price: 35.00, category: 'Beverages', stock: 150 },
    { name: 'Piattos Cheese (Large)', price: 42.00, category: 'Snacks', stock: 100 },
    { name: 'Nova Country Cheddar', price: 18.00, category: 'Snacks', stock: 150 },
    { name: 'SkyFlakes Crackers (Single)', price: 8.00, category: 'Snacks', stock: 400 },
];

async function main() {
    console.log('🇵🇭 Seeding Philippine Market Data...');

    // 1. Clear existing data (in correct order due to foreign keys)
    await prisma.forecastData.deleteMany();
    await prisma.priceHistory.deleteMany();
    await prisma.salesAnalytics.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.packageItem.deleteMany(); // Added
    await prisma.package.deleteMany();     // Added
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();    // Added

    // 2. Create Categories & Products
    const products = [];
    const categoryMap = new Map();

    for (const p of PH_PRODUCTS) {
        // Find or create category
        let categoryId = categoryMap.get(p.category);

        if (!categoryId) {
            const existingCategory = await prisma.category.findFirst({ where: { name: p.category } });
            if (existingCategory) {
                categoryId = existingCategory.id;
            } else {
                const newCategory = await prisma.category.create({ data: { name: p.category } });
                categoryId = newCategory.id;
            }
            categoryMap.set(p.category, categoryId);
        }

        const product = await prisma.product.create({
            data: {
                name: p.name,
                price: p.price,
                stock: p.stock,
                categoryId: categoryId,
            },
        });
        products.push(product);
    }
    console.log(`✅ Created ${products.length} local products`);

    // 3. Generate 60 Days of Transaction History
    const today = new Date();
    const orders = [];

    console.log('📅 Generating 60 days of transaction history...');

    for (let i = 60; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Determine if it's a "Payday" (15th or 30th)
        const isPayday = date.getDate() === 15 || date.getDate() === 30;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        // Sales volume multiplier
        let volumeMultiplier = 1.0;
        if (isPayday) volumeMultiplier = 1.8; // 80% more sales on payday
        else if (isWeekend) volumeMultiplier = 1.4; // 40% more on weekends

        // Number of orders for this day (random variation)
        const numOrders = Math.floor((15 + Math.random() * 20) * volumeMultiplier);

        for (let j = 0; j < numOrders; j++) {
            // Determine time of day (simulate peak hours)
            const hourRand = Math.random();
            let hour;

            if (hourRand < 0.3) hour = 7 + Math.floor(Math.random() * 3); // Morning (7-10am) - 30%
            else if (hourRand < 0.6) hour = 11 + Math.floor(Math.random() * 3); // Lunch (11-2pm) - 30%
            else if (hourRand < 0.9) hour = 16 + Math.floor(Math.random() * 4); // Merienda/Dinner (4-8pm) - 30%
            else hour = 10 + Math.floor(Math.random() * 10); // Random other times - 10%

            date.setHours(hour, Math.floor(Math.random() * 60));

            // Create Order
            const order = await prisma.order.create({
                data: {
                    createdAt: date,
                    total: 0, // Will update
                    status: 'COMPLETED',
                    paymentMethod: Math.random() > 0.7 ? 'GCASH' : 'CASH', // 30% GCash usage
                },
            });

            // Add Items to Order
            const numItems = 1 + Math.floor(Math.random() * 5); // 1-5 items per order
            let orderTotal = 0;

            for (let k = 0; k < numItems; k++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = 1 + Math.floor(Math.random() * 3); // 1-3 qty

                await prisma.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: product.id,
                        quantity: quantity,
                        price: product.price,
                    },
                });

                orderTotal += product.price * quantity;
            }

            // Update Order Total
            await prisma.order.update({
                where: { id: order.id },
                data: { total: orderTotal },
            });
        }
    }

    console.log('✅ Seeded realistic transaction history');
    console.log('🇵🇭 Data generation complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
