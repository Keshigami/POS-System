import prisma from '../prisma';

export interface DynamicPricing {
    originalPrice: number;
    adjustedPrice: number;
    reason: 'LOW_STOCK' | 'PEAK_HOURS' | 'SLOW_MOVING' | 'SEASONAL';
    adjustment: number;
}

/**
 * Calculate dynamic price for a product based on various factors
 */
export async function calculateDynamicPrice(
    productId: string
): Promise<DynamicPricing | null> {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            orderItems: {
                where: {
                    order: {
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                        },
                    },
                },
            },
        },
    });

    if (!product) return null;

    const originalPrice = product.price;
    let adjustedPrice = originalPrice;
    let reason: DynamicPricing['reason'] = 'SLOW_MOVING';
    let shouldAdjust = false;

    // Check for low stock (increase price)
    if (product.stock < 10) {
        const increasePercent = 0.1; // 10% increase
        adjustedPrice = originalPrice * (1 + increasePercent);
        reason = 'LOW_STOCK';
        shouldAdjust = true;
    }

    // Check for slow-moving products (decrease price)
    const recentSales = product.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    if (!shouldAdjust && recentSales < 5 && product.stock > 20) {
        const decreasePercent = 0.2; // 20% discount
        adjustedPrice = originalPrice * (1 - decreasePercent);
        reason = 'SLOW_MOVING';
        shouldAdjust = true;
    }

    // Peak hours pricing (6 AM - 9 AM, 11 AM - 2 PM, 5 PM - 8 PM)
    const currentHour = new Date().getHours();
    const isPeakHour =
        (currentHour >= 6 && currentHour < 9) ||
        (currentHour >= 11 && currentHour < 14) ||
        (currentHour >= 17 && currentHour < 20);

    if (!shouldAdjust && isPeakHour && product.stock < 30) {
        const increasePercent = 0.15; // 15% increase
        adjustedPrice = originalPrice * (1 + increasePercent);
        reason = 'PEAK_HOURS';
        shouldAdjust = true;
    }

    if (!shouldAdjust) {
        return null; // No price adjustment needed
    }

    // Round to 2 decimal places
    adjustedPrice = Math.round(adjustedPrice * 100) / 100;
    const adjustment = adjustedPrice - originalPrice;

    return {
        originalPrice,
        adjustedPrice,
        reason,
        adjustment,
    };
}

/**
 * Apply dynamic pricing adjustments to all products
 */
export async function applyDynamicPricing(): Promise<number> {
    const products = await prisma.product.findMany();
    let adjustedCount = 0;

    for (const product of products) {
        const pricing = await calculateDynamicPrice(product.id);

        if (pricing) {
            // Record price history
            await prisma.priceHistory.create({
                data: {
                    productId: product.id,
                    originalPrice: pricing.originalPrice,
                    adjustedPrice: pricing.adjustedPrice,
                    reason: pricing.reason,
                },
            });

            // Update product price
            await prisma.product.update({
                where: { id: product.id },
                data: { price: pricing.adjustedPrice },
            });

            adjustedCount++;
        }
    }

    return adjustedCount;
}

/**
 * Revert all active price adjustments
 */
export async function revertDynamicPricing(): Promise<number> {
    const activePriceChanges = await prisma.priceHistory.findMany({
        where: { revertedAt: null },
        include: { product: true },
    });

    let revertedCount = 0;

    for (const priceChange of activePriceChanges) {
        // Revert to original price
        await prisma.product.update({
            where: { id: priceChange.productId },
            data: { price: priceChange.originalPrice },
        });

        // Mark as reverted
        await prisma.priceHistory.update({
            where: { id: priceChange.id },
            data: { revertedAt: new Date() },
        });

        revertedCount++;
    }

    return revertedCount;
}

/**
 * Get pricing history for a product
 */
export async function getPriceHistory(productId: string) {
    return await prisma.priceHistory.findMany({
        where: { productId },
        include: { product: true },
        orderBy: { appliedAt: 'desc' },
        take: 20,
    });
}
