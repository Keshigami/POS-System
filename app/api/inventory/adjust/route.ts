
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordStockMovement } from "@/lib/inventory";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productId, quantity, type, reason, userId } = body;

        if (!productId || quantity === undefined || !type || !reason) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate type
        const validTypes = ["ADJUSTMENT", "WASTE", "RETURN", "PURCHASE", "SALE"];
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid adjustment type" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            return await recordStockMovement(tx, {
                productId,
                // Logic check: 
                // WASTE is always removal, so if user sends positive 5 for waste, we treat as -5.
                // ADJUSTMENT can be + or -.
                // Let's rely on client sending correct +/- for ADJUSTMENT, but force negative for WASTE if positive sent.
                // Actually, simplify: Just trust the signed quantity from client, or enforce rules?
                // Better: Client sends signed quantity. API validates logic if needed.
                // For WASTE, usually we say "5 items wasted", implying -5. 
                // Let's sanitize: If type is WASTE and qty is positive, flip it.
                // If type is RETURN (Customer returns to store), stock goes UP (+). 
                // Wait, Return to Supplier = OUT (-). Return from Customer = IN (+).
                // Let's standardize:
                // WASTE: Negative
                // ADJUSTMENT: Any
                // RETURN (from customer): Positive

                // Let's just pass quantity as is, but maybe ensure WASTE is negative.
                // If I select "Waste" and enter "5", I expect stock to drop by 5. 
                // So if type == WASTE and quantity > 0, quantity = -quantity.

                quantity: (type === "WASTE" && quantity > 0) ? -quantity : quantity,
                type,
                reason,
                userId: userId || undefined // Handle optional
            });
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error adjusting stock:", error);
        return NextResponse.json({ error: "Failed to adjust stock" }, { status: 500 });
    }
}
