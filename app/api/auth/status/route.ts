import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        
        return NextResponse.json({
            authenticated: !!token,
            token: token || null
        });
    } catch (error) {
        console.error('Auth status check error:', error);
        return NextResponse.json(
            { error: 'Failed to check auth status' },
            { status: 500 }
        );
    }
}
