import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { username, pin } = await request.json();

        // Validate input
        if (!username || !pin) {
            return NextResponse.json(
                { error: 'Username and PIN are required' },
                { status: 400 }
            );
        }

        // Get user by username (for PIN verification)
        // In a real system, you'd verify the PIN hash against the stored hash
        const res = await fetch(`/api/auth/users/${username}`);
        const users = res.ok ? await res.json() : [];
        
        const user = users.find((u: any) => u.username === username);
        
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify PIN
        const isValidPIN = await AuthService.verifyPin(pin, user.pin);
        
        if (!isValidPIN) {
            return NextResponse.json(
                { error: 'Invalid PIN' },
                { status: 401 }
            );
        }

        // Generate JWT and set session
        const token = AuthService.generateJWT({
            id: user.id,
            username: user.username,
            pin: user.pin,
            role: user.role,
            storeId: user.storeId,
            isActive: user.isActive
        });

        const response = NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                storeId: user.storeId,
                isActive: user.isActive
            }
        });

        // Set session cookies
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/'
        });

        response.cookies.set('auth-user', JSON.stringify({
            id: user.id,
            username: user.username,
            role: user.role
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        );
    }
}
