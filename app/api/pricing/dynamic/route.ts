import { NextResponse } from 'next/server';
import {
    applyDynamicPricing,
    revertDynamicPricing,
    getPriceHistory,
    calculateDynamicPrice,
} from '@/lib/ai/dynamic-pricing';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const action = searchParams.get('action');

        if (action === 'history' && productId) {
            const history = await getPriceHistory(productId);
            return NextResponse.json(history);
        }

        if (action === 'calculate' && productId) {
            const pricing = await calculateDynamicPrice(productId);
            return NextResponse.json(pricing);
        }

        return NextResponse.json(
            { error: 'Invalid request parameters' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Dynamic pricing error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const action = body.action;

        if (action === 'apply') {
            const count = await applyDynamicPricing();
            return NextResponse.json({
                success: true,
                message: `Dynamic pricing applied to ${count} products`,
                adjustedCount: count,
            });
        }

        if (action === 'revert') {
            const count = await revertDynamicPricing();
            return NextResponse.json({
                success: true,
                message: `Reverted pricing for ${count} products`,
                revertedCount: count,
            });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Dynamic pricing error:', error);
        return NextResponse.json(
            { error: 'Failed to apply dynamic pricing' },
            { status: 500 }
        );
    }
}
