import { CSRFProtection } from '@/lib/security/csrf-protection';
import { NextRequest } from 'next/server';

describe('CSRFProtection', () => {
  let csrfProtection: CSRFProtection;

  beforeEach(() => {
    csrfProtection = new CSRFProtection({
      secret: 'test-secret-key',
      tokenLength: 16,
    });
  });

  describe('generateToken', () => {
    it('should generate a token of correct length', () => {
      const token = csrfProtection.generateToken();
      expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
    });

    it('should generate unique tokens', () => {
      const token1 = csrfProtection.generateToken();
      const token2 = csrfProtection.generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('createSignedToken', () => {
    it('should create a signed token', () => {
      const token = 'test-token';
      const signedToken = csrfProtection.createSignedToken(token);
      
      expect(signedToken).toContain('.');
      expect(signedToken.split('.')).toHaveLength(2);
    });

    it('should create consistent signed tokens for same input', () => {
      const token = 'test-token';
      const signedToken1 = csrfProtection.createSignedToken(token);
      const signedToken2 = csrfProtection.createSignedToken(token);
      
      expect(signedToken1).toBe(signedToken2);
    });
  });

  describe('verifySignedToken', () => {
    it('should verify valid signed tokens', () => {
      const token = 'test-token';
      const signedToken = csrfProtection.createSignedToken(token);
      
      expect(csrfProtection.verifySignedToken(signedToken)).toBe(true);
    });

    it('should reject invalid signed tokens', () => {
      const invalidToken = 'invalid.token';
      expect(csrfProtection.verifySignedToken(invalidToken)).toBe(false);
    });

    it('should reject tampered tokens', () => {
      const token = 'test-token';
      const signedToken = csrfProtection.createSignedToken(token);
      const tamperedToken = signedToken.replace('a', 'b');
      
      expect(csrfProtection.verifySignedToken(tamperedToken)).toBe(false);
    });

    it('should handle malformed tokens gracefully', () => {
      expect(csrfProtection.verifySignedToken('')).toBe(false);
      expect(csrfProtection.verifySignedToken('invalid')).toBe(false);
      expect(csrfProtection.verifySignedToken('token.without.signature')).toBe(false);
    });
  });

  describe('validateToken', () => {
    it('should validate correct token from cookie and header', () => {
      const token = csrfProtection.generateToken();
      const signedToken = csrfProtection.createSignedToken(token);
      
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
        },
      });
      
      // Mock cookies
      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: signedToken }),
        },
      });
      
      expect(csrfProtection.validateToken(request)).toBe(true);
    });

    it('should reject when cookie token is missing', () => {
      const token = csrfProtection.generateToken();
      
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
        },
      });
      
      // Mock cookies to return null
      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue(null),
        },
      });
      
      expect(csrfProtection.validateToken(request)).toBe(false);
    });

    it('should reject when header token is missing', () => {
      const token = csrfProtection.generateToken();
      const signedToken = csrfProtection.createSignedToken(token);
      
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
      });
      
      // Mock cookies
      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: signedToken }),
        },
      });
      
      expect(csrfProtection.validateToken(request)).toBe(false);
    });

    it('should reject when tokens do not match', () => {
      const token1 = csrfProtection.generateToken();
      const token2 = csrfProtection.generateToken();
      const signedToken = csrfProtection.createSignedToken(token1);
      
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token2,
        },
      });
      
      // Mock cookies
      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: signedToken }),
        },
      });
      
      expect(csrfProtection.validateToken(request)).toBe(false);
    });
  });

  describe('middleware', () => {
    it('should allow GET requests without CSRF validation', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });
      
      const middleware = csrfProtection.middleware();
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
    });

    it('should allow HEAD requests without CSRF validation', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'HEAD',
      });
      
      const middleware = csrfProtection.middleware();
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
    });

    it('should allow OPTIONS requests without CSRF validation', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'OPTIONS',
      });
      
      const middleware = csrfProtection.middleware();
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
    });

    it('should allow requests to public paths without CSRF validation', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
      });
      
      const middleware = csrfProtection.middleware();
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
    });

    it('should reject POST requests without valid CSRF token', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
      });
      
      // Mock cookies to return null
      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue(null),
        },
      });
      
      const middleware = csrfProtection.middleware();
      const response = await middleware(request);
      
      expect(response.status).toBe(403);
      
      const body = await response.json();
      expect(body.error).toBe('CSRF token validation failed');
    });

    it('should allow POST requests with valid CSRF token', async () => {
      const token = csrfProtection.generateToken();
      const signedToken = csrfProtection.createSignedToken(token);
      
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
        },
      });
      
      // Mock cookies
      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: signedToken }),
        },
      });
      
      const middleware = csrfProtection.middleware();
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
    });
  });
});