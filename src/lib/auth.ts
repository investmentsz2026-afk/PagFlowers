import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-luxury-key-2026';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyAuthRequest(req: NextRequest): TokenPayload | null {
  try {
    // 1. Try to get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return verifyToken(token);
    }

    // 2. Try to get token from cookies
    const cookieToken = req.cookies.get('admin_token')?.value;
    if (cookieToken) {
      return verifyToken(cookieToken);
    }

    return null;
  } catch (error) {
    return null;
  }
}
