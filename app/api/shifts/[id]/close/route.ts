import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH to close a shift
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { endCash, notes } = body;

        if (endCash === undefined || endCash === null) {
            return NextResponse.json(
                { error: 'endCash is required' },
                { status: 400 }
            );
        }

        // Get shift with all orders
        const shift = await prisma.shift.findUnique({
            where: { id },
            include: {
                orders: true,
            },
        });

        if (!shift) {
            return NextResponse.json(
                { error: 'Shift not found' },
                { status: 404 }
            );
        }

        if (shift.status === 'CLOSED') {
            return NextResponse.json(
                { error: 'Shift is already closed' },
                { status: 400 }
            );
        }

        // Calculate expected cash
        const cashOrders = shift.orders.filter(
            (order: any) => order.paymentMethod === 'CASH'
        );
        const totalCashSales = cashOrders.reduce(
            (sum: number, order: any) => sum + (order.amountPaid || 0),
            0
        );
        const expectedCash = shift.startCash + totalCashSales;
        const variance = parseFloat(endCash) - expectedCash;

        // Update shift
        const updatedShift = await prisma.shift.update({
            where: { id },
            data: {
                endCash: parseFloat(endCash),
                expectedCash,
                variance,
                status: 'CLOSED',
                endTime: new Date(),
                notes: notes || shift.notes,
            },
            include: {
                user: { select: { name: true } },
                store: { select: { name: true } },
            },
        });

        return NextResponse.json(updatedShift);
    } catch (error: any) {
        console.error('Error closing shift:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
