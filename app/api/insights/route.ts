import { NextResponse } from 'next/server';
import { analyzeCustomerInsights } from '@/lib/analytics/calculator';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = (searchParams.get('period') || 'weekly') as 'daily' | 'weekly' | 'monthly';

        const insights = await prisma.customerInsight.findMany({
            where: { period },
            orderBy: { periodDate: 'desc' },
            take: 10,
        });

        return NextResponse.json(insights);
    } catch (error) {
        console.error('Customer insights error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customer insights' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const period = body.period || 'weekly';
        const periodDate = body.periodDate ? new Date(body.periodDate) : new Date();

        const insights = await analyzeCustomerInsights(period, periodDate);

        return NextResponse.json({
            success: true,
            insights,
        });
    } catch (error) {
        console.error('Customer insights generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate insights' },
            { status: 500 }
        );
    }
}
