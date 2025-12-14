import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET single quote
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const quote = await prisma.quote.findUnique({
            where: { id: params.id },
            include: {
                items: {
                    include: { product: true }
                },
                customer: true
            }
        });

        if (!quote) {
            return NextResponse.json(
                { error: 'Quote not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(quote);
    } catch (error: unknown) {
        console.error('Error fetching quote:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quote' },
            { status: 500 }
        );
    }
}

// DELETE quote
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
         // Delete items first (cascade usually handles this but safety first)
         await prisma.quoteItem.deleteMany({
             where: { quoteId: params.id }
         });

        await prisma.quote.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting quote:', error);
        return NextResponse.json(
            { error: 'Failed to delete quote' },
            { status: 500 }
        );
    }
}
