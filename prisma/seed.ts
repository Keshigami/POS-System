import { PrismaClient } from "@prisma/client";
import { BUSINESS_TYPES, BUSINESS_TYPE_INFO } from "../lib/business-types";

const prisma = new PrismaClient();

// Business-type-specific product data
const BUSINESS_TYPE_PRODUCTS: Record<string, Array<{ name: string; price: number; costPrice: number; stock: number; categoryIndex: number }>> = {
    [BUSINESS_TYPES.SARI_SARI]: [
        { name: "Coca-Cola 1.5L", price: 75, costPrice: 60, stock: 50, categoryIndex: 0 },
        { name: "Lucky Me Pancit Canton", price: 15, costPrice: 12, stock: 100, categoryIndex: 1 },
        { name: "Argentina Corned Beef", price: 45, costPrice: 38, stock: 30, categoryIndex: 1 },
        { name: "Chippy", price: 10, costPrice: 7, stock: 80, categoryIndex: 2 },
        { name: "Safeguard Soap", price: 35, costPrice: 28, stock: 40, categoryIndex: 3 },
        { name: "Tide Powder 50g", price: 20, costPrice: 16, stock: 60, categoryIndex: 4 },
        { name: "Marlboro Red", price: 150, costPrice: 135, stock: 20, categoryIndex: 5 },
    ],
    [BUSINESS_TYPES.FOOD_AND_BEVERAGE]: [
        { name: "Iced Coffee", price: 80, costPrice: 40, stock: 50, categoryIndex: 0 },
        { name: "Sisig Rice", price: 120, costPrice: 70, stock: 30, categoryIndex: 1 },
        { name: "Chicken Wings", price: 150, costPrice: 90, stock: 25, categoryIndex: 1 },
        { name: "French Fries", price: 60, costPrice: 30, stock: 40, categoryIndex: 2 },
        { name: "Halo-Halo", price: 90, costPrice: 45, stock: 20, categoryIndex: 3 },
        { name: "Lumpiang Shanghai", price: 80, costPrice: 40, stock: 35, categoryIndex: 4 },
    ],
    [BUSINESS_TYPES.BAKERY]: [
        { name: "Pandesal (5pcs)", price: 25, costPrice: 12, stock: 100, categoryIndex: 0 },
        { name: "Ensaymada", price: 35, costPrice: 18, stock: 50, categoryIndex: 1 },
        { name: "Birthday Cake 8inch", price: 800, costPrice: 400, stock: 5, categoryIndex: 2 },
        { name: "Chocolate Chip Cookies", price: 120, costPrice: 60, stock: 30, categoryIndex: 3 },
        { name: "Iced Coffee", price: 70, costPrice: 35, stock: 40, categoryIndex: 4 },
    ],
    [BUSINESS_TYPES.PHARMACY]: [
        { name: "Biogesic 500mg", price: 8, costPrice: 5, stock: 200, categoryIndex: 0 },
        { name: "Neozep Forte", price: 10, costPrice: 7, stock: 150, categoryIndex: 1 },
        { name: "Centrum Multivitamins", price: 450, costPrice: 350, stock: 30, categoryIndex: 2 },
        { name: "Band-Aid 10pcs", price: 75, costPrice: 55, stock: 50, categoryIndex: 3 },
        { name: "Safeguard Soap", price: 35, costPrice: 28, stock: 80, categoryIndex: 4 },
        { name: "Thermometer Digital", price: 250, costPrice: 180, stock: 20, categoryIndex: 5 },
    ],
    [BUSINESS_TYPES.MINI_GROCERY]: [
        { name: "Tomatoes 1kg", price: 80, costPrice: 50, stock: 30, categoryIndex: 0 },
        { name: "Chicken Breast 1kg", price: 180, costPrice: 140, stock: 25, categoryIndex: 1 },
        { name: "Eden Cheese", price: 95, costPrice: 75, stock: 40, categoryIndex: 2 },
        { name: "Argentina Corned Beef", price: 45, costPrice: 38, stock: 60, categoryIndex: 3 },
        { name: "Coca-Cola 1.5L", price: 75, costPrice: 60, stock: 50, categoryIndex: 4 },
        { name: "Tide Powder 1kg", price: 180, costPrice: 150, stock: 30, categoryIndex: 5 },
    ],
    [BUSINESS_TYPES.HARDWARE]: [
        { name: "Hammer", price: 250, costPrice: 180, stock: 20, categoryIndex: 0 },
        { name: "Cement 40kg", price: 280, costPrice: 220, stock: 50, categoryIndex: 1 },
        { name: "Light Bulb LED", price: 120, costPrice: 85, stock: 100, categoryIndex: 2 },
        { name: "PVC Pipe 1/2inch", price: 80, costPrice: 60, stock: 40, categoryIndex: 3 },
        { name: "Paint White 1L", price: 350, costPrice: 280, stock: 25, categoryIndex: 4 },
        { name: "Nails 1kg", price: 150, costPrice: 110, stock: 60, categoryIndex: 5 },
    ],
    [BUSINESS_TYPES.VAPE_SHOP]: [
        { name: "RELX Starter Kit", price: 1200, costPrice: 900, stock: 15, categoryIndex: 0 },
        { name: "Vape Juice 60ml", price: 450, costPrice: 300, stock: 50, categoryIndex: 1 },
        { name: "Pod Cartridge", price: 280, costPrice: 200, stock: 40, categoryIndex: 2 },
        { name: "Charging Cable", price: 150, costPrice: 100, stock: 30, categoryIndex: 3 },
        { name: "18650 Battery", price: 350, costPrice: 250, stock: 25, categoryIndex: 4 },
        { name: "Beginner Kit", price: 800, costPrice: 600, stock: 20, categoryIndex: 5 },
    ],
    [BUSINESS_TYPES.GENERAL]: [
        { name: "Coffee", price: 70, costPrice: 35, stock: 50, categoryIndex: 0 },
        { name: "Sisig Rice", price: 120, costPrice: 70, stock: 30, categoryIndex: 1 },
        { name: "Chips", price: 25, costPrice: 15, stock: 80, categoryIndex: 2 },
        { name: "Detergent", price: 45, costPrice: 35, stock: 40, categoryIndex: 3 },
    ],
};

