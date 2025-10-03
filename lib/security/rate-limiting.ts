/**
 * Advanced Rate Limiting Implementation
 * Redis-based rate limiting with sliding window algorithm
 */

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (request: NextRequest) => void;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (req) => this.defaultKeyGenerator(req),
      ...config,
    };
    
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  private defaultKeyGenerator(request: NextRequest): string {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const path = new URL(request.url).pathname;
    
    return `rate_limit:${ip}:${path}:${Buffer.from(userAgent).toString('base64')}`;
  }

  private async getCurrentCount(key: string): Promise<number> {
    try {
      const count = await this.redis.get(key);
      return count ? parseInt(count as string) : 0;
    } catch (error) {
      console.error('Redis error in rate limiting:', error);
      return 0; // Fail open
    }
  }

  private async incrementCount(key: string, windowMs: number): Promise<number> {
    try {
      const pipeline = this.redis.pipeline();
      pipeline.incr(key);
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      
      const results = await pipeline.exec();
      return results[0] as number;
    } catch (error) {
      console.error('Redis error in rate limiting:', error);
      return 1; // Fail open
    }
  }

  async checkLimit(request: NextRequest): Promise<RateLimitResult> {
    const key = this.config.keyGenerator!(request);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    try {
      // Get current count
      const currentCount = await this.getCurrentCount(key);
      
      if (currentCount >= this.config.maxRequests) {
        const resetTime = now + this.config.windowMs;
        const retryAfter = Math.ceil(this.config.windowMs / 1000);
        
        if (this.config.onLimitReached) {
          this.config.onLimitReached(request);
        }
        
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime,
          retryAfter,
        };
      }
      
      // Increment count
      const newCount = await this.incrementCount(key, this.config.windowMs);
      const remaining = Math.max(0, this.config.maxRequests - newCount);
      const resetTime = now + this.config.windowMs;
      
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining,
        resetTime,
      };
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow request through
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }
  }

  middleware() {
    return async (request: NextRequest) => {
      const result = await this.checkLimit(request);
      
      if (!result.success) {
        const response = NextResponse.json(
          {
            error: 'Rate limit exceeded',
            retryAfter: result.retryAfter,
          },
          { status: 429 }
        );
        
        response.headers.set('X-RateLimit-Limit', result.limit.toString());
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
        response.headers.set('Retry-After', result.retryAfter!.toString());
        
        return response;
      }
      
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
      
      return response;
    };
  }
}

// Pre-configured rate limiters for different use cases
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
  keyGenerator: (req) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    return `auth_rate_limit:${ip}`;
  },
});

export const searchRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 searches per minute
});

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 uploads per hour
});

// Advanced rate limiting with different tiers
export class TieredRateLimiter {
  private limiters: Map<string, RateLimiter> = new Map();

  constructor() {
    // Free tier
    this.limiters.set('free', new RateLimiter({
      windowMs: 15 * 60 * 1000,
      maxRequests: 50,
    }));
    
    // Premium tier
    this.limiters.set('premium', new RateLimiter({
      windowMs: 15 * 60 * 1000,
      maxRequests: 500,
    }));
    
    // Enterprise tier
    this.limiters.set('enterprise', new RateLimiter({
      windowMs: 15 * 60 * 1000,
      maxRequests: 2000,
    }));
  }

  async checkLimit(request: NextRequest, userTier: string = 'free'): Promise<RateLimitResult> {
    const limiter = this.limiters.get(userTier) || this.limiters.get('free')!;
    return limiter.checkLimit(request);
  }
}

export const tieredRateLimiter = new TieredRateLimiter();