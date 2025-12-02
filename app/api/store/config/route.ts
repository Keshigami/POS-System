import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const store = await prisma.store.findFirst();

        if (!store) {
            return NextResponse.json(
                { businessType: 'GENERAL' },
                { status: 200 }
            );
        }

        return NextResponse.json({ businessType: store.businessType });
    } catch (error: any) {
        console.error('Error fetching store config:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
