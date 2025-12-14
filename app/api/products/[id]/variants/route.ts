import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/[id]/variants
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const variants = await prisma.productVariant.findMany({
            where: { productId: params.id },
            orderBy: { name: "asc" }
        });
        return NextResponse.json(variants);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 });
    }
}

// POST /api/products/[id]/variants
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { name, price, costPrice, stock, barcode, sku } = body;

        const variant = await prisma.productVariant.create({
            data: {
                productId: params.id,
                name,
                price: price ? parseFloat(price) : null,
                costPrice: costPrice ? parseFloat(costPrice) : null,
                stock: stock ? parseInt(stock) : 0,
                barcode,
                sku
            }
        });

        // Also update the product to hasVariants = true
        await prisma.product.update({
            where: { id: params.id },
            data: { hasVariants: true }
        });

        return NextResponse.json(variant);
    } catch (error) {
        console.error("Error creating variant:", error);
        return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
    }
}
