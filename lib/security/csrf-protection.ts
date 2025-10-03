/**
 * CSRF Protection Implementation
 * Enterprise-grade CSRF protection with token validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export interface CSRFConfig {
  secret: string;
  tokenLength: number;
  cookieName: string;
  headerName: string;
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
}

const defaultConfig: CSRFConfig = {
  secret: process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex'),
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600, // 1 hour
  },
};

export class CSRFProtection {
  private config: CSRFConfig;

  constructor(config: Partial<CSRFConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    return crypto.randomBytes(this.config.tokenLength).toString('hex');
  }

  /**
   * Create a signed token with HMAC
   */
  createSignedToken(token: string): string {
    const hmac = crypto.createHmac('sha256', this.config.secret);
    hmac.update(token);
    const signature = hmac.digest('hex');
    return `${token}.${signature}`;
  }

  /**
   * Verify a signed token
   */
  verifySignedToken(signedToken: string): boolean {
    try {
      const [token, signature] = signedToken.split('.');
      if (!token || !signature) return false;

      const hmac = crypto.createHmac('sha256', this.config.secret);
      hmac.update(token);
      const expectedSignature = hmac.digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch {
      return false;
    }
  }

  /**
   * Set CSRF token in response cookies
   */
  setTokenCookie(response: NextResponse, token: string): void {
    const signedToken = this.createSignedToken(token);
    response.cookies.set(this.config.cookieName, signedToken, this.config.cookieOptions);
  }

  /**
   * Get CSRF token from request cookies
   */
  getTokenFromCookie(request: NextRequest): string | null {
    const cookie = request.cookies.get(this.config.cookieName);
    return cookie?.value || null;
  }

  /**
   * Get CSRF token from request headers
   */
  getTokenFromHeader(request: NextRequest): string | null {
    return request.headers.get(this.config.headerName);
  }

  /**
   * Validate CSRF token from request
   */
  validateToken(request: NextRequest): boolean {
    const cookieToken = this.getTokenFromCookie(request);
    const headerToken = this.getTokenFromHeader(request);

    if (!cookieToken || !headerToken) return false;
    if (!this.verifySignedToken(cookieToken)) return false;

    // Extract token from signed cookie token
    const [token] = cookieToken.split('.');
    return token === headerToken;
  }

  /**
   * Middleware to add CSRF protection to API routes
   */
  middleware() {
    return async (request: NextRequest) => {
      // Skip CSRF for safe methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        return NextResponse.next();
      }

      // Skip CSRF for public endpoints
      const url = new URL(request.url);
      const publicPaths = ['/api/auth', '/api/webhooks'];
      if (publicPaths.some(path => url.pathname.startsWith(path))) {
        return NextResponse.next();
      }

      if (!this.validateToken(request)) {
        return NextResponse.json(
          { error: 'CSRF token validation failed' },
          { status: 403 }
        );
      }

      return NextResponse.next();
    };
  }
}

// Singleton instance
export const csrfProtection = new CSRFProtection();

/**
 * Hook to get CSRF token for client-side requests
 */
export async function getCSRFToken(): Promise<string> {
  const response = await fetch('/api/csrf-token', {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get CSRF token');
  }
  
  const data = await response.json();
  return data.token;
}

/**
 * Utility to add CSRF token to fetch requests
 */
export async function fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getCSRFToken();
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': token,
    },
    credentials: 'include',
  });
}