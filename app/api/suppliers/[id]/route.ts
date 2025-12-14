import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET single supplier
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supplier = await prisma.supplier.findUnique({
            where: { id: params.id },
            include: {
                products: {
                    select: { id: true, name: true, stock: true }
                },
                _count: {
                    select: { products: true }
                }
            }
        });

        if (!supplier) {
            return NextResponse.json(
                { error: 'Supplier not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(supplier);
    } catch (error: unknown) {
        console.error('Error fetching supplier:', error);
        return NextResponse.json(
            { error: 'Failed to fetch supplier' },
            { status: 500 }
        );
    }
}

// PUT focus update supplier
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, contact, email, address, notes } = body;

        const supplier = await prisma.supplier.update({
            where: { id: params.id },
            data: {
                name,
                contact,
                email,
                address,
                notes,
            },
        });

        return NextResponse.json(supplier);
    } catch (error: unknown) {
        console.error('Error updating supplier:', error);
        return NextResponse.json(
            { error: 'Failed to update supplier' },
            { status: 500 }
        );
    }
}

// DELETE supplier
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Optional: Check if supplier has products before deleting
        // For now, we allow it but products will have supplierId=null set manually or cascade?
        // Prisma schema allows optional supplierId, so setting to null is fine if we logic it,
        // but strict deletion might be safer.
        // Let's check for products first to be safe.

        const supplier = await prisma.supplier.findUnique({
            where: { id: params.id },
            include: { _count: { select: { products: true } } }
        });

        if (supplier && supplier._count.products > 0) {
            return NextResponse.json(
                { error: 'Cannot delete supplier with linked products. Reassign products first.' },
                { status: 400 }
            );
        }

        await prisma.supplier.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting supplier:', error);
        return NextResponse.json(
            { error: 'Failed to delete supplier' },
            { status: 500 }
        );
    }
}
