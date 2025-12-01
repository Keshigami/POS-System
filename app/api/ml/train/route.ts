import { NextResponse } from 'next/server';
import { trainForecastingModel } from '@/lib/ml/forecasting-model';
import { trainPricingModel } from '@/lib/ml/pricing-model';
import prisma from '@/lib/prisma';

/**
 * Train ML models for a specific product or all products
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { modelType, productId, epochs } = body;

        if (!modelType || !['forecasting', 'pricing', 'all'].includes(modelType)) {
            return NextResponse.json(
                { error: 'Invalid model type. Use: forecasting, pricing, or all' },
                { status: 400 }
            );
        }

        const results: any = {};

        // Train forecasting model
        if (modelType === 'forecasting' || modelType === 'all') {
            if (!productId) {
                return NextResponse.json(
                    { error: 'Product ID required for forecasting model training' },
                    { status: 400 }
                );
            }

            try {
                const { metrics, history } = await trainForecastingModel(
                    productId,
                    epochs || 100
                );
                results.forecasting = {
                    success: true,
                    productId,
                    metrics,
                    finalLoss: history.loss[history.loss.length - 1],
                };
            } catch (error: any) {
                results.forecasting = {
                    success: false,
                    error: error.message,
                };
            }
        }

        // Train pricing model
        if (modelType === 'pricing' || modelType === 'all') {
            if (!productId) {
                return NextResponse.json(
                    { error: 'Product ID required for pricing model training' },
                    { status: 400 }
                );
            }

            try {
                await trainPricingModel(productId, epochs || 50);
                results.pricing = {
                    success: true,
                    productId,
                };
            } catch (error: any) {
                results.pricing = {
                    success: false,
                    error: error.message,
                };
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Model training completed',
            results,
        });
    } catch (error: any) {
        console.error('Model training error:', error);
        return NextResponse.json(
            { error: 'Failed to train models', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * Get model training status and metrics
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            // Return all products with models
            return NextResponse.json({
                message: 'Provide productId to get specific model metrics',
            });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check if models exist
        const fs = require('fs');
        const path = require('path');

        const forecastingPath = path.join(process.cwd(), 'models/forecasting', productId, 'metadata.json');
        const pricingPath = path.join(process.cwd(), 'models/pricing', productId, 'metadata.json');

        const models: any = {};

        if (fs.existsSync(forecastingPath)) {
            models.forecasting = JSON.parse(fs.readFileSync(forecastingPath, 'utf-8'));
        }

        if (fs.existsSync(pricingPath)) {
            models.pricing = JSON.parse(fs.readFileSync(pricingPath, 'utf-8'));
        }

        return NextResponse.json({
            productId,
            productName: product.name,
            models,
            hasForecastingModel: !!models.forecasting,
            hasPricingModel: !!models.pricing,
        });
    } catch (error: any) {
        console.error('Error fetching model info:', error);
        return NextResponse.json(
            { error: 'Failed to fetch model information' },
            { status: 500 }
        );
    }
}
