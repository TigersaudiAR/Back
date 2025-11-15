import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware
 * @param options - Configuration options
 * @param options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param options.max - Maximum number of requests per window (default: 100)
 */
export function rateLimit(options: { windowMs?: number; max?: number } = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = options.max || 100;

  return (req: Request, res: Response, next: NextFunction) => {
    // Use IP address as the key
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    // Initialize or get current count
    if (!store[key] || store[key].resetAt < now) {
      store[key] = {
        count: 1,
        resetAt: now + windowMs
      };
      return next();
    }

    // Increment count
    store[key].count++;

    // Check if limit exceeded
    if (store[key].count > max) {
      const retryAfter = Math.ceil((store[key].resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter.toString());
      return res.status(429).json({
        message: "عدد كبير من الطلبات. يرجى المحاولة لاحقًا.",
        retryAfter
      });
    }

    // Add rate limit headers
    res.setHeader("X-RateLimit-Limit", max.toString());
    res.setHeader("X-RateLimit-Remaining", (max - store[key].count).toString());
    res.setHeader("X-RateLimit-Reset", new Date(store[key].resetAt).toISOString());

    next();
  };
}

/**
 * Strict rate limiting for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 requests per 15 minutes
});

/**
 * Standard rate limiting for API endpoints
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per 15 minutes
});

/**
 * Lenient rate limiting for read-only endpoints
 */
export const readRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60 // 60 requests per minute
});
