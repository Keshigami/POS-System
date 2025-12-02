import { NextResponse } from 'next/server';
import { trainModel } from '@/lib/ml/collaborative-filtering';

export async function POST(request: Request) {
    try {
        const { epochs = 50 } = await request.json();

        console.log('🚀 Training Collaborative Filtering model...');
        const result = await trainModel(epochs);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Collaborative filtering model trained successfully',
                metrics: result.metrics,
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error,
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Training error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        info: 'POST to this endpoint to train the collaborative filtering model',
        params: {
            epochs: 'number (default: 50)',
        },
    });
}
