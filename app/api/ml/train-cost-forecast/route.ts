import { NextResponse } from 'next/server';
import {
    trainCostForecastingModel,
    predictCostPrices,
} from '@/lib/ml/cost-forecasting-model';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, epochs } = body;

        if (!productId) {
            return NextResponse.json(
                { error: 'productId is required' },
                { status: 400 }
            );
        }

        // Train model
        const { metrics, history } = await trainCostForecastingModel(
            productId,
            epochs || 100
        );

        return NextResponse.json({
            success: true,
            productId,
            metrics: {
                mae: Number(metrics.mae.toFixed(2)),
                rmse: Number(metrics.rmse.toFixed(2)),
                mape: Number(metrics.mape.toFixed(2)),
            },
            trainingHistory: {
                epochs: history.loss.length,
                finalLoss: Number(history.loss[history.loss.length - 1].toFixed(4)),
                finalValLoss: Number(history.val_loss[history.val_loss.length - 1].toFixed(4)),
            },
        });
    } catch (error: any) {
        console.error('Error training cost forecast model:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const daysAhead = parseInt(searchParams.get('days') || '30');

        if (!productId) {
            return NextResponse.json(
                { error: 'productId is required' },
                { status: 400 }
            );
        }

        // Get predictions
        const result = await predictCostPrices(productId, daysAhead);

        if (!result) {
            return NextResponse.json(
                { error: 'No trained model found. Train the model first.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            productId,
            daysAhead,
            predictions: result.predictions,
            confidence: result.confidence,
            forecast: {
                predicted: result.predictions[result.predictions.length - 1],
                changePercent: 0, // Will calculate based on current price
            },
        });
    } catch (error: any) {
        console.error('Error getting cost forecast:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
