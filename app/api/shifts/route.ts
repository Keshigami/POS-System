import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, storeId, action, cashAmount, notes } = body;

        // Verify user exists (and possibly PIN logic later)
        if (!userId || !storeId) return NextResponse.json({ error: "User and Store required" }, { status: 400 });

        if (action === "OPEN") {
            // check if already open
            // Cast to any to avoid type errors if Shift model isn't fully recognized
            const activeShift = await (prisma as any).shift.findFirst({
                where: { userId, status: "OPEN" }
            });

            if (activeShift) return NextResponse.json({ error: "Shift already active" }, { status: 400 });

            const shift = await (prisma as any).shift.create({
                data: {
                    userId,
                    storeId,
                    startCash: parseFloat(cashAmount || 0),
                    startTime: new Date(),
                    status: "OPEN",
                    notes
                }
            });
            return NextResponse.json(shift);

        } else if (action === "CLOSE") {
            const activeShift = await (prisma as any).shift.findFirst({
                where: { userId, status: "OPEN" }
            });

            if (!activeShift) return NextResponse.json({ error: "No active shift to close" }, { status: 400 });

            const startCash = activeShift.startCash;
            const endCash = parseFloat(cashAmount || 0);

            // Calculate expected cash based on transactions
            // sales - refunds (not imp yet) + startCash
            // We need to fetch orders for this shift

            const orders = await (prisma as any).order.findMany({
                where: { shiftId: activeShift.id, status: "COMPLETED" },
                include: { payments: true }
            });

            let cashSales = 0;
            orders.forEach((o: any) => {
                if (o.payments && o.payments.length > 0) {
                    o.payments.forEach((p: any) => {
                        if (p.method === "CASH") cashSales += p.amount;
                    });
                } else if (o.paymentMethod === "CASH") {
                    // Fallback
                    cashSales += (o.amountPaid || o.total);
                }
            });

            const expectedCash = startCash + cashSales;
            const variance = endCash - expectedCash;

            const shift = await (prisma as any).shift.update({
                where: { id: activeShift.id },
                data: {
                    endTime: new Date(),
                    endCash,
                    expectedCash,
                    variance,
                    status: "CLOSED",
                    notes: notes ? (activeShift.notes + "\n" + notes) : activeShift.notes
                }
            });
            return NextResponse.json(shift);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Shift error:", error);
        return NextResponse.json({ error: "Shift operation failed" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    try {
        const activeShift = await (prisma as any).shift.findFirst({
            where: { userId, status: "OPEN" },
            include: { user: true }
        });

        return NextResponse.json(activeShift || null);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch shift" }, { status: 500 });
    }
}
