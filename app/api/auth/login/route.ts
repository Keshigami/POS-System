import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import type { User } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

        // Direct database lookup for user by name
        const dbUser = await prisma.user.findFirst({
            where: { name: username },
            select: {
                id: true,
                name: true,
                pin: true,
                role: true,
                storeId: true
            }
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check if user has a PIN set
        if (!dbUser.pin) {
            return NextResponse.json(
                { error: 'User PIN not configured' },
                { status: 400 }
            );
        }

        // Verify PIN
        const isValidPIN = await AuthService.verifyPin(pin, dbUser.pin);

        if (!isValidPIN) {
            return NextResponse.json(
                { error: 'Invalid PIN' },
                { status: 401 }
            );
        }

        // Build user object for JWT
        const user: User = {
            id: dbUser.id,
            username: dbUser.name || '',
            pin: dbUser.pin,
            role: dbUser.role as User['role'],
            storeId: dbUser.storeId || '',
            isActive: true
        };

        // Generate JWT and set session
        const token = await AuthService.generateJWT(user);

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
