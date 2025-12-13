import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET current open shift
export async function GET() {
    try {
        const shift = await prisma.shift.findFirst({
            where: { status: 'OPEN' },
            orderBy: { startTime: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                store: { select: { name: true } },
            },
        });

        return NextResponse.json(shift);
    } catch (error: any) {
        console.error('Error fetching current shift:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// POST to open a new shift
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { startCash, userId, storeId, notes } = body;

        if (!startCash || !userId || !storeId) {
            return NextResponse.json(
                { error: 'startCash, userId, and storeId are required' },
                { status: 400 }
            );
        }

        // Check if there's already an open shift
        const existingShift = await prisma.shift.findFirst({
            where: {
                status: 'OPEN',
                storeId,
            },
        });

        if (existingShift) {
            return NextResponse.json(
                { error: 'There is already an open shift. Please close it first.' },
                { status: 400 }
            );
        }

        const shift = await prisma.shift.create({
            data: {
                startCash: parseFloat(startCash),
                userId,
                storeId,
                notes,
                status: 'OPEN',
            },
            include: {
                user: { select: { name: true } },
                store: { select: { name: true } },
            },
        });

        return NextResponse.json(shift);
    } catch (error: any) {
        console.error('Error opening shift:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
