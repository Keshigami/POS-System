import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        
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
