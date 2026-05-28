class LoginRateLimiter {
  private attempts = new Map<string, { timestamps: number[]; lockUntil?: Date }>();

  private cleanExpiredAttempts(email: string, nowMs: number): number[] {
    const current = this.attempts.get(email);
    if (!current) return [];
    // Keep only failures within the last 5 minutes (5 * 60 * 1000 ms)
    const windowStart = nowMs - 5 * 60 * 1000;
    const valid = current.timestamps.filter(ts => ts >= windowStart);
    current.timestamps = valid;
    this.attempts.set(email, current);
    return valid;
  }

  public recordFailure(email: string): void {
    const now = new Date();
    const nowMs = now.getTime();
    const current = this.attempts.get(email) || { timestamps: [] };
    
    current.timestamps.push(nowMs);
    this.attempts.set(email, current);

    const activeTimestamps = this.cleanExpiredAttempts(email, nowMs);

    if (activeTimestamps.length >= 5) {
      current.lockUntil = new Date(nowMs + 15 * 60 * 1000); // 15 mins lock
      this.attempts.set(email, current);
    }
  }

  public isLocked(email: string): { locked: boolean; remainingMs: number } {
    const current = this.attempts.get(email);
    if (!current || !current.lockUntil) {
      return { locked: false, remainingMs: 0 };
    }
    const now = new Date();
    if (now > current.lockUntil) {
      this.attempts.delete(email);
      return { locked: false, remainingMs: 0 };
    }
    return { locked: true, remainingMs: current.lockUntil.getTime() - now.getTime() };
  }

  public reset(email: string): void {
    this.attempts.delete(email);
  }

  public getActiveLockouts(): { email: string; lockUntil: Date; remainingMs: number; attempts: number }[] {
    const lockouts: { email: string; lockUntil: Date; remainingMs: number; attempts: number }[] = [];
    const now = new Date();
    const nowMs = now.getTime();
    for (const [email, attempt] of this.attempts.entries()) {
      if (attempt.lockUntil && attempt.lockUntil > now) {
        const windowStart = nowMs - 5 * 60 * 1000;
        const activeCount = attempt.timestamps.filter(ts => ts >= windowStart).length;
        lockouts.push({
          email,
          lockUntil: attempt.lockUntil,
          remainingMs: attempt.lockUntil.getTime() - nowMs,
          attempts: activeCount || 5 // Fallback to 5 if count cleanups cleared them
        });
      }
    }
    return lockouts;
  }
}

export const loginRateLimiter = new LoginRateLimiter();
