import { NextResponse } from 'next/server';
import { seedByBusinessType } from '@/prisma/seed-export';

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

        // Run seeding
        await seedByBusinessType(businessType);

        return NextResponse.json({
            success: true,
            message: `Database seeded for ${businessType}`
        });
    } catch (error: any) {
        console.error('Error seeding database:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
