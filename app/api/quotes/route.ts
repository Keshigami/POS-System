import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all quotes
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        // Default store
        let storeId = 'default-store-id';
        const store = await prisma.store.findFirst();
        if (store) storeId = store.id;

        const whereClause: any = {
            storeId,
        };

        if (search) {
            whereClause.OR = [
                { customerName: { contains: search } },
                { status: { contains: search } },
            ];
            // Parse as int if number
            if (!isNaN(Number(search))) {
                whereClause.OR.push({ quoteNumber: Number(search) });
            }
        }

        const quotes = await prisma.quote.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: { select: { name: true } },
                _count: { select: { items: true } }
            }
        });

        return NextResponse.json(quotes);
    } catch (error: unknown) {
        console.error('Error fetching quotes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quotes' },
            { status: 500 }
        );
    }
}

// POST new quote
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, total, customerId, customerName, validUntil, notes, storeId } = body;

        let targetStoreId = storeId;
        if (!targetStoreId) {
            const store = await prisma.store.findFirst();
            if (store) targetStoreId = store.id;
        }

        // Generate sequential quote number (simple logic)
        const lastQuote = await prisma.quote.findFirst({
            orderBy: { quoteNumber: 'desc' },
        });
        const nextNumber = (lastQuote?.quoteNumber || 0) + 1;

        const quote = await prisma.quote.create({
            data: {
                quoteNumber: nextNumber,
                total,
                customerId,
                customerName,
                validUntil: validUntil ? new Date(validUntil) : null,
                notes,
                storeId: targetStoreId,
                status: 'PENDING',
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            },
        });

        return NextResponse.json(quote);
    } catch (error: unknown) {
        console.error('Error creating quote:', error);
        return NextResponse.json(
            { error: 'Failed to create quote' },
            { status: 500 }
        );
    }
}
