import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                orderItems: {
                    where: {
                        order: {
                            createdAt: {
                                gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
                            },
                            status: "COMPLETED"
                        }
                    }
                }
            }
        });

        const forecast = products.map(product => {
            const totalSold = product.orderItems.reduce((acc, item) => acc + item.quantity, 0);
            const avgDailySales = totalSold / 30;

            // Dynamic Reorder Point Calculation
            // Formula: (Avg Daily Sales * Lead Time) + Safety Stock
            const calculatedReorderPoint = Math.ceil((avgDailySales * product.leadTime) + product.safetyStock);

            const isLowStock = product.stock <= product.reorderPoint;
            const isCritical = product.stock <= 0;

            let status = "OK";
            if (isCritical) status = "CRITICAL";
            else if (isLowStock) status = "LOW";

            return {
                id: product.id,
                name: product.name,
                category: product.category.name,
                currentStock: product.stock,
                reorderPoint: product.reorderPoint,
                leadTime: product.leadTime,
                safetyStock: product.safetyStock,
                avgDailySales: parseFloat(avgDailySales.toFixed(2)),
                suggestedReorderPoint: calculatedReorderPoint,
                status,
                quantityToOrder: Math.max(0, calculatedReorderPoint - product.stock + product.safetyStock) // Order enough to reach safety buffer above reorder point
            };
        }).sort((a, b) => {
            // Sort by status priority: CRITICAL > LOW > OK
            const priority = { "CRITICAL": 0, "LOW": 1, "OK": 2 };
            return priority[a.status as keyof typeof priority] - priority[b.status as keyof typeof priority];
        });

        return NextResponse.json(forecast);
    } catch (error) {
        console.error("Forecast Error:", error);
        return NextResponse.json({ error: "Failed to generate forecast" }, { status: 500 });
    }
}
