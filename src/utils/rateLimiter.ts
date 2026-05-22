class LoginRateLimiter {
  private attempts = new Map<string, { count: number; lockUntil?: Date }>();

  public recordFailure(email: string): void {
    const now = new Date();
    const current = this.attempts.get(email) || { count: 0 };
    current.count += 1;
    if (current.count >= 5) {
      current.lockUntil = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins lock
    }
    this.attempts.set(email, current);
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

  public getActiveLockouts(): { email: string; lockUntil: Date; remainingMs: number }[] {
    const lockouts: { email: string; lockUntil: Date; remainingMs: number }[] = [];
    const now = new Date();
    for (const [email, attempt] of this.attempts.entries()) {
      if (attempt.lockUntil && attempt.lockUntil > now) {
        lockouts.push({
          email,
          lockUntil: attempt.lockUntil,
          remainingMs: attempt.lockUntil.getTime() - now.getTime()
        });
      }
    }
    return lockouts;
  }
}

export const loginRateLimiter = new LoginRateLimiter();
