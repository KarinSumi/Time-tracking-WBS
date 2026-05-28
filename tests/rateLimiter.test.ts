import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { loginRateLimiter } from '../src/utils/rateLimiter';

describe('LoginRateLimiter', () => {
  beforeEach(() => {
    loginRateLimiter.reset('brute@example.com');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should lock account after 5 consecutive failures within 5 minutes', () => {
    expect(loginRateLimiter.isLocked('brute@example.com').locked).toBe(false);

    const now = new Date(2026, 4, 1, 12, 0, 0);
    vi.setSystemTime(now);

    for (let i = 0; i < 4; i++) {
      loginRateLimiter.recordFailure('brute@example.com');
      expect(loginRateLimiter.isLocked('brute@example.com').locked).toBe(false);
    }

    loginRateLimiter.recordFailure('brute@example.com');
    const status = loginRateLimiter.isLocked('brute@example.com');
    expect(status.locked).toBe(true);
    expect(status.remainingMs).toBeGreaterThan(0);
  });

  it('should reset failures on reset call', () => {
    loginRateLimiter.recordFailure('brute@example.com');
    loginRateLimiter.reset('brute@example.com');
    expect(loginRateLimiter.isLocked('brute@example.com').locked).toBe(false);
  });

  it('should NOT lock account after 5 failures spread across more than 5 minutes', () => {
    expect(loginRateLimiter.isLocked('brute@example.com').locked).toBe(false);

    const baseTime = new Date(2026, 4, 1, 12, 0, 0);
    
    // 4 failures, each 2 minutes apart (total 8 minutes elapsed)
    for (let i = 0; i < 4; i++) {
      vi.setSystemTime(new Date(baseTime.getTime() + i * 2 * 60 * 1000));
      loginRateLimiter.recordFailure('brute@example.com');
      expect(loginRateLimiter.isLocked('brute@example.com').locked).toBe(false);
    }

    // 5th failure at minute 8
    vi.setSystemTime(new Date(baseTime.getTime() + 8 * 60 * 1000));
    loginRateLimiter.recordFailure('brute@example.com');

    // The first failure (minute 0) should be expired, so active count is 4. No lock!
    expect(loginRateLimiter.isLocked('brute@example.com').locked).toBe(false);
  });

  it('should include the attempts count in getActiveLockouts()', () => {
    const email = 'lockout-attempts@example.com';
    loginRateLimiter.reset(email);

    const now = new Date(2026, 4, 1, 12, 0, 0);
    vi.setSystemTime(now);

    for (let i = 0; i < 5; i++) {
      loginRateLimiter.recordFailure(email);
    }

    const lockouts = loginRateLimiter.getActiveLockouts();
    const target = lockouts.find(l => l.email === email);
    expect(target).toBeDefined();
    expect(target?.attempts).toBe(5);
  });
});
