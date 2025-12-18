import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { username: string } }
) {
    const { username } = params;

    try {
        // In a real system, you'd validate the username parameter and query the database
        // For now, we'll just return a simple mock response
        return NextResponse.json({
            id: `user-${username}`,
            username: username,
            role: 'CASHIER',
            storeId: 'default-store-id',
            isActive: true,
            pin: '1234', // This is just a mock for demo purposes
            totalDebt: 0,
            pointsBalance: 150,
            creditLimit: 1000
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
        );
    }
}
