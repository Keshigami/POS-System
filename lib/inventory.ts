
import { prisma } from "./prisma";
import { StockMovement } from "@prisma/client";

export type StockMovementType = 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'RETURN' | 'WASTE';

interface CreateStockMovementParams {
    productId: string;
    quantity: number; // Positive for IN, Negative for OUT
    type: StockMovementType;
    referenceId?: string;
    reason?: string;
    userId?: string;
}

/**
 * Internal function to record movement within a transaction scope
 */
export async function recordStockMovement(tx: any, params: CreateStockMovementParams) {
    const { productId, quantity, type, referenceId, reason, userId } = params;

    // 1. Create the Audit Log (StockMovement)
    const movement = await tx.stockMovement.create({
        data: {
            productId,
            quantity,
            type,
            referenceId,
            reason,
            userId,
        },
    });

    // 2. Update the actual Product stock
    const product = await tx.product.update({
        where: { id: productId },
        data: {
            stock: {
                increment: quantity,
            },
        },
    });

    return { movement, product };
}

/**
 * Records a stock movement and updates the product inventory in a single transaction.
 * Use this for ALL inventory changes to ensure audit trail.
 */
export async function updateStock(params: CreateStockMovementParams) {
    const { productId, quantity, type, referenceId, reason, userId } = params;

    return await prisma.$transaction(async (tx) => {
        return recordStockMovement(tx, params);
    });
}

/**
 * Get stock movement history for a specific product
 */
export async function getStockHistory(productId: string, limit = 50) {
    return await prisma.stockMovement.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            user: {
                select: { name: true }
            }
        }
    });
}

/**
 * Get current stock level (shortcut)
 */
export async function getCurrentStock(productId: string) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { stock: true }
    });
    return product?.stock ?? 0;
}
