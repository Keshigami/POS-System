import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// GET /api/gift-cards?code=...
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json({ error: "Code required" }, { status: 400 });
        }

        const card = await prisma.giftCard.findUnique({
            where: { code }
        });

        if (!card) {
            return NextResponse.json({ error: "Invalid code" }, { status: 404 });
        }

        if (card.status !== "ACTIVE") {
            return NextResponse.json({ error: `Gift card is ${card.status}` }, { status: 400 });
        }

        if (card.expiresAt && new Date(card.expiresAt) < new Date()) {
            return NextResponse.json({ error: "Gift card expired" }, { status: 400 });
        }

        return NextResponse.json(card);
    } catch (error) {
        return NextResponse.json({ error: "Failed to verify gift card" }, { status: 500 });
    }
}

// POST /api/gift-cards (Issue New)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, storeId } = body; // Amount to load

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
        }

        let targetStoreId = storeId;
        if (!targetStoreId) {
            const defaultStore = await prisma.store.findFirst();
            targetStoreId = defaultStore?.id;
        }

        // Generate unique code (e.g., 12 chars upper)
        const code = crypto.randomBytes(6).toString('hex').toUpperCase();

        const card = await prisma.giftCard.create({
            data: {
                code,
                initialBalance: parseFloat(amount),
                currentBalance: parseFloat(amount),
                storeId: targetStoreId,
                status: "ACTIVE"
            }
        });

        return NextResponse.json(card);
    } catch (error) {
        console.error("Issue GC error:", error);
        return NextResponse.json({ error: "Failed to issue gift card" }, { status: 500 });
    }
}
