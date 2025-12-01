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
            items,
            total,
            userId,
            paymentMethod = "CASH",
            paymentReference,
            amountPaid,
            discountType = "NONE",
            discountAmount = 0
        } = body;

        // Get the last receipt number to increment
        const lastOrder = await prisma.order.findFirst({
            orderBy: { receiptNumber: 'desc' },
            select: { receiptNumber: true }
        });

        const nextReceiptNumber = (lastOrder?.receiptNumber || 0) + 1;

        const order = await prisma.order.create({
            data: {
                receiptNumber: nextReceiptNumber,
                total,
                paymentMethod,
                paymentReference,
                amountPaid,
                discountType,
                discountAmount,
                userId: userId || null,
                status: "COMPLETED",
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
    } catch (error) {
        console.error("Order creation error:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}
