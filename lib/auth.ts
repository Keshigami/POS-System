export interface User {
    id: string;
    username: string;
    pin: string;
    role: 'CASHIER' | 'SUPERVISOR' | 'ADMIN' | 'MANAGER';
    storeId: string;
    isActive: boolean;
}

export interface LoginCredentials {
    username: string;
    pin: string;
}

export class AuthService {
    private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    private static readonly TOKEN_EXPIRY = '24h'; // 24 hours

    static async hashPin(pin: string): Promise<string> {
        // Use a secure hashing algorithm for PINs
        const crypto = require('crypto');
        return new Promise((resolve, reject) => {
            const salt = crypto.randomBytes(16).toString('hex');
            crypto.pbkdf2(pin, salt, 10000, 64, 'sha256', (err: Error, derivedKey: Buffer) => {
                if (err) reject(err);
                resolve(derivedKey.toString('hex'));
            });
        });
    }

    static async verifyPin(pin: string, hashedPin: string): Promise<boolean> {
        const crypto = require('crypto');
        return new Promise((resolve) => {
            const salt = crypto.randomBytes(16).toString('hex');
            crypto.pbkdf2(pin, salt, 10000, 64, 'sha256', (err: Error, derivedKey: Buffer) => {
                if (err) resolve(false);
                resolve(derivedKey.toString('hex') === hashedPin);
            });
        });
    }

    static async generateJWT(user: User): Promise<string> {
        const jwt = require('jsonwebtoken');
        
        const payload = {
            userId: user.id,
            username: user.username,
            role: user.role,
            storeId: user.storeId,
            isActive: user.isActive
        };

        const options = {
            expiresIn: this.TOKEN_EXPIRY,
            issuer: 'pos-system'
        };

        return jwt.sign(payload, this.JWT_SECRET, options);
    }

    static async verifyJWT(token: string): Promise<User | null> {
        const jwt = require('jsonwebtoken');
        
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET) as any;
            
            return {
                id: decoded.userId,
                username: decoded.username,
                pin: decoded.pin,
                role: decoded.role,
                storeId: decoded.storeId,
                isActive: decoded.isActive
            };
        } catch (error: unknown) {
            console.error('JWT verification error:', error);
            return null;
        }
    }

    static async validateSession(token: string): Promise<boolean> {
        try {
            const user = await this.verifyJWT(token);
            return user !== null && user.isActive;
        } catch (error: unknown) {
            console.error('Session validation error:', error);
            return false;
        }
    }
}
