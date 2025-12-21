
import { prisma } from "../lib/prisma";
import { recordStockMovement } from "../lib/inventory";

async function main() {
    console.log("Starting PO Receive Logic Test...");

    // 1. Setup Data
    const store = await prisma.store.create({ data: { name: "Test Store" } });
    const category = await prisma.category.create({ data: { name: "Test Cat", storeId: store.id } });
    const product = await prisma.product.create({
        data: { name: "PO Test Product", price: 100, stock: 0, categoryId: category.id, storeId: store.id, costPrice: 50 },
    });
    const supplier = await prisma.supplier.create({ data: { name: "Test Supplier", storeId: store.id } });

    const po = await prisma.purchaseOrder.create({
        data: {
            poNumber: "PO-" + Date.now(),
            status: "ORDERED",
            supplierId: supplier.id,
            storeId: store.id,
            items: {
                create: { productId: product.id, quantity: 20, costPrice: 50 }
            }
        },
        include: { items: true }
    });

    console.log(`Created PO ${po.poNumber} with 20 items.`);

    // 2. Execute Receiving Logic (Mirroring Route)
    console.log("Executing Transaction...");
    await prisma.$transaction(async (tx) => {
        // Update PO
        await tx.purchaseOrder.update({
            where: { id: po.id },
            data: { status: "RECEIVED", receivedDate: new Date() }
        });

        for (const item of po.items) {
            // 1. Audit
            await recordStockMovement(tx, {
                productId: item.productId,
                quantity: item.quantity,
                type: "PURCHASE",
                referenceId: po.id,
                reason: "PO Received (Test)",
                // userId: "TEST_SCRIPT"
            });

            // 2. Batch
            await tx.productBatch.create({
                data: {
                    productId: item.productId,
                    stock: item.quantity,
                    initialStock: item.quantity,
                    costPrice: item.costPrice,
                    purchaseOrderId: po.id,
                    receivedDate: new Date()
                }
            });
        }
    });

    // 3. Verify
    const finalProduct = await prisma.product.findUnique({ where: { id: product.id } });
    console.log(`Final Product Stock: ${finalProduct?.stock}`);

    const batch = await prisma.productBatch.findFirst({ where: { purchaseOrderId: po.id } });
    console.log(`Batch Created: Stock=${batch?.stock}, Cost=${batch?.costPrice}`);

    const movement = await prisma.stockMovement.findFirst({ where: { referenceId: po.id } });
    console.log(`Movement Recorded: Type=${movement?.type}, Qty=${movement?.quantity}`);

    if (finalProduct?.stock !== 20 || !batch || !movement) {
        console.error("❌ Test Failed");
        process.exit(1);
    } else {
        console.log("✅ Test Passed");
    }

    // Cleanup should ideally happen, but for dev db it's okay (or add cleanup code)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
