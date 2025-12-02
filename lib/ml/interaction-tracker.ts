import prisma from '@/lib/prisma';

/**
 * Interaction Tracker for Collaborative Filtering
 * Tracks user-product interactions for building recommendation models
 */

export interface Interaction {
    userId: string;
    productId: string;
    quantity: number;
    timestamp: Date;
    sessionId?: string;
}

/**
 * Record a user-product interaction (purchase, cart addition)
 */
export async function recordInteraction(
    productId: string,
    quantity: number,
    userId?: string | null,
    sessionId?: string
): Promise<void> {
    // For now, interactions are implicitly stored in OrderItems
    // We extract them during model training
    // This function is a placeholder for future explicit tracking
}

/**
 * Build user-product interaction matrix from order history
 */
export async function getInteractionMatrix(): Promise<{
    interactions: Interaction[];
    userIds: string[];
    productIds: string[];
}> {
    // Fetch all orders with items
    const orders = await (prisma as any).order.findMany({
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const interactions: Interaction[] = [];
    const userIdSet = new Set<string>();
    const productIdSet = new Set<string>();

    // Build interaction list from orders
    for (const order of orders) {
        const userId = order.userId || `guest_${order.id}`;

        for (const item of order.items) {
            if (!item.product) continue;

            interactions.push({
                userId,
                productId: item.productId,
                quantity: item.quantity,
                timestamp: order.createdAt,
            });

            userIdSet.add(userId);
            productIdSet.add(item.productId);
        }
    }

    return {
        interactions,
        userIds: Array.from(userIdSet),
        productIds: Array.from(productIdSet),
    };
}

/**
 * Get a user's interaction history
 */
export async function getUserVector(userId: string): Promise<Map<string, number>> {
    const vector = new Map<string, number>();

    const orders = await (prisma as any).order.findMany({
        where: { userId },
        include: {
            items: true,
        },
    });

    for (const order of orders) {
        for (const item of order.items) {
            const current = vector.get(item.productId) || 0;
            vector.set(item.productId, current + item.quantity);
        }
    }

    return vector;
}

/**
 * Get interactions for a guest session (from current cart/order)
 */
export async function getSessionInteractions(sessionId: string): Promise<string[]> {
    // For guest users, we use their cart items
    // This is a simplified version - in production, track sessions explicitly
    return [];
}

/**
 * Calculate interaction score for training (normalize quantities)
 */
export function normalizeInteraction(quantity: number): number {
    // Simple normalization: cap at 10 items per purchase
    return Math.min(quantity / 10, 1.0);
}
