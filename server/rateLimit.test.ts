import { describe, it, expect, vi, afterEach } from 'vitest';
import { createAiRateLimiter, createAiDailyBudget } from './rateLimit';

/**
 * P0-04: unit tests for the in-memory AI rate limiter and daily budget.
 * Tests drive the pure `allow(key)` API directly (no Express needed).
 */

describe('createAiRateLimiter (fixed window)', () => {
  const limiter = createAiRateLimiter({ windowMs: 60_000, max: 3 });
  afterEach(() => limiter.reset());

  it('allows requests up to the configured max', () => {
    expect(limiter.allow('user:1')).toBe(true);
    expect(limiter.allow('user:1')).toBe(true);
    expect(limiter.allow('user:1')).toBe(true);
  });

  it('denies requests beyond the max within the window', () => {
    limiter.allow('user:1');
    limiter.allow('user:1');
    limiter.allow('user:1');
    expect(limiter.allow('user:1')).toBe(false);
    expect(limiter.allow('user:1')).toBe(false);
  });

  it('isolates keys from each other', () => {
    for (let i = 0; i < 5; i += 1) {
      limiter.allow('user:a');
    }
    expect(limiter.allow('user:a')).toBe(false);
    expect(limiter.allow('user:b')).toBe(true);
    expect(limiter.allow('ip:1.2.3.4')).toBe(true);
  });

  it('resets the window after windowMs elapses', () => {
    vi.useFakeTimers();
    try {
      limiter.allow('user:1');
      limiter.allow('user:1');
      limiter.allow('user:1');
      expect(limiter.allow('user:1')).toBe(false);
      vi.advanceTimersByTime(60_001);
      expect(limiter.allow('user:1')).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('reset() clears all counters', () => {
    limiter.allow('user:1');
    limiter.allow('user:1');
    limiter.allow('user:1');
    expect(limiter.allow('user:1')).toBe(false);
    limiter.reset();
    expect(limiter.allow('user:1')).toBe(true);
  });
});

describe('createAiDailyBudget', () => {
  const budget = createAiDailyBudget(2);
  afterEach(() => budget.reset());

  it('allows up to maxPerDay requests per key', () => {
    expect(budget.allow('user:1')).toBe(true);
    expect(budget.allow('user:1')).toBe(true);
    expect(budget.allow('user:1')).toBe(false);
  });

  it('isolates daily budgets per key', () => {
    budget.allow('user:1');
    budget.allow('user:1');
    expect(budget.allow('user:1')).toBe(false);
    expect(budget.allow('user:2')).toBe(true);
  });

  it('reset() restores the budget', () => {
    budget.allow('user:1');
    budget.allow('user:1');
    expect(budget.allow('user:1')).toBe(false);
    budget.reset();
    expect(budget.allow('user:1')).toBe(true);
  });
});
