import { PrismaClient } from "@prisma/client";
import { BUSINESS_TYPES, BUSINESS_TYPE_INFO } from "../lib/business-types";

const prisma = new PrismaClient();

// Business-type-specific product data
const BUSINESS_TYPE_PRODUCTS: Record<string, Array<{ name: string; price: number; costPrice: number; stock: number; categoryIndex: number }>> = {
    [BUSINESS_TYPES.SARI_SARI]: [
        // Beverages
        { name: "Coca-Cola 1.5L", price: 85, costPrice: 70, stock: 50, categoryIndex: 0 },
        { name: "Coca-Cola Mismo 290ml", price: 25, costPrice: 18, stock: 100, categoryIndex: 0 },
        { name: "Royal Tru-Orange 1.5L", price: 85, costPrice: 70, stock: 30, categoryIndex: 0 },
        { name: "Sprite 1.5L", price: 85, costPrice: 70, stock: 30, categoryIndex: 0 },
        { name: "C2 Apple 500ml", price: 40, costPrice: 30, stock: 40, categoryIndex: 0 },
        { name: "Nature's Spring Water 500ml", price: 20, costPrice: 12, stock: 100, categoryIndex: 0 },
        { name: "Gatorade Blue Bolt 500ml", price: 55, costPrice: 42, stock: 24, categoryIndex: 0 },
        { name: "Sting Energy Drink", price: 28, costPrice: 20, stock: 60, categoryIndex: 0 },
        { name: "Cobra Energy Drink", price: 28, costPrice: 20, stock: 60, categoryIndex: 0 },
        { name: "Red Horse 500ml", price: 60, costPrice: 48, stock: 48, categoryIndex: 0 },
        { name: "San Mig Light", price: 55, costPrice: 42, stock: 48, categoryIndex: 0 },
        { name: "Nescafe Original 3-in-1", price: 18, costPrice: 14, stock: 200, categoryIndex: 0 },
        { name: "Kopiko Brown 3-in-1", price: 18, costPrice: 14, stock: 200, categoryIndex: 0 },
        { name: "Milo Sachet 24g", price: 15, costPrice: 11, stock: 150, categoryIndex: 0 },

        // Instant Food
        { name: "Lucky Me Pancit Canton Kalamansi", price: 20, costPrice: 16, stock: 100, categoryIndex: 1 },
        { name: "Lucky Me Pancit Canton Chilimansi", price: 20, costPrice: 16, stock: 100, categoryIndex: 1 },
        { name: "Lucky Me Pancit Canton Sweet & Spicy", price: 20, costPrice: 16, stock: 100, categoryIndex: 1 },
        { name: "Lucky Me Beef Mami", price: 18, costPrice: 14, stock: 50, categoryIndex: 1 },
        { name: "Nissin Cup Noodles Beef", price: 45, costPrice: 35, stock: 30, categoryIndex: 1 },
        { name: "Nissin Cup Noodles Seafood", price: 45, costPrice: 35, stock: 30, categoryIndex: 1 },
        { name: "La Paz Batchoy Cup", price: 40, costPrice: 30, stock: 24, categoryIndex: 1 },

        // Canned Goods
        { name: "Century Tuna Flakes in Oil 155g", price: 48, costPrice: 38, stock: 48, categoryIndex: 1 },
        { name: "555 Sardines Green 155g", price: 28, costPrice: 22, stock: 60, categoryIndex: 1 },
        { name: "Ligo Sardines Red 155g", price: 28, costPrice: 22, stock: 60, categoryIndex: 1 },
        { name: "Argentina Corned Beef 150g", price: 55, costPrice: 42, stock: 48, categoryIndex: 1 },
        { name: "Argentina Meat Loaf 150g", price: 35, costPrice: 26, stock: 48, categoryIndex: 1 },
        { name: "CDO Karne Norte 150g", price: 30, costPrice: 22, stock: 48, categoryIndex: 1 },

        // Snacks
        { name: "Piattos Cheese Large", price: 50, costPrice: 38, stock: 20, categoryIndex: 2 },
        { name: "Piattos Sour Cream Small", price: 22, costPrice: 16, stock: 30, categoryIndex: 2 },
        { name: "Chippy Red", price: 15, costPrice: 11, stock: 50, categoryIndex: 2 },
        { name: "Nova Country Cheddar", price: 22, costPrice: 16, stock: 30, categoryIndex: 2 },
        { name: "V-Cut Spicy Barbecue", price: 22, costPrice: 16, stock: 30, categoryIndex: 2 },
        { name: "SkyFlakes Crackers (Pack)", price: 10, costPrice: 7, stock: 60, categoryIndex: 2 },
        { name: "Magic Flakes", price: 10, costPrice: 7, stock: 60, categoryIndex: 2 },
        { name: "Nissin Wafer Choco", price: 12, costPrice: 8, stock: 40, categoryIndex: 2 },

        // Personal Care (Sachets/Tingi)
        { name: "Palmolive Shampoo Pink 15ml", price: 10, costPrice: 7, stock: 120, categoryIndex: 3 },
        { name: "Sunsilk Shampoo Green 15ml", price: 10, costPrice: 7, stock: 120, categoryIndex: 3 },
        { name: "Cream Silk Conditioner Pink", price: 11, costPrice: 8, stock: 120, categoryIndex: 3 },
        { name: "Head & Shoulders Sachet", price: 11, costPrice: 8, stock: 120, categoryIndex: 3 },
        { name: "Safeguard White 60g", price: 35, costPrice: 28, stock: 40, categoryIndex: 3 },
        { name: "Bioderm Green", price: 30, costPrice: 22, stock: 40, categoryIndex: 3 },
        { name: "Colgate Sachet", price: 12, costPrice: 8, stock: 100, categoryIndex: 3 },
        { name: "Rexona Sachet Men", price: 15, costPrice: 10, stock: 50, categoryIndex: 3 },

        // Household
        { name: "Ariel Powder Sachet 70g", price: 20, costPrice: 15, stock: 100, categoryIndex: 4 },
        { name: "Surf Powder Cherry Blossom", price: 15, costPrice: 11, stock: 100, categoryIndex: 4 },
        { name: "Tide Powder Original", price: 18, costPrice: 14, stock: 100, categoryIndex: 4 },
        { name: "Downy Passion Sachet", price: 10, costPrice: 7, stock: 120, categoryIndex: 4 },
        { name: "Joy Dishwashing 20ml", price: 12, costPrice: 8, stock: 100, categoryIndex: 4 },
        { name: "Scotch Brite Sponge", price: 30, costPrice: 22, stock: 30, categoryIndex: 4 },

        // Others
        { name: "Marlboro Red (Pack)", price: 180, costPrice: 150, stock: 50, categoryIndex: 5 },
        { name: "Marlboro Red (Stick)", price: 10, costPrice: 8, stock: 500, categoryIndex: 5 },
        { name: "Fortune Red (Pack)", price: 140, costPrice: 110, stock: 30, categoryIndex: 5 },
        { name: "Generic Lighter", price: 20, costPrice: 12, stock: 50, categoryIndex: 5 },
    ],
    [BUSINESS_TYPES.FOOD_AND_BEVERAGE]: [
        { name: "Iced Coffee", price: 80, costPrice: 40, stock: 50, categoryIndex: 0 },
        { name: "Sisig Rice", price: 120, costPrice: 70, stock: 30, categoryIndex: 1 },
        { name: "Chicken Wings", price: 150, costPrice: 90, stock: 25, categoryIndex: 1 },
        { name: "French Fries", price: 60, costPrice: 30, stock: 40, categoryIndex: 2 },
        { name: "Halo-Halo", price: 90, costPrice: 45, stock: 20, categoryIndex: 3 },
        { name: "Lumpiang Shanghai", price: 80, costPrice: 40, stock: 35, categoryIndex: 4 },
        { name: "Tapsilog", price: 120, costPrice: 65, stock: 30, categoryIndex: 1 },
        { name: "Pork Sinigang", price: 180, costPrice: 100, stock: 20, categoryIndex: 1 },
        { name: "Bicol Express", price: 150, costPrice: 80, stock: 25, categoryIndex: 1 },
        { name: "Lechon Kawali", price: 200, costPrice: 120, stock: 20, categoryIndex: 1 },
        { name: "Extra Rice", price: 25, costPrice: 10, stock: 100, categoryIndex: 4 },
        { name: "Coke Can", price: 50, costPrice: 30, stock: 50, categoryIndex: 0 },
    ],
    [BUSINESS_TYPES.BAKERY]: [
        { name: "Pandesal (10pcs)", price: 50, costPrice: 25, stock: 100, categoryIndex: 0 },
        { name: "Ensaymada", price: 35, costPrice: 18, stock: 50, categoryIndex: 1 },
        { name: "Cheese Roll", price: 30, costPrice: 15, stock: 40, categoryIndex: 1 },
        { name: "Spanish Bread", price: 20, costPrice: 10, stock: 60, categoryIndex: 0 },
        { name: "Pan de Coco", price: 20, costPrice: 10, stock: 50, categoryIndex: 0 },
        { name: "Kalihim", price: 15, costPrice: 8, stock: 50, categoryIndex: 0 },
        { name: "Tasty Bread (Loaf)", price: 75, costPrice: 45, stock: 20, categoryIndex: 0 },
        { name: "Monay", price: 15, costPrice: 8, stock: 60, categoryIndex: 0 },
        { name: "Chocolate Cake 8inch", price: 800, costPrice: 400, stock: 5, categoryIndex: 2 },
        { name: "Mocha Cake Roll", price: 350, costPrice: 180, stock: 8, categoryIndex: 2 },
        { name: "Chocolate Chip Cookies", price: 25, costPrice: 12, stock: 60, categoryIndex: 3 },
        { name: "Egg Pie Slice", price: 40, costPrice: 20, stock: 24, categoryIndex: 1 },
    ],
    [BUSINESS_TYPES.PHARMACY]: [
        { name: "Biogesic 500mg (Tab)", price: 8, costPrice: 5, stock: 500, categoryIndex: 0 },
        { name: "Neozep Forte (Tab)", price: 10, costPrice: 7, stock: 400, categoryIndex: 1 },
        { name: "Bioflu (Tab)", price: 10, costPrice: 7, stock: 300, categoryIndex: 1 },
        { name: "Solmux Capsule", price: 12, costPrice: 8, stock: 300, categoryIndex: 1 },
        { name: "Decolgen No-Drowse", price: 10, costPrice: 7, stock: 200, categoryIndex: 1 },
        { name: "Alaxan FR", price: 12, costPrice: 8, stock: 200, categoryIndex: 0 },
        { name: "Medicol Advance", price: 10, costPrice: 7, stock: 200, categoryIndex: 0 },
        { name: "Diatabs", price: 15, costPrice: 10, stock: 150, categoryIndex: 0 },
        { name: "Imodium", price: 20, costPrice: 15, stock: 100, categoryIndex: 0 },
        { name: "Enervon C (Tab)", price: 10, costPrice: 7, stock: 300, categoryIndex: 2 },
        { name: "Centrum Advance", price: 20, costPrice: 15, stock: 200, categoryIndex: 2 },
        { name: "Poten-Cee 500mg", price: 8, costPrice: 5, stock: 300, categoryIndex: 2 },
        { name: "Fern-C", price: 10, costPrice: 7, stock: 200, categoryIndex: 2 },
        { name: "Betadine 60ml", price: 120, costPrice: 90, stock: 30, categoryIndex: 3 },
        { name: "Agua Oxinada 120ml", price: 45, costPrice: 30, stock: 40, categoryIndex: 3 },
        { name: "Green Cross Alcohol 250ml", price: 75, costPrice: 55, stock: 50, categoryIndex: 3 },
        { name: "Cleene Cotton 50g", price: 40, costPrice: 25, stock: 40, categoryIndex: 3 },
        { name: "Band-Aid Strips (Box)", price: 75, costPrice: 55, stock: 50, categoryIndex: 3 },
        { name: "Face Mask (Box)", price: 150, costPrice: 100, stock: 100, categoryIndex: 3 },
    ],
    [BUSINESS_TYPES.MINI_GROCERY]: [
        { name: "Rice (Sinandomeng) 1kg", price: 55, costPrice: 45, stock: 100, categoryIndex: 0 },
        { name: "Rice (Dinorado) 1kg", price: 65, costPrice: 52, stock: 100, categoryIndex: 0 },
        { name: "Eggs (Tray 30s)", price: 280, costPrice: 240, stock: 30, categoryIndex: 1 },
        { name: "Whole Chicken 1kg", price: 180, costPrice: 140, stock: 20, categoryIndex: 1 },
        { name: "Pork Liempo 1kg", price: 380, costPrice: 320, stock: 15, categoryIndex: 1 },
        { name: "Eden Cheese 160g", price: 95, costPrice: 75, stock: 40, categoryIndex: 2 },
        { name: "Magnolia Cheezee", price: 85, costPrice: 65, stock: 40, categoryIndex: 2 },
        { name: "Argentina Corned Beef 175g", price: 55, costPrice: 42, stock: 60, categoryIndex: 3 },
        { name: "Purefoods Corned Beef", price: 120, costPrice: 95, stock: 40, categoryIndex: 3 },
        { name: "Spam Luncheon Meat", price: 220, costPrice: 180, stock: 30, categoryIndex: 3 },
        { name: "Coca-Cola 1.5L", price: 75, costPrice: 60, stock: 50, categoryIndex: 4 },
        { name: "Tide Powder 1kg", price: 180, costPrice: 150, stock: 30, categoryIndex: 5 },
        { name: "Ariel Powder 1kg", price: 190, costPrice: 160, stock: 30, categoryIndex: 5 },
        { name: "Downy Fabcon 1L", price: 250, costPrice: 200, stock: 24, categoryIndex: 5 },
        { name: "Joy Dishwashing 500ml", price: 120, costPrice: 95, stock: 36, categoryIndex: 5 },
    ],
    [BUSINESS_TYPES.HARDWARE]: [
        { name: "Claw Hammer", price: 250, costPrice: 180, stock: 20, categoryIndex: 0 },
        { name: "Screwdriver Set", price: 350, costPrice: 250, stock: 15, categoryIndex: 0 },
        { name: "Pliers 8-inch", price: 180, costPrice: 130, stock: 20, categoryIndex: 0 },
        { name: "Tape Measure 5m", price: 120, costPrice: 80, stock: 30, categoryIndex: 0 },
        { name: "Cement 40kg", price: 280, costPrice: 220, stock: 100, categoryIndex: 1 },
        { name: "Plywood 1/4", price: 450, costPrice: 380, stock: 50, categoryIndex: 1 },
        { name: "LED Bulb 9W", price: 120, costPrice: 85, stock: 100, categoryIndex: 2 },
        { name: "Extension Cord 3m", price: 250, costPrice: 180, stock: 24, categoryIndex: 2 },
        { name: "PVC Pipe 1/2inch", price: 120, costPrice: 80, stock: 100, categoryIndex: 3 },
        { name: "Teflon Tape", price: 20, costPrice: 12, stock: 100, categoryIndex: 3 },
        { name: "Elastomeric Paint 4L", price: 650, costPrice: 500, stock: 20, categoryIndex: 4 },
        { name: "Paint Roller", price: 80, costPrice: 50, stock: 30, categoryIndex: 4 },
        { name: "Paint Brush 2inch", price: 40, costPrice: 25, stock: 50, categoryIndex: 4 },
        { name: "Common Nails 1kg", price: 80, costPrice: 60, stock: 50, categoryIndex: 5 },
        { name: "Concrete Nails 1kg", price: 100, costPrice: 75, stock: 50, categoryIndex: 5 },
    ],
    [BUSINESS_TYPES.VAPE_SHOP]: [
        { name: "RELX Infinity Device", price: 1200, costPrice: 900, stock: 15, categoryIndex: 0 },
        { name: "RELX Pods Mint (Pack)", price: 500, costPrice: 380, stock: 30, categoryIndex: 0 },
        { name: "Disposable Vape 5000 Puffs", price: 450, costPrice: 300, stock: 50, categoryIndex: 0 },
        { name: "Vape Juice 60ml Strawbi", price: 450, costPrice: 300, stock: 50, categoryIndex: 1 },
        { name: "Vape Juice 60ml Menthol", price: 450, costPrice: 300, stock: 50, categoryIndex: 1 },
        { name: "Mesh Coil 0.4ohm (Pack)", price: 400, costPrice: 280, stock: 30, categoryIndex: 2 },
        { name: "Cotton Wick", price: 150, costPrice: 80, stock: 40, categoryIndex: 2 },
        { name: "Type-C Cable", price: 150, costPrice: 100, stock: 30, categoryIndex: 3 },
        { name: "18650 Battery", price: 350, costPrice: 250, stock: 25, categoryIndex: 4 },
        { name: "Battery Charger", price: 400, costPrice: 280, stock: 20, categoryIndex: 4 },
    ],
    [BUSINESS_TYPES.GENERAL]: [
        { name: "Assorted Candies (Pack)", price: 50, costPrice: 35, stock: 50, categoryIndex: 2 },
        { name: "Ballpen Black", price: 10, costPrice: 6, stock: 100, categoryIndex: 3 },
        { name: "Notebook", price: 25, costPrice: 15, stock: 50, categoryIndex: 3 },
        { name: "Pad Paper", price: 30, costPrice: 20, stock: 50, categoryIndex: 3 },
        { name: "Correction Tape", price: 40, costPrice: 25, stock: 30, categoryIndex: 3 },
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

// Only run main() if this file is executed directly
if (require.main === module) {
    main()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
