/**
 * Advanced Input Validation System
 * Comprehensive validation with sanitization and security checks
 */

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

// Base validation schemas
export const baseSchemas = {
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .transform(val => val.toLowerCase().trim()),
    
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number, and special character'),
    
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .transform(val => validator.normalizePhoneNumber(val) || val),
    
  url: z.string()
    .url('Invalid URL format')
    .max(2048, 'URL too long'),
    
  html: z.string()
    .max(10000, 'Content too long')
    .transform(val => DOMPurify.sanitize(val, { 
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    })),
    
  sanitizedText: z.string()
    .max(1000, 'Text too long')
    .transform(val => DOMPurify.sanitize(val, { ALLOWED_TAGS: [] })),
    
  slug: z.string()
    .regex(/^[a-z0-9\-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .min(1, 'Slug cannot be empty')
    .max(100, 'Slug too long'),
    
  uuid: z.string().uuid('Invalid UUID format'),
  
  positiveInt: z.number()
    .int('Must be an integer')
    .positive('Must be positive'),
    
  nonNegativeInt: z.number()
    .int('Must be an integer')
    .min(0, 'Cannot be negative'),
};

// E-commerce specific schemas
export const ecommerceSchemas = {
  productTitle: z.string()
    .min(1, 'Product title is required')
    .max(200, 'Product title too long')
    .transform(val => DOMPurify.sanitize(val, { ALLOWED_TAGS: [] })),
    
  productDescription: z.string()
    .max(5000, 'Product description too long')
    .transform(val => DOMPurify.sanitize(val, { 
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
      ALLOWED_ATTR: []
    })),
    
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price too high')
    .transform(val => Math.round(val * 100) / 100), // Round to 2 decimal places
    
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative')
    .max(999, 'Quantity too high'),
    
  sku: z.string()
    .min(1, 'SKU is required')
    .max(50, 'SKU too long')
    .regex(/^[A-Z0-9\-_]+$/, 'SKU must contain only uppercase letters, numbers, hyphens, and underscores'),
    
  address: z.object({
    firstName: baseSchemas.sanitizedText.max(50, 'First name too long'),
    lastName: baseSchemas.sanitizedText.max(50, 'Last name too long'),
    company: baseSchemas.sanitizedText.max(100, 'Company name too long').optional(),
    address1: baseSchemas.sanitizedText.min(1, 'Address is required').max(100, 'Address too long'),
    address2: baseSchemas.sanitizedText.max(100, 'Address line 2 too long').optional(),
    city: baseSchemas.sanitizedText.min(1, 'City is required').max(50, 'City name too long'),
    province: baseSchemas.sanitizedText.max(50, 'Province/State too long').optional(),
    country: baseSchemas.sanitizedText.min(1, 'Country is required').max(50, 'Country name too long'),
    zip: baseSchemas.sanitizedText.max(20, 'ZIP/Postal code too long').optional(),
    phone: baseSchemas.phone.optional(),
  }),
  
  creditCard: z.object({
    number: z.string()
      .regex(/^\d{13,19}$/, 'Invalid card number')
      .transform(val => val.replace(/\s/g, '')),
    expiryMonth: z.number()
      .int('Invalid expiry month')
      .min(1, 'Invalid expiry month')
      .max(12, 'Invalid expiry month'),
    expiryYear: z.number()
      .int('Invalid expiry year')
      .min(new Date().getFullYear(), 'Card expired')
      .max(new Date().getFullYear() + 20, 'Invalid expiry year'),
    cvv: z.string()
      .regex(/^\d{3,4}$/, 'Invalid CVV'),
    name: baseSchemas.sanitizedText.min(1, 'Cardholder name is required').max(100, 'Name too long'),
  }),
};

// API request schemas
export const apiSchemas = {
  pagination: z.object({
    page: baseSchemas.nonNegativeInt.default(1),
    limit: baseSchemas.positiveInt.max(100, 'Limit too high').default(20),
    sort: z.enum(['created_at', 'updated_at', 'title', 'price']).default('created_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
  
  search: z.object({
    q: z.string()
      .min(1, 'Search query is required')
      .max(100, 'Search query too long')
      .transform(val => DOMPurify.sanitize(val, { ALLOWED_TAGS: [] })),
    filters: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
  }),
  
  fileUpload: z.object({
    filename: z.string()
      .min(1, 'Filename is required')
      .max(255, 'Filename too long')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid filename'),
    size: baseSchemas.nonNegativeInt.max(10 * 1024 * 1024, 'File too large'), // 10MB max
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  }),
};

// Security validation functions
export class SecurityValidator {
  /**
   * Check for SQL injection patterns
   */
  static checkSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(--|\/\*|\*\/|;|'|"|`)/,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }
  
  /**
   * Check for XSS patterns
   */
  static checkXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<[^>]*style\s*=\s*["'][^"']*expression\s*\(/gi,
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }
  
  /**
   * Check for path traversal
   */
  static checkPathTraversal(input: string): boolean {
    const pathPatterns = [
      /\.\.\//,
      /\.\.\\/,
      /\.\.%2f/gi,
      /\.\.%5c/gi,
    ];
    
    return pathPatterns.some(pattern => pattern.test(input));
  }
  
  /**
   * Comprehensive security check
   */
  static validateSecurity(input: string): { isValid: boolean; threats: string[] } {
    const threats: string[] = [];
    
    if (this.checkSQLInjection(input)) {
      threats.push('SQL_INJECTION');
    }
    
    if (this.checkXSS(input)) {
      threats.push('XSS');
    }
    
    if (this.checkPathTraversal(input)) {
      threats.push('PATH_TRAVERSAL');
    }
    
    return {
      isValid: threats.length === 0,
      threats,
    };
  }
}

// Validation middleware
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest, context: { params: any }) => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      
      // Add validated data to request
      (request as any).validatedData = validatedData;
      
      return NextResponse.next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
  };
}

// Sanitization utilities
export const sanitizers = {
  /**
   * Sanitize HTML content
   */
  html: (content: string): string => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
      ALLOWED_ATTR: [],
    });
  },
  
  /**
   * Sanitize text content (remove all HTML)
   */
  text: (content: string): string => {
    return DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
  },
  
  /**
   * Sanitize filename
   */
  filename: (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  },
  
  /**
   * Sanitize URL
   */
  url: (url: string): string => {
    try {
      const parsed = new URL(url);
      return parsed.toString();
    } catch {
      return '';
    }
  },
};

// Export commonly used schemas
export const schemas = {
  ...baseSchemas,
  ...ecommerceSchemas,
  ...apiSchemas,
};