import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/customers?search=...
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";

        const where: Record<string, unknown> = {};
        if (search) {
            where.OR = [
                { name: { contains: search } }, // Case insensitive usually depends on DB collation
                { contact: { contains: search } }
            ];
        }

        const customers = await (prisma as any).customer.findMany({
            where,
            orderBy: { name: "asc" },
            take: 20
        });

        return NextResponse.json(customers);
    } catch {
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }
}

// POST /api/customers
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, contact, notes, storeId } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        let targetStoreId = storeId;
        if (!targetStoreId) {
            const defaultStore = await prisma.store.findFirst();
            targetStoreId = defaultStore?.id;
        }

        const customer = await (prisma as any).customer.create({
            data: {
                name,
                contact,
                notes,
                storeId: targetStoreId,
                pointsBalance: 0
            }
        });

        return NextResponse.json(customer);
    } catch (error) {
        console.error("Create customer error:", error);
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }
}
