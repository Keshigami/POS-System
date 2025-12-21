import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordStockMovement } from "@/lib/inventory";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // 1. Fetch PO with items
        const purchaseOrder = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!purchaseOrder) {
            return NextResponse.json({ error: "PO not found" }, { status: 404 });
        }

        if (purchaseOrder.status !== "ORDERED") {
            return NextResponse.json({ error: "PO is not in ORDERED status" }, { status: 400 });
        }

        // 2. Perform Transaction: Update PO Status & Increment Stock
        const result = await prisma.$transaction(async (tx) => {
            // Update PO
            const updatedPO = await tx.purchaseOrder.update({
                where: { id },
                data: {
                    status: "RECEIVED",
                    receivedDate: new Date()
                }
            });

            // Update Stock for each item
            // Update Stock for each item
            for (const item of purchaseOrder.items) {
                // 1. Record the Movement (Audit) + Update Product Stock
                await recordStockMovement(tx, {
                    productId: item.productId,
                    quantity: item.quantity,
                    type: "PURCHASE",
                    referenceId: purchaseOrder.id, // Link to PO
                    reason: `PO #${purchaseOrder.poNumber} Received`,
                    // userId: "SYSTEM" // Removed to prevent FK error until we fetch real user
                });

                // 2. Create Product Batch (FIFO / Expiry / Cost Tracking)
                await tx.productBatch.create({
                    data: {
                        productId: item.productId,
                        stock: item.quantity,
                        initialStock: item.quantity,
                        costPrice: item.costPrice || 0, // Capture cost at time of receipt
                        purchaseOrderId: purchaseOrder.id,
                        receivedDate: new Date()
                    }
                });
            }

            return updatedPO;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error receiving PO:", error);
        return NextResponse.json({ error: "Failed to receive PO" }, { status: 500 });
    }
}
