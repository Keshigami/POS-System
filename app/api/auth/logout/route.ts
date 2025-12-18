import { NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session';

export async function POST(request: Request) {
    try {
        // Clear session cookies
        SessionManager.clearSession({
            res: NextResponse.json({ success: true })
        });
        
        // Return success response
        return NextResponse.json({ 
            success: true,
            message: 'Logged out successfully' 
        });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Logout failed' },
            { status: 500 }
        );
    }
}
