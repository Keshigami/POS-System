import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all held orders
export async function GET() {
    try {
        const heldOrders = await prisma.order.findMany({
            where: { status: 'HELD' },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { parkedAt: 'desc' },
        });

        return NextResponse.json(heldOrders);
    } catch (error: any) {
        console.error('Error fetching held orders:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// POST to park an order
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, total, discountType, discountAmount, paymentMethod, parkedBy, storeId, shiftId } = body;

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: 'Cannot park an empty order' },
                { status: 400 }
            );
        }

        const order = await prisma.order.create({
            data: {
                total: parseFloat(total),
                status: 'HELD',
                paymentMethod: paymentMethod || 'CASH',
                discountType: discountType || 'NONE',
                discountAmount: parseFloat(discountAmount || 0),
                parkedAt: new Date(),
                parkedBy: parkedBy || 'Unknown',
                storeId,
                shiftId: shiftId || null,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return NextResponse.json(order);
    } catch (error: any) {
        console.error('Error parking order:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