export async function seedByBusinessType(businessType: string = BUSINESS_TYPES.GENERAL) {
    console.log(`🌱 Seeding database for business type: ${businessType}...`);

    // 1. Create default store
    const mainStore = await prisma.store.upsert({
        where: { id: "default-store" },
        update: { businessType },
        create: {
            id: "default-store",
            name: "Main Store",
            businessType,
        },
    });

    // 2. Create admin user
    const admin = await prisma.user.upsert({
        where: { email: "admin@pos.com" },
        update: { storeId: mainStore.id },
        create: {
            name: "Admin User",
            email: "admin@pos.com",
            pin: "1234",
            role: "ADMIN",
            storeId: mainStore.id,
        },
    });

    // 3. Get business type info
    const businessInfo = BUSINESS_TYPE_INFO[businessType as keyof typeof BUSINESS_TYPE_INFO];
    if (!businessInfo) {
        console.error(`Unknown business type: ${businessType}`);
        return;
    }

    // 4. Create categories based on business type
    const categories = businessInfo.categories;
    const createdCategories: any[] = [];

    for (const cat of categories) {
        const category = await prisma.category.upsert({
            where: { id: `${businessType}-${cat.toLowerCase().replace(/\s+/g, '-')}` },
            update: { name: cat },
            create: {
                id: `${businessType}-${cat.toLowerCase().replace(/\s+/g, '-')}`,
                name: cat,
                storeId: mainStore.id,
            },
        });
        createdCategories.push(category);
    }

    // 5. Create products based on business type
    const productData = BUSINESS_TYPE_PRODUCTS[businessType] || BUSINESS_TYPE_PRODUCTS[BUSINESS_TYPES.GENERAL];

    for (const productInfo of productData) {
        const category = createdCategories[productInfo.categoryIndex % createdCategories.length];

        await prisma.product.upsert({
            where: { id: `${businessType}-${productInfo.name.toLowerCase().replace(/\s+/g, '-')}` },
            update: {
                price: productInfo.price,
                costPrice: productInfo.costPrice,
                stock: productInfo.stock,
            },
            create: {
                id: `${businessType}-${productInfo.name.toLowerCase().replace(/\s+/g, '-')}`,
                name: productInfo.name,
                price: productInfo.price,
                costPrice: productInfo.costPrice,
                stock: productInfo.stock,
                categoryId: category.id,
                storeId: mainStore.id,
            },
        });
    }

    console.log(`✅ Seeding complete for ${businessInfo.name}!`);
    console.log(`   - Created ${createdCategories.length} categories`);
    console.log(`   - Created ${productData.length} products`);
}

async function main() {
    // Default to GENERAL if no argument provided
    const businessType = process.env.BUSINESS_TYPE || BUSINESS_TYPES.GENERAL;
    await seedByBusinessType(businessType);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
