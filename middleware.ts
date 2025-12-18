import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session';
import { AuthService } from '@/lib/auth';

// Routes that require authentication
const PROTECTED_ROUTES = [
    '/api/orders',
    '/api/orders/held',
    '/api/quotes',
    '/api/customers',
    '/api/shifts',
    '/api/shifts/[id]/close',
    '/api/reports',
    '/api/settings'
];

// Routes that are publicly accessible
const PUBLIC_ROUTES = [
    '/api/categories',
    '/api/products',
    '/api/packages',
    '/api/auth/login',
    '/api/auth/logout'
];

export async function middleware(req: any) {
    const { pathname } = req.nextUrl;

    // Check if route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
    
    // Check if route requires authentication
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    // Allow authentication for login routes
    const isAuthRoute = pathname.startsWith('/api/auth/');

    // Public routes don't need authentication
    if (isPublicRoute || isAuthRoute) {
        return NextResponse.next();
    }

    // Protected routes require authentication
    if (isProtectedRoute) {
        const token = SessionManager.getTokenFromRequest(req);
        
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        try {
            const user = await AuthService.verifyJWT(token);
            
            if (!user || !user.isActive) {
                return NextResponse.json(
                    { error: 'Invalid or inactive session' },
                    { status: 401 }
                );
            }

            // Add user info to request for downstream use
            req.user = user;
            
            return NextResponse.next();
        } catch (error) {
            console.error('Authentication middleware error:', error);
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 500 }
            );
        }
    }
}
