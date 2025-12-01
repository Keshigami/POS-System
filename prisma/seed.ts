import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Create default admin user
    const admin = await prisma.user.upsert({
        where: { pin: "1234" },
        update: {},
        create: {
            name: "Admin User",
            pin: "1234",
            role: "ADMIN",
        },
    });

    console.log({ admin });

    // Create some default categories
    const categories = ["Beverages", "Food", "Snacks", "Essentials"];
    const createdCategories: any[] = [];

    for (const cat of categories) {
        const category = await prisma.category.create({
            data: { name: cat },
        });
        createdCategories.push(category);
    }

    // Create popular products (10+)
    const beveragesCategory = createdCategories.find(c => c.name === "Beverages");
    const foodCategory = createdCategories.find(c => c.name === "Food");
    const snacksCategory = createdCategories.find(c => c.name === "Snacks");
    const essentialsCategory = createdCategories.find(c => c.name === "Essentials");

    await prisma.product.createMany({
        data: [
            // Beverages
            { name: "Coffee", price: 120, stock: 100, categoryId: beveragesCategory.id },
            { name: "Tea", price: 100, stock: 100, categoryId: beveragesCategory.id },
            { name: "Soda", price: 50, stock: 150, categoryId: beveragesCategory.id },
            { name: "Bottled Water", price: 20, stock: 200, categoryId: beveragesCategory.id },

            // Food
            { name: "Pandesal", price: 30, stock: 100, categoryId: foodCategory.id },
            { name: "Rice (1kg)", price: 55, stock: 80, categoryId: foodCategory.id },
            { name: "Eggs (per piece)", price: 8, stock: 200, categoryId: foodCategory.id },
            { name: "Instant Noodles", price: 15, stock: 150, categoryId: foodCategory.id },

            // Snacks
            { name: "Chips", price: 25, stock: 100, categoryId: snacksCategory.id },
            { name: "Candy", price: 5, stock: 300, categoryId: snacksCategory.id },

            // Essentials
            { name: "Sugar (1kg)", price: 60, stock: 50, categoryId: essentialsCategory.id },
            { name: "Salt", price: 15, stock: 80, categoryId: essentialsCategory.id },
            { name: "Milk (1L)", price: 90, stock: 60, categoryId: essentialsCategory.id },
        ],
    });

    // Create meal packages
    const coffee = await prisma.product.findFirst({ where: { name: "Coffee" } });
    const pandesal = await prisma.product.findFirst({ where: { name: "Pandesal" } });
    const rice = await prisma.product.findFirst({ where: { name: "Rice (1kg)" } });
    const noodles = await prisma.product.findFirst({ where: { name: "Instant Noodles" } });
    const soda = await prisma.product.findFirst({ where: { name: "Soda" } });
    const chips = await prisma.product.findFirst({ where: { name: "Chips" } });
    const candy = await prisma.product.findFirst({ where: { name: "Candy" } });

    if (coffee && pandesal) {
        await prisma.package.create({
            data: {
                name: "Breakfast Combo",
                description: "Perfect morning starter",
                price: 140,
                items: {
                    create: [
                        { productId: coffee.id, quantity: 1 },
                        { productId: pandesal.id, quantity: 1 },
                    ],
                },
            },
        });
    }

    if (rice && noodles && soda) {
        await prisma.package.create({
            data: {
                name: "Lunch Special",
                description: "Quick and filling meal",
                price: 100,
                items: {
                    create: [
                        { productId: rice.id, quantity: 1 },
                        { productId: noodles.id, quantity: 1 },
                        { productId: soda.id, quantity: 1 },
                    ],
                },
            },
        });
    }

    if (chips && candy && soda) {
        await prisma.package.create({
            data: {
                name: "Snack Pack",
                description: "Sweet treats combo",
                price: 70,
                items: {
                    create: [
                        { productId: chips.id, quantity: 1 },
                        { productId: candy.id, quantity: 2 },
                        { productId: soda.id, quantity: 1 },
                    ],
                },
            },
        });
    }

    // Generate patterned orders for AI training
    console.log("Generating patterned orders for AI training...");

    // Pattern 1: Coffee + Pandesal (Morning Rush)
    if (coffee && pandesal) {
        for (let i = 0; i < 15; i++) {
            await prisma.order.create({
                data: {
                    total: coffee.price + pandesal.price,
                    status: "COMPLETED",
                    items: {
                        create: [
                            { productId: coffee.id, quantity: 1, price: coffee.price },
                            { productId: pandesal.id, quantity: 2, price: pandesal.price },
                        ],
                    },
                },
            });
        }
    }

    // Pattern 2: Spaghetti (Noodles) + Fried Chicken (simulated with Rice/Eggs for now) + Soda
    if (noodles && soda && rice) {
        for (let i = 0; i < 10; i++) {
            await prisma.order.create({
                data: {
                    total: noodles.price + soda.price + rice.price,
                    status: "COMPLETED",
                    items: {
                        create: [
                            { productId: noodles.id, quantity: 1, price: noodles.price },
                            { productId: soda.id, quantity: 1, price: soda.price },
                            { productId: rice.id, quantity: 1, price: rice.price },
                        ],
                    },
                },
            });
        }
    }

    // Pattern 3: Chips + Soda (Snack Time)
    if (chips && soda) {
        for (let i = 0; i < 12; i++) {
            await prisma.order.create({
                data: {
                    total: chips.price + soda.price,
                    status: "COMPLETED",
                    items: {
                        create: [
                            { productId: chips.id, quantity: 2, price: chips.price },
                            { productId: soda.id, quantity: 1, price: soda.price },
                        ],
                    },
                },
            });
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
