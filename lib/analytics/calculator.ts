import prisma from '../prisma';

export interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    topProducts: { id: string; name: string; revenue: number; quantity: number }[];
    peakHour: number | null;
}

/**
 * Calculate analytics for a given date range
 */
export async function calculateAnalytics(
    startDate: Date,
    endDate: Date
): Promise<AnalyticsData> {
    const orders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            status: 'COMPLETED',
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate top products
    const productStats = new Map<
        string,
        { name: string; revenue: number; quantity: number }
    >();

    orders.forEach((order) => {
        order.items.forEach((item) => {
            const existing = productStats.get(item.productId) || {
                name: item.product.name,
                revenue: 0,
                quantity: 0,
            };
            existing.revenue += item.price * item.quantity;
            existing.quantity += item.quantity;
            productStats.set(item.productId, existing);
        });
    });

    const topProducts = Array.from(productStats.entries())
        .map(([id, stats]) => ({
            id,
            name: stats.name,
            revenue: stats.revenue,
            quantity: stats.quantity,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

    // Find peak hour
    const hourCounts = new Map<number, number>();
    orders.forEach((order) => {
        const hour = order.createdAt.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    let peakHour: number | null = null;
    let maxCount = 0;
    hourCounts.forEach((count, hour) => {
        if (count > maxCount) {
            maxCount = count;
            peakHour = hour;
        }
    });

    return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        topProducts,
        peakHour,
    };
}

/**
 * Save daily analytics to database
 */
export async function saveDailyAnalytics(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const analytics = await calculateAnalytics(startOfDay, endOfDay);

    await prisma.salesAnalytics.create({
        data: {
            date: startOfDay,
            totalRevenue: analytics.totalRevenue,
            totalOrders: analytics.totalOrders,
            avgOrderValue: analytics.avgOrderValue,
            topProducts: JSON.stringify(analytics.topProducts.map((p) => p.id)),
            peakHour: analytics.peakHour,
        },
    });
}

/**
 * Get analytics for a date range
 */
export async function getAnalytics(startDate: Date, endDate: Date) {
    return await prisma.salesAnalytics.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: {
            date: 'asc',
        },
    });
}

/**
 * Calculate inventory turnover rate
 */
export async function calculateInventoryTurnover(productId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await prisma.orderItem.findMany({
        where: {
            productId,
            order: {
                createdAt: { gte: startDate },
                status: 'COMPLETED',
            },
        },
    });

    const totalSold = sales.reduce((sum, item) => sum + item.quantity, 0);
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product || product.stock === 0) return 0;

    // Turnover rate = (units sold / average inventory) * (365 / days)
    const turnoverRate = (totalSold / product.stock) * (365 / days);
    return Math.round(turnoverRate * 100) / 100;
}

/**
 * Analyze customer purchase patterns
 */
export async function analyzeCustomerInsights(
    period: 'daily' | 'weekly' | 'monthly',
    periodDate: Date
) {
    let startDate = new Date(periodDate);
    let endDate = new Date(periodDate);

    switch (period) {
        case 'daily':
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'weekly':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'monthly':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
    }

    const orders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            status: 'COMPLETED',
        },
        include: {
            items: true,
        },
    });

    const totalCustomers = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgPurchaseValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    // Find popular product combinations
    const combinations = new Map<string, number>();
    orders.forEach((order) => {
        if (order.items.length > 1) {
            const productIds = order.items.map((item) => item.productId).sort();
            const combo = productIds.join(',');
            combinations.set(combo, (combinations.get(combo) || 0) + 1);
        }
    });

    const topCombinations = Array.from(combinations.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([combo, count]) => ({ combo, count }));

    await prisma.customerInsight.create({
        data: {
            period,
            periodDate: startDate,
            totalCustomers,
            returningCustomers: 0, // Would need user tracking
            avgPurchaseValue: Math.round(avgPurchaseValue * 100) / 100,
            topCombinations: JSON.stringify(topCombinations),
        },
    });

    return {
        totalCustomers,
        avgPurchaseValue,
        topCombinations,
    };
}
