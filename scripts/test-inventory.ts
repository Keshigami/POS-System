
import { updateStock, getStockHistory, getCurrentStock } from "../lib/inventory";
import { prisma } from "../lib/prisma";

async function main() {
    console.log("Starting Inventory Audit Test...");

    // 1. Create a dummy product
    const product = await prisma.product.create({
        data: {
            name: "Test Audit Product",
            price: 100,
            stock: 0,
            categoryId: (await prisma.category.findFirst())?.id || "",
            storeId: (await prisma.store.findFirst())?.id || "",
        }
    });

    console.log(`Created test product: ${product.name} (ID: ${product.id})`);

    // 2. Perform a Purchase (Stock In)
    console.log("Recording Stock IN (Purchase)...");
    await updateStock({
        productId: product.id,
        quantity: 10,
        type: 'PURCHASE',
        reason: 'Initial Stock',
        userId: (await prisma.user.findFirst())?.id
    });

    // 3. Perform a Sale (Stock Out)
    console.log("Recording Stock OUT (Sale)...");
    await updateStock({
        productId: product.id,
        quantity: -3,
        type: 'SALE',
        reason: 'Test Sale'
    });

    // 4. Verify Stock Level
    const finalStock = await getCurrentStock(product.id);
    console.log(`Final Stock Level: ${finalStock}`);

    if (finalStock !== 7) {
        console.error("❌ Stock verification failed! Expected 7, got " + finalStock);
        process.exit(1);
    } else {
        console.log("✅ Stock level correct.");
    }

    // 5. Verify Audit History
    const history = await getStockHistory(product.id);
    console.log("Audit History:");
    history.forEach(h => {
        console.log(`- [${h.type}] ${h.quantity > 0 ? '+' : ''}${h.quantity} (${h.reason})`);
    });

    if (history.length !== 2) {
        console.error("❌ History verification failed! Expected 2 records.");
        process.exit(1);
    }

    // Cleanup
    await prisma.stockMovement.deleteMany({ where: { productId: product.id } });
    await prisma.product.delete({ where: { id: product.id } });
    console.log("Cleanup complete.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
