import * as tf from '@tensorflow/tfjs';
import prisma from '../prisma';

/**
 * Prepare time series data for LSTM training
 * Returns sequences of historical sales data
 */
export async function prepareTimeSeriesData(
    productId: string,
    daysHistory: number = 30,
    sequenceLength: number = 14
): Promise<{ xs: number[][], ys: number[] }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysHistory);

    const orders = await prisma.order.findMany({
        where: {
            createdAt: { gte: startDate, lte: endDate },
            status: 'COMPLETED',
        },
        include: {
            items: { where: { productId } },
        },
        orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const dailySales = new Map<string, number>();
    orders.forEach((order) => {
        const dateKey = order.createdAt.toISOString().split('T')[0];
        const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
        dailySales.set(dateKey, (dailySales.get(dateKey) || 0) + quantity);
    });

    // Fill missing days with 0
    const salesArray: number[] = [];
    for (let i = 0; i < daysHistory; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        salesArray.push(dailySales.get(dateKey) || 0);
    }

    // Create sequences
    const xs: number[][] = [];
    const ys: number[] = [];

    for (let i = 0; i <= salesArray.length - sequenceLength - 1; i++) {
        xs.push(salesArray.slice(i, i + sequenceLength));
        ys.push(salesArray[i + sequenceLength]);
    }

    return { xs, ys };
}

/**
 * Normalize data to 0-1 range
 */
export function normalizeData(data: number[][]): {
    normalized: number[][];
    min: number;
    max: number;
} {
    const flat = data.flat();
    const min = Math.min(...flat);
    const max = Math.max(...flat);
    const range = max - min || 1;

    const normalized = data.map((sequence) =>
        sequence.map((val) => (val - min) / range)
    );

    return { normalized, min, max };
}

/**
 * Denormalize predictions back to original scale
 */
export function denormalize(value: number, min: number, max: number): number {
    return value * (max - min) + min;
}

/**
 * Split data into train and test sets
 */
export function trainTestSplit<T>(
    data: T[],
    testSize: number = 0.2
): { train: T[]; test: T[] } {
    const splitIndex = Math.floor(data.length * (1 - testSize));
    return {
        train: data.slice(0, splitIndex),
        test: data.slice(splitIndex),
    };
}

/**
 * Prepare pricing features for regression model
 */
export async function preparePricingFeatures(
    productId: string,
    days: number = 30
): Promise<{ features: number[][]; prices: number[] }> {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            orderItems: {
                where: {
                    order: {
                        createdAt: {
                            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
                        },
                    },
                },
                include: { order: true },
            },
        },
    });

    if (!product) return { features: [], prices: [] };

    const features: number[][] = [];
    const prices: number[] = [];

    // Calculate daily metrics
    const dailyData = new Map<string, { sales: number; revenue: number }>();

    product.orderItems.forEach((item) => {
        const dateKey = item.order.createdAt.toISOString().split('T')[0];
        const existing = dailyData.get(dateKey) || { sales: 0, revenue: 0 };
        existing.sales += item.quantity;
        existing.revenue += item.price * item.quantity;
        dailyData.set(dateKey, existing);
    });

    // Create feature vectors
    dailyData.forEach((data) => {
        const avgPrice = data.sales > 0 ? data.revenue / data.sales : product.price;
        features.push([
            product.stock / 100, // Normalized stock level
            data.sales / 10, // Normalized sales quantity
            new Date().getDay() / 7, // Day of week normalized
            Math.random(), // Placeholder for time features
        ]);
        prices.push(avgPrice / product.price); // Price relative to current
    });

    return { features, prices };
}

/**
 * Convert arrays to TensorFlow tensors
 */
export function createTensors(xs: number[][], ys: number[]) {
    return {
        xsTensor: tf.tensor3d(xs.map((x) => x.map((v) => [v]))),
        ysTensor: tf.tensor2d(ys, [ys.length, 1]),
    };
}

/**
 * Calculate evaluation metrics
 */
export function calculateMetrics(predictions: number[], actuals: number[]) {
    const n = predictions.length;

    // MAE (Mean Absolute Error)
    const mae = predictions.reduce((sum, pred, i) =>
        sum + Math.abs(pred - actuals[i]), 0) / n;

    // RMSE (Root Mean Squared Error)
    const mse = predictions.reduce((sum, pred, i) =>
        sum + Math.pow(pred - actuals[i], 2), 0) / n;
    const rmse = Math.sqrt(mse);

    // MAPE (Mean Absolute Percentage Error)
    const mape = predictions.reduce((sum, pred, i) => {
        if (actuals[i] === 0) return sum;
        return sum + Math.abs((actuals[i] - pred) / actuals[i]);
    }, 0) / n * 100;

    return {
        mae: Number(mae.toFixed(2)),
        rmse: Number(rmse.toFixed(2)),
        mape: Number(mape.toFixed(2))
    };
}
