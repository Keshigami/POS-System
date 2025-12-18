import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const response = NextResponse.json({ 
            success: true,
            message: 'Logged out successfully' 
        });
        
        // Clear session cookies
        const cookieStore = await cookies();
        cookieStore.delete('auth-token');
        cookieStore.delete('auth-user');
        
        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Logout failed' },
            { status: 500 }
        );
    }
}
