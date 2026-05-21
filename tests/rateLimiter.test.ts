import { describe, it, expect, beforeEach } from 'vitest';
import { loginRateLimiter } from '../src/utils/rateLimiter';

describe('LoginRateLimiter', () => {
  beforeEach(() => {
    loginRateLimiter.reset('brute@example.com');
  });

  it('should lock account after 5 consecutive failures', () => {
    expect(loginRateLimiter.isLocked('brute@example.com').locked).toBe(false);

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
});
