import { NextResponse } from 'next/server';
import { calculateAnalytics, getAnalytics } from '@/lib/analytics/calculator';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '7'; // Default 7 days

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(range));

        // Try to get cached analytics first
        const cached = await getAnalytics(startDate, endDate);

        if (cached.length > 0) {
            return NextResponse.json(cached);
        }

        // Calculate fresh analytics
        const analytics = await calculateAnalytics(startDate, endDate);

        return NextResponse.json(analytics);
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
