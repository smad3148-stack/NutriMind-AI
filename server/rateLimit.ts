/**
 * Lightweight in-memory rate limiting and daily budget guards for the AI
 * endpoints (P0-04).
 *
 * Design notes:
 * - Single-process in-memory counters, consistent with the current Express
 *   monolith. Swap for a Redis-backed limiter when the server is horizontally
 *   scaled (roadmap P2).
 * - Keys are per-user (`user:<id>`) when authenticated, falling back to
 *   per-IP (`ip:<addr>`) in sandbox/demo mode, so anonymous traffic cannot
 *   hide behind one shared identity.
 * - Memory is bounded: expired entries are swept once the map grows large.
 */

import type { NextFunction, Request, RequestHandler, Response } from 'express';

export interface AiRateLimiter {
  /** Returns true when the key is still within the window allowance. */
  allow(key: string): boolean;
  reset(): void;
  /** Express middleware; keyFn resolves the per-request identity. */
  middleware(keyFn: (req: Request) => string): RequestHandler;
}

export interface AiDailyBudget {
  allow(key: string): boolean;
  reset(): void;
  middleware(keyFn: (req: Request) => string): RequestHandler;
}

/**
 * Fixed-window rate limiter. `max` requests are allowed per `windowMs` per
 * key; further requests are denied until the window rolls over.
 */
export function createAiRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
}): AiRateLimiter {
  const hits = new Map<string, { count: number; windowStart: number }>();

  const sweep = (now: number) => {
    if (hits.size > 10_000) {
      for (const [key, entry] of hits) {
        if (now - entry.windowStart >= options.windowMs) hits.delete(key);
      }
    }
  };

  const allow = (key: string): boolean => {
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || now - entry.windowStart >= options.windowMs) {
      hits.set(key, { count: 1, windowStart: now });
      sweep(now);
      return true;
    }
    entry.count += 1;
    return entry.count <= options.max;
  };

  return {
    allow,
    reset() {
      hits.clear();
    },
    middleware(keyFn) {
      return (req: Request, res: Response, next: NextFunction) => {
        if (!allow(keyFn(req))) {
          res.setHeader('Retry-After', String(Math.ceil(options.windowMs / 1000)));
          res
            .status(429)
            .json({ error: options.message ?? 'Too many AI requests. Please try again shortly.' });
          return;
        }
        next();
      };
    },
  };
}

/**
 * Per-user daily request budget (cost protection). Resets at UTC midnight.
 */
export function createAiDailyBudget(maxPerDay: number): AiDailyBudget {
  const counts = new Map<string, number>();

  const allow = (key: string): boolean => {
    const today = new Date().toISOString().slice(0, 10);
    const fullKey = `${today}:${key}`;
    const current = counts.get(fullKey) ?? 0;
    if (current >= maxPerDay) return false;
    counts.set(fullKey, current + 1);
    // Sweep stale dates when the map grows large.
    if (counts.size > 10_000) {
      for (const [k] of counts) {
        if (!k.startsWith(today)) counts.delete(k);
      }
    }
    return true;
  };

  return {
    allow,
    reset() {
      counts.clear();
    },
    middleware(keyFn) {
      return (req: Request, res: Response, next: NextFunction) => {
        if (!allow(keyFn(req))) {
          res.status(429).json({ error: 'Daily AI request limit reached. Please try again tomorrow.' });
          return;
        }
        next();
      };
    },
  };
}

/**
 * Identity resolver for AI rate limiting: authenticated user id when
 * available, otherwise the client IP (sandbox/demo mode).
 */
export function aiRequestKey(req: Request): string {
  const userId = (req as { user?: { id?: string } }).user?.id;
  return userId ? `user:${userId}` : `ip:${req.ip || 'unknown'}`;
}
