import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, description, price, items } = body;

        // Delete existing items and create new ones
        await prisma.packageItem.deleteMany({
            where: { packageId: params.id },
        });

        const package_ = await prisma.package.update({
            where: { id: params.id },
            data: {
                name,
                description,
                price: parseFloat(price),
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: parseInt(item.quantity) || 1,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return NextResponse.json(package_);
    } catch (error) {
        console.error("Update package error:", error);
        return NextResponse.json(
            { error: "Failed to update package" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Delete package items first (cascade should handle this, but being explicit)
        await prisma.packageItem.deleteMany({
            where: { packageId: params.id },
        });

        await prisma.package.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "Package deleted" });
    } catch (error) {
        console.error("Delete package error:", error);
        return NextResponse.json(
            { error: "Failed to delete package" },
            { status: 500 }
        );
    }
}
