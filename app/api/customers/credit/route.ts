import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerId, amount, paymentMethod } = body;

        if (!customerId || !amount) {
            return NextResponse.json({ error: "Customer and Amount required" }, { status: 400 });
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Transaction: Deduct from totalDebt, Create CreditTransaction, Record Payment (if we want to track revenue from debt payments)
        // For revenue tracking, we probably want a Payment record linked to... what? 
        // A debt payment is cash coming in, so it should be in the drawer.
        // We can link it to a "Debt Payment" shift entry or just a general payment. 
        // For now, let's update Customer and CreditTransaction.

        const customer = await prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer) throw new Error("Customer not found");

        const transaction = await prisma.$transaction([
            prisma.customer.update({
                where: { id: customerId },
                data: {
                    totalDebt: { decrement: numericAmount }
                }
            }),
            prisma.creditTransaction.create({
                data: {
                    customerId: customerId,
                    amount: -numericAmount, // Negative for debt reduction
                    type: "PAYMENT",
                    description: `Debt payment via ${paymentMethod || 'CASH'}`,
                }
            })
        ]);

        return NextResponse.json({ success: true, newDebt: transaction[0].totalDebt });

    } catch (error) {
        console.error("Debt payment error:", error);
        return NextResponse.json({ error: "Payment failed" }, { status: 500 });
    }
}
