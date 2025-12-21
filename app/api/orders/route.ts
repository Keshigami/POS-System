import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            items, total, paymentMethod, payments, subtotal, discount, tax, shiftId, parkedAt, parkedBy, status,
            userId, paymentReference, amountPaid, discountType = "NONE", discountAmount = 0, customerId
        } = body;

        // Get the last receipt number to increment
        const lastOrder = await prisma.order.findFirst({
            orderBy: { receiptNumber: 'desc' },
            select: { receiptNumber: true }
        });

        const nextReceiptNumber = (lastOrder?.receiptNumber || 0) + 1;

        // For Guest/Non-Cloud mode, use the first available store if not provided
        let targetStoreId = body.storeId;
        if (!targetStoreId) {
            const defaultStore = await prisma.store.findFirst();
            targetStoreId = defaultStore?.id;
        }

        if (!targetStoreId) {
            return NextResponse.json(
                { error: "No store found. Please seed the database." },
                { status: 400 }
            );
        }

        // Validation for stock (existing logic)
        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                return NextResponse.json(
                    { error: `Product not found: ${item.name}` },
                    { status: 404 }
                );
            }

            if (product.stock < item.quantity) {
                return NextResponse.json(
                    { error: `Insufficient stock for ${item.name}. Available: ${product.stock}` },
                    { status: 400 }
                );
            }
        }

        // Determine final status
        const orderStatus = status || 'COMPLETED';

        // Prepare payment data
        let paymentRecords: any[] = [];
        let creditAmount = 0;

        if (orderStatus === 'COMPLETED') {
            if (payments && Array.isArray(payments) && payments.length > 0) {
                paymentRecords = payments.map((p: any) => {
                    const amount = parseFloat(p.amount);
                    if (p.method === 'CREDIT') {
                        creditAmount += amount;
                    }
                    return {
                        amount: amount,
                        method: p.method,
                        reference: p.reference,
                    };
                });
            } else if (paymentMethod) {
                const amount = parseFloat(total);
                if (paymentMethod === 'CREDIT') {
                    creditAmount += amount;
                }
                paymentRecords = [{
                    amount: amount,
                    method: paymentMethod,
                    reference: paymentReference
                }];
            }

            // CREDIT VALIDATION
            if (creditAmount > 0) {
                if (!customerId) {
                    return NextResponse.json(
                        { error: "Customer is required for Credit payments." },
                        { status: 400 }
                    );
                }

                const customer = await prisma.customer.findUnique({ where: { id: customerId } });
                if (!customer) {
                    return NextResponse.json(
                        { error: "Customer not found." },
                        { status: 404 }
                    );
                }

                if (customer.creditLimit && (customer.totalDebt + creditAmount > customer.creditLimit)) {
                    return NextResponse.json(
                        { error: `Credit limit exceeded. Available: ${customer.creditLimit - customer.totalDebt}` },
                        { status: 400 }
                    );
                }
            }
        }

        // ============================================================
        // ATOMIC TRANSACTION: All state changes wrapped for consistency
        // ============================================================
        const order = await prisma.$transaction(async (tx) => {
            // 1. Update customer debt for credit payments
            if (creditAmount > 0 && customerId) {
                await tx.customer.update({
                    where: { id: customerId },
                    data: { totalDebt: { increment: creditAmount } }
                });
            }

            // 2. Gift Card & Loyalty Deductions
            for (const payment of paymentRecords) {
                if (payment.method === 'GIFT_CARD') {
                    const code = payment.reference;
                    const giftCard = await tx.giftCard.findUnique({ where: { code } });

                    if (!giftCard) throw new Error(`Gift Card invalid: ${code}`);
                    if (giftCard.currentBalance < payment.amount) throw new Error('Insufficient Gift Card balance');

                    const newBalance = giftCard.currentBalance - payment.amount;
                    await tx.giftCard.update({
                        where: { id: giftCard.id },
                        data: {
                            currentBalance: { decrement: payment.amount },
                            status: newBalance <= 0 ? 'USED' : 'ACTIVE'
                        }
                    });
                } else if (payment.method === 'LOYALTY_POINTS') {
                    if (!customerId) throw new Error("Customer required for points redemption");

                    const store = await tx.store.findUnique({ where: { id: targetStoreId } });
                    const pointValue = store?.pointValue || 1.0;
                    const pointsRequired = Math.ceil(payment.amount / pointValue);

                    const customer = await tx.customer.findUnique({ where: { id: customerId } });
                    if (!customer || customer.pointsBalance < pointsRequired) {
                        throw new Error("Insufficient loyalty points");
                    }

                    await tx.customer.update({
                        where: { id: customerId },
                        data: { pointsBalance: { decrement: pointsRequired } }
                    });
                }
            }

            // 3. Decrement Stock using FIFO (First In, First Out) from batches
            for (const item of items) {
                let remainingQty = item.quantity;

                // Try FIFO deduction from batches first
                const batches = await tx.productBatch.findMany({
                    where: { productId: item.productId, stock: { gt: 0 } },
                    orderBy: [
                        { expiryDate: 'asc' },
                        { receivedDate: 'asc' }
                    ]
                });

                for (const batch of batches) {
                    if (remainingQty <= 0) break;

                    const deductFromBatch = Math.min(batch.stock, remainingQty);
                    await tx.productBatch.update({
                        where: { id: batch.id },
                        data: { stock: { decrement: deductFromBatch } }
                    });
                    remainingQty -= deductFromBatch;
                }

                // Always update the main product stock for display purposes
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // 4. Create the Order with items and payments
            const createdOrder = await tx.order.create({
                data: {
                    receiptNumber: nextReceiptNumber,
                    total: parseFloat(total),
                    discountAmount: parseFloat(discount || discountAmount || 0),
                    paymentMethod: paymentMethod || (paymentRecords.length > 0 ? paymentRecords[0].method : 'CASH'),
                    status: orderStatus,
                    shiftId: shiftId,
                    storeId: targetStoreId,
                    parkedAt: parkedAt ? new Date(parkedAt) : null,
                    parkedBy: parkedBy,
                    paymentReference: paymentReference,
                    amountPaid: parseFloat(amountPaid || total),
                    customerId: customerId,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            costPrice: item.costPrice || 0,
                        })),
                    },
                    payments: {
                        create: paymentRecords
                    }
                },
                include: {
                    items: true,
                    payments: true,
                    customer: true,
                },
            });

            // 5. Loyalty Points Earning (still within transaction)
            if (orderStatus === 'COMPLETED' && customerId) {
                const store = await tx.store.findUnique({ where: { id: targetStoreId } });
                const earnRate = store?.pointsEarnRate || 0.01;
                const pointsEarned = Math.floor(parseFloat(amountPaid || total) * earnRate);

                if (pointsEarned > 0) {
                    await tx.customer.update({
                        where: { id: customerId },
                        data: { pointsBalance: { increment: pointsEarned } }
                    });
                }
            }

            return createdOrder;
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error("Order creation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create order";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
