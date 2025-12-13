import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET Z-Reading report for a shift
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const shift = await prisma.shift.findUnique({
            where: { id },
            include: {
                orders: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
                user: { select: { name: true, email: true } },
                store: { select: { name: true, location: true } },
            },
        });

        if (!shift) {
            return NextResponse.json(
                { error: 'Shift not found' },
                { status: 404 }
            );
        }

        // Calculate totals
        const totalSales = shift.orders.reduce((sum: number, order: any) => sum + order.total, 0);
        const totalOrders = shift.orders.length;

        // By payment method
        const cashSales = shift.orders
            .filter((o: any) => o.paymentMethod === 'CASH')
            .reduce((sum: number, o: any) => sum + o.total, 0);
        const cardSales = shift.orders
            .filter((o: any) => o.paymentMethod === 'CARD')
            .reduce((sum: number, o: any) => sum + o.total, 0);
        const gcashSales = shift.orders
            .filter((o: any) => o.paymentMethod === 'GCASH')
            .reduce((sum: number, o: any) => sum + o.total, 0);
        const paymayaSales = shift.orders
            .filter((o: any) => o.paymentMethod === 'PAYMAYA')
            .reduce((sum: number, o: any) => sum + o.total, 0);

        // Discounts
        const totalDiscounts = shift.orders.reduce(
            (sum: number, o: any) => sum + (o.discountAmount || 0),
            0
        );

        return NextResponse.json({
            shift: {
                id: shift.id,
                startTime: shift.startTime,
                endTime: shift.endTime,
                startCash: shift.startCash,
                endCash: shift.endCash,
                expectedCash: shift.expectedCash,
                variance: shift.variance,
                status: shift.status,
                user: shift.user,
                store: shift.store,
            },
            summary: {
                totalSales,
                totalOrders,
                cashSales,
                cardSales,
                gcashSales,
                paymayaSales,
                totalDiscounts,
                avgOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
            },
            orders: shift.orders,
        });
    } catch (error: any) {
        console.error('Error generating Z-Reading:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
