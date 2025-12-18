import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get("storeId");

        const where: any = {};
        if (storeId) {
            where.storeId = storeId;
        }

        const categories = await prisma.category.findMany({
            where,
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}
