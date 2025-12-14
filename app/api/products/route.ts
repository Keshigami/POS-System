import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const barcode = searchParams.get("barcode") || "";

        const where: any = {};

        if (barcode) {
            // Exact match for barcode (Product or Variant)
            // Complex query: find product with barcode OR product with variant with barcode
            // Prisma doesn't support easy OR across relations in top-level where easily for mixed types.
            // But we can do:
            where.OR = [
                { barcode: barcode },
                { variants: { some: { barcode: barcode } } }
            ];
        } else if (search) {
            where.description = { contains: search }; // Wait, model is 'name'
            where.OR = [
                { name: { contains: search } },
                { barcode: { contains: search } }
            ];
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                category: true,
                variants: true // Include variants
            },
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("Products GET error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, price, costPrice, stock, categoryId, storeId, barcode, hasVariants } = body;

        if (!name || !price || !categoryId) { // Removed stock check as it might be 0 for variants
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let targetStoreId = storeId;
        if (!targetStoreId) {
            const defaultStore = await prisma.store.findFirst();
            targetStoreId = defaultStore?.id;
        }

        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                costPrice: parseFloat(costPrice || 0),
                stock: stock ? parseInt(stock) : 0,
                categoryId,
                storeId: targetStoreId,
                barcode,
                hasVariants: hasVariants || false
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("Create product error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
