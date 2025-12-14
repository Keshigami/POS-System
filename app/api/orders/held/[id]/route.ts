import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// DELETE held order (restore or cancel)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action'); // 'restore' or 'cancel'

        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        if (order.status !== 'HELD') {
            return NextResponse.json(
                { error: 'Order is not held' },
                { status: 400 }
            );
        }

        if (action === 'cancel') {
            // Delete the held order
            await prisma.order.delete({
                where: { id },
            });

            return NextResponse.json({ success: true, message: 'Held order cancelled' });
        }

        // For 'restore', just return the order data
        // The frontend will handle restoring to cart
        return NextResponse.json(order);
    } catch (error: any) {
        console.error('Error processing held order:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
