import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all suppliers
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        // In a real app we'd filter by storeId from session
        // For now finding default store
        let storeId = 'default-store-id';
        const store = await prisma.store.findFirst();
        if (store) storeId = store.id;

        const whereClause: any = {
            storeId,
        };

        if (search) {
            whereClause.OR = [
                { name: { contains: search } }, // Case-insensitive in SQLite usually
                { contact: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const suppliers = await prisma.supplier.findMany({
            where: whereClause,
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        return NextResponse.json(suppliers);
    } catch (error: unknown) {
        console.error('Error fetching suppliers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch suppliers' },
            { status: 500 }
        );
    }
}

// POST new supplier
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, contact, email, address, notes, storeId } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Supplier name is required' },
                { status: 400 }
            );
        }

        let targetStoreId = storeId;
        if (!targetStoreId) {
            const store = await prisma.store.findFirst();
            if (store) targetStoreId = store.id;
        }

        const supplier = await prisma.supplier.create({
            data: {
                name,
                contact,
                email,
                address,
                notes,
                storeId: targetStoreId,
            },
        });

        return NextResponse.json(supplier);
    } catch (error: unknown) {
        console.error('Error creating supplier:', error);
        return NextResponse.json(
            { error: 'Failed to create supplier' },
            { status: 500 }
        );
    }
}
