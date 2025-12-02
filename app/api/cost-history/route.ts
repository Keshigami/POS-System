import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { error: 'productId is required' },
                { status: 400 }
            );
        }

        const history = await prisma.costPriceHistory.findMany({
            where: { productId },
            orderBy: { recordedAt: 'desc' },
            take: 50,
        });

        return NextResponse.json(history);
    } catch (error: any) {
        console.error('Error fetching cost history:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, costPrice, source, notes } = body;

        if (!productId || costPrice === undefined) {
            return NextResponse.json(
                { error: 'productId and costPrice are required' },
                { status: 400 }
            );
        }

        const history = await prisma.costPriceHistory.create({
            data: {
                productId,
                costPrice: parseFloat(costPrice),
                source: source || 'MANUAL',
                notes: notes || null,
            },
        });

        // Also update the product's current costPrice
        await prisma.product.update({
            where: { id: productId },
            data: { costPrice: parseFloat(costPrice) },
        });

        return NextResponse.json(history);
    } catch (error: any) {
        console.error('Error creating cost history:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
