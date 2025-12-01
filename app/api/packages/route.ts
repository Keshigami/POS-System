import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const packages = await prisma.package.findMany({
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        return NextResponse.json(packages);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch packages" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, price, items } = body;

        const package_ = await prisma.package.create({
            data: {
                name,
                description,
                price,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        return NextResponse.json(package_);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create package" },
            { status: 500 }
        );
    }
}
