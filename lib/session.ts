import { cookies } from 'next/headers';
import { AuthService } from './auth';

export class SessionManager {
    private static readonly TOKEN_COOKIE_NAME = 'auth-token';
    private static readonly USER_COOKIE_NAME = 'auth-user';

    static setSession(user: any, response: any) {
        const token = AuthService.generateJWT(user);
        
        // Set secure HTTP-only cookies
        response.cookies.set(this.TOKEN_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/'
        });

        // Set user info cookie (non-sensitive)
        const userCookie = JSON.stringify({
            id: user.id,
            username: user.username,
            role: user.role
        });
        
        response.cookies.set(this.USER_COOKIE_NAME, userCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
            path: '/'
        });
    }

    static clearSession(response: any) {
        response.cookies.delete(this.TOKEN_COOKIE_NAME);
        response.cookies.delete(this.USER_COOKIE_NAME);
    }

    static getTokenFromRequest(request: any): string | null {
        const token = request.cookies[this.TOKEN_COOKIE_NAME]?.value;
        return token || null;
    }

    static getUserFromRequest(request: any): any | null {
        const userCookie = request.cookies[this.USER_COOKIE_NAME]?.value;
        return userCookie ? JSON.parse(userCookie) : null;
    }

    static async refreshSession(request: any): Promise<any | null> {
        const token = this.getTokenFromRequest(request);
        if (!token) return null;

        const user = await AuthService.verifyJWT(token);
        if (!user || !user.isActive) {
            this.clearSession(request);
            return null;
        }

        // Extend session
        this.setSession(user, request);
        return user;
    }
}
