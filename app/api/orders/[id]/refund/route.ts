import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface OrderItem {
    productId: string;
    quantity: number;
}

interface Payment {
    method: string;
    amount: number;
}

interface OrderWithRelations {
    id: string;
    status: string;
    customerId: string | null;
    items: OrderItem[];
    payments: Payment[];
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const orderId = params.id;

        // 1. Find the order (use type assertion to bypass stale IDE types)
        const order = await (prisma as any).order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: true } },
                payments: true,
                customer: true,
            },
        }) as OrderWithRelations | null;

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.status === "REFUNDED") {
            return NextResponse.json({ error: "Order already refunded" }, { status: 400 });
        }

        // 2. Restore stock for each item
        for (const item of order.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
            });
        }

        // 3. Reduce customer debt if it was a credit sale
        const creditPayments = order.payments.filter((p: Payment) => p.method === "CREDIT");
        const totalCreditAmount = creditPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);

        if (totalCreditAmount > 0 && order.customerId) {
            await (prisma as any).customer.update({
                where: { id: order.customerId },
                data: { totalDebt: { decrement: totalCreditAmount } },
            });
        }

        // 4. Update order status to REFUNDED
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: "REFUNDED" },
        });

        return NextResponse.json(updatedOrder);
    } catch (error: unknown) {
        console.error("Refund error:", error);
        const message = error instanceof Error ? error.message : "Failed to process refund";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
