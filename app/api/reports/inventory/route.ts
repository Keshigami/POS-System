import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        // Fetch all products
        // In a real large scale app, we'd use aggregations or raw queries for speed
        const products = await prisma.product.findMany();

        let totalValue = 0;
        let totalItems = 0;
        let lowStockItems = [];

        for (const p of products) {
            const stockVal = p.stock * p.price;
            totalValue += stockVal;
            totalItems += p.stock;

            if (p.stock <= p.reorderPoint) {
                lowStockItems.push({
                    id: p.id,
                    name: p.name,
                    stock: p.stock,
                    reorderPoint: p.reorderPoint
                });
            }
        }

        return NextResponse.json({
            totalValue,
            totalItems,
            lowStockCount: lowStockItems.length,
            lowStockItems
        });
    } catch (error) {
        console.error("Inventory Report Error:", error);
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
}
