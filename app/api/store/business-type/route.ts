import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { businessType } = body;

        if (!businessType) {
            return NextResponse.json(
                { error: 'businessType is required' },
                { status: 400 }
            );
        }

        // Get the first store (assuming single store for now)
        const store = await prisma.store.findFirst();

        if (!store) {
            return NextResponse.json(
                { error: 'No store found' },
                { status: 404 }
            );
        }

        // Update the store's business type
        const updatedStore = await prisma.store.update({
            where: { id: store.id },
            data: { businessType },
        });

        return NextResponse.json(updatedStore);
    } catch (error: any) {
        console.error('Error updating business type:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const store = await prisma.store.findFirst();

        if (!store) {
            return NextResponse.json(
                { error: 'No store found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ businessType: store.businessType });
    } catch (error: any) {
        console.error('Error fetching business type:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
