import prisma from "@/lib/prisma";

/**
 * Auto Purchase Order Generator
 * Checks all products below reorder point and creates draft POs grouped by supplier.
 */
export async function generateAutoPurchaseOrders(storeId: string) {
    // Fetch all products with supplier info
    const allProducts = await (prisma as any).product.findMany({
        where: { storeId },
        include: { supplier: true },
    });

    // Filter: stock <= reorderPoint AND has a supplier
    const lowStock = allProducts.filter(
        (p: any) => p.stock <= p.reorderPoint && p.supplierId
    );

    if (lowStock.length === 0) {
        return { message: "No low stock items with suppliers found.", orders: [] };
    }

    // Group by supplier
    const bySupplier: Record<string, any[]> = {};
    for (const product of lowStock) {
        const sid = product.supplierId!;
        if (!bySupplier[sid]) bySupplier[sid] = [];
        bySupplier[sid].push(product);
    }

    // Create draft POs for each supplier
    const createdOrders = [];
    for (const [supplierId, products] of Object.entries(bySupplier)) {
        const poNumber = `AUTO-${Date.now()}-${supplierId.slice(-4).toUpperCase()}`;
        const totalAmount = products.reduce(
            (sum: number, p: any) =>
                sum + p.costPrice * (p.reorderPoint - p.stock + p.safetyStock),
            0
        );

        const po = await (prisma as any).purchaseOrder.create({
            data: {
                poNumber,
                supplierId,
                storeId,
                status: "DRAFT",
                totalAmount,
                notes: "Auto-generated based on low stock levels.",
                items: {
                    create: products.map((p: any) => ({
                        productId: p.id,
                        quantity: p.reorderPoint - p.stock + p.safetyStock,
                        costPrice: p.costPrice,
                    })),
                },
            },
        });
        createdOrders.push(po);
    }

    return {
        message: `Created ${createdOrders.length} draft purchase orders.`,
        orders: createdOrders,
    };
}
