import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "";

        const where: any = {};

        if (search) {
            where.OR = [
                { poNumber: { contains: search } },
                { supplier: { name: { contains: search } } },
            ];
        }

        if (status) {
            where.status = status;
        }

        const purchaseOrders = await prisma.purchaseOrder.findMany({
            where,
            include: {
                supplier: true,
                store: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(purchaseOrders);
    } catch (error) {
        console.error("Error fetching POs:", error);
        return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { supplierId, storeId, items, notes, expectedDate } = body;

        if (!supplierId || !storeId || !items || items.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Generate PO Number (PO-{timestamp})
        const poNumber = `PO-${Date.now()}`;

        // Calculate total
        let totalAmount = 0;
        const poItems = items.map((item: any) => {
            const total = item.quantity * item.costPrice;
            totalAmount += total;
            return {
                productId: item.productId,
                quantity: item.quantity,
                costPrice: item.costPrice
            };
        });

        const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
                poNumber,
                supplierId,
                storeId,
                status: "ORDERED",
                totalAmount,
                notes,
                expectedDate: expectedDate ? new Date(expectedDate) : null,
                items: {
                    create: poItems
                }
            },
            include: {
                items: true
            }
        });

        return NextResponse.json(purchaseOrder);
    } catch (error) {
        console.error("Error creating PO:", error);
        return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
    }
}
