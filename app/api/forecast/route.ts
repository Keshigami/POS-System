import { NextResponse } from 'next/server';
import { forecastProductSales, getForecast, generateAllForecasts } from '@/lib/ai/forecasting';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const days = parseInt(searchParams.get('days') || '7');

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Check for existing forecasts
        const existingForecasts = await getForecast(productId, days);

        if (existingForecasts.length > 0) {
            return NextResponse.json(existingForecasts);
        }

        // Generate new forecasts
        const forecasts = await forecastProductSales(productId, days);

        return NextResponse.json(forecasts);
    } catch (error) {
        console.error('Forecast error:', error);
        return NextResponse.json(
            { error: 'Failed to generate forecast' },
            { status: 500 }
        );
    }
}

// Generate forecasts for all products
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const days = body.days || 7;

        await generateAllForecasts(days);

        return NextResponse.json({ success: true, message: `Forecasts generated for ${days} days` });
    } catch (error) {
        console.error('Forecast generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate forecasts' },
            { status: 500 }
        );
    }
}
