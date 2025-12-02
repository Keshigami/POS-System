import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
            },
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, price, costPrice, stock, categoryId, storeId } = body;

        if (!name || !price || !stock || !categoryId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get default store if not provided (for now)
        let targetStoreId = storeId;
        if (!targetStoreId) {
            const defaultStore = await prisma.store.findFirst();
            if (defaultStore) {
                targetStoreId = defaultStore.id;
            } else {
                // Fallback or error - for now let's assume seed ran
                return NextResponse.json({ error: "No store found" }, { status: 500 });
            }
        }

        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                costPrice: parseFloat(costPrice || 0),
                stock: parseInt(stock),
                categoryId,
                storeId: targetStoreId,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("Create product error:", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}
