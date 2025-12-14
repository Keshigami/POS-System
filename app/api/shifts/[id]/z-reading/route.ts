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

        // 2. Aggregate sales by payment method from the new Payment model
        // We need to fetch all payments associated with orders in this shift
        // OR we can group the orders' payments.

        let totalSales = 0;
        let cashSales = 0;
        let cardSales = 0;
        let gcashSales = 0;
        let paymayaSales = 0;
        let otherSales = 0;

        // Iterate through all orders and their payments
        shift.orders.forEach((order: any) => {
            if (order.status === 'COMPLETED') {
                // Check if order has payments relation loaded
                if (order.payments && order.payments.length > 0) {
                    order.payments.forEach((payment: any) => {
                        const amount = payment.amount;
                        totalSales += amount;

                        const method = payment.method.toUpperCase();
                        if (method === 'CASH') cashSales += amount;
                        else if (method === 'CARD' || method === 'DEBIT' || method === 'CREDIT') cardSales += amount;
                        else if (method === 'GCASH') gcashSales += amount;
                        else if (method === 'PAYMAYA') paymayaSales += amount;
                        else otherSales += amount;
                    });
                } else {
                    // Fallback for legacy orders without Payment records (using order.paymentMethod)
                    // This ensures old data still works in reports
                    const amount = order.total;
                    totalSales += amount;
                    const method = (order.paymentMethod || 'CASH').toUpperCase();
                    if (method === 'CASH') cashSales += amount;
                    else if (method === 'CARD' || method === 'DEBIT' || method === 'CREDIT') cardSales += amount;
                    else if (method === 'GCASH') gcashSales += amount;
                    else if (method === 'PAYMAYA') paymayaSales += amount;
                    else otherSales += amount;
                }
            }
        });

        const totalOrders = shift.orders.length;

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
