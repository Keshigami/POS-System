import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
            for (const item of purchaseOrder.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity
                        },
                        // Optional: Update cost price if businesses want moving average cost
                        // costPrice: item.costPrice 
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
