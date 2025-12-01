import prisma from '../prisma';

interface ForecastResult {
    productId: string;
    forecastDate: Date;
    predictedSales: number;
    confidence: number;
    recommendations?: string;
}

/**
 * Generate sales forecast for a product based on historical data
 * Uses simple moving average for trend analysis
 */
export async function forecastProductSales(
    productId: string,
    daysAhead: number = 7
): Promise<ForecastResult[]> {
    // Get historical sales data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalOrders = await prisma.order.findMany({
        where: {
            createdAt: { gte: thirtyDaysAgo },
            status: 'COMPLETED',
        },
        include: {
            items: {
                where: { productId },
            },
        },
    });

    // Calculate daily sales
    const dailySales = new Map<string, number>();
    historicalOrders.forEach((order) => {
        const dateKey = order.createdAt.toISOString().split('T')[0];
        const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
        dailySales.set(dateKey, (dailySales.get(dateKey) || 0) + quantity);
    });

    // Calculate moving average
    const salesArray = Array.from(dailySales.values());
    const avgDailySales = salesArray.length > 0
        ? salesArray.reduce((a, b) => a + b, 0) / salesArray.length
        : 0;

    // Calculate standard deviation for confidence score
    const variance = salesArray.length > 0
        ? salesArray.reduce((sum, val) => sum + Math.pow(val - avgDailySales, 2), 0) / salesArray.length
        : 0;
    const stdDev = Math.sqrt(variance);

    // Confidence decreases with higher variability
    const confidence = Math.max(0.3, Math.min(0.95, 1 - (stdDev / (avgDailySales + 1))));

    // Generate forecasts
    const forecasts: ForecastResult[] = [];
    const today = new Date();

    for (let i = 1; i <= daysAhead; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(forecastDate.getDate() + i);

        // Simple forecast: use average with slight random variation
        const predicted = Math.max(0, Math.round(avgDailySales));

        // Generate restocking recommendations
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        let recommendations = '';
        if (product) {
            const projectedStock = product.stock - (predicted * i);
            if (projectedStock < 10) {
                const suggestedRestock = Math.ceil(avgDailySales * 7); // 1 week supply
                recommendations = `Low stock alert: Current stock (${product.stock}) - projected sales (${predicted * i}) = ${projectedStock}. Recommend restocking ${suggestedRestock} units.`;
            }
        }

        forecasts.push({
            productId,
            forecastDate,
            predictedSales: predicted,
            confidence: Number(confidence.toFixed(2)),
            recommendations: recommendations || undefined,
        });
    }

    return forecasts;
}

/**
 * Generate forecasts for all products and save to database
 */
export async function generateAllForecasts(daysAhead: number = 7) {
    const products = await prisma.product.findMany();

    for (const product of products) {
        const forecasts = await forecastProductSales(product.id, daysAhead);

        // Save forecasts to database
        for (const forecast of forecasts) {
            await prisma.forecastData.create({
                data: {
                    productId: forecast.productId,
                    forecastDate: forecast.forecastDate,
                    predictedSales: forecast.predictedSales,
                    confidence: forecast.confidence,
                    recommendations: forecast.recommendations,
                },
            });
        }
    }
}

/**
 * Get forecast data for a specific product
 */
export async function getForecast(productId: string, days: number = 7) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return await prisma.forecastData.findMany({
        where: {
            productId,
            forecastDate: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            product: true,
        },
        orderBy: {
            forecastDate: 'asc',
        },
    });
}
