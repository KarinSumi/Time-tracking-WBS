# Security, Intrusion Detection, and System Health Monitoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement strong password complexity requirements, temporary login lockout after 5 failed attempts, an intrusion detection middleware for SQLi/Path Traversal, and a live health monitor tab in the Super Admin dashboard.

**Architecture:** Use custom validation utilities and Express middlewares to enforce security boundaries on the backend. Store security incidents in the SQLite database under the `AuditLog` table using the `SECURITY` type, and consume it in a new React monitoring tab in `SuperAdminTable.tsx`.

**Tech Stack:** Node.js, Express, Prisma, SQLite, React, Tailwind CSS (optional/Vanilla CSS).

---

### Task 1: Password Validation Utility

**Files:**
- Create: `src/utils/security.ts`
- Test: `tests/security.test.ts`

- [ ] **Step 1: Write the failing test**
  Create `tests/security.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { validatePassword } from '../src/utils/security';

  describe('validatePassword', () => {
    it('should reject passwords shorter than 8 characters', () => {
      const result = validatePassword('Short1!');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('at least 8 characters');
    });

    it('should reject passwords lacking uppercase letters', () => {
      const result = validatePassword('no_upper_123!');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('one uppercase letter');
    });

    it('should reject passwords lacking lowercase letters', () => {
      const result = validatePassword('NO_LOWER_123!');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('one lowercase letter');
    });

    it('should reject passwords lacking numbers', () => {
      const result = validatePassword('NoNumbers!');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('one number');
    });

    it('should reject passwords lacking special characters', () => {
      const result = validatePassword('NoSpecial123');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('one special character');
    });

    it('should accept valid complex passwords', () => {
      const result = validatePassword('ValidP@ssword123');
      expect(result.valid).toBe(true);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run tests/security.test.ts`
  Expected: FAIL with "validatePassword is not defined" or similar.

- [ ] **Step 3: Write minimal implementation**
  Create `src/utils/security.ts`:
  ```typescript
  export function validatePassword(password: string): { valid: boolean; reason?: string } {
    if (password.length < 8) {
      return { valid: false, reason: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one uppercase letter.' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one lowercase letter.' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one number.' };
    }
    const specialChars = /[!@#$%^&*(),.?":{}|<>_]/;
    if (!specialChars.test(password)) {
      return { valid: false, reason: 'Password must contain at least one special character.' };
    }
    return { valid: true };
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run tests/security.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/utils/security.ts tests/security.test.ts
  git commit -m "feat: implement password complexity validation utility"
  ```

---

### Task 2: Enforce Password Policy in Auth Register Router

**Files:**
- Modify: `src/services/AuthService.ts`
- Modify: `frontend/src/components/RegisterPage.tsx`

- [ ] **Step 1: Write a failing integration test**
  Modify `tests/auth.test.ts` (add a test block verifying password validation error):
  ```typescript
  it('should reject registration with weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Weak User',
        email: 'weak@example.com',
        password: 'weak',
        orgName: 'Stitch'
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('at least 8 characters');
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run tests/auth.test.ts`
  Expected: FAIL (should return 201 or other code instead of 400).

- [ ] **Step 3: Implement validation check in AuthService**
  Modify `src/services/AuthService.ts:34` to import and call `validatePassword`:
  ```typescript
  import { validatePassword } from '../utils/security';
  ```
  And inside `register`:
  ```typescript
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    throw new Error(passwordCheck.reason || 'Password does not meet complexity requirements');
  }
  ```
  Modify `src/routes/auth.ts` to return `400` status on password errors:
  ```typescript
  // in POST /api/auth/register
  } catch (error: any) {
    const status = error.message.includes('complexity') || error.message.includes('Password') ? 400 : (error.message.includes('already exists') ? 409 : 500);
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
  ```

- [ ] **Step 4: Update Frontend Form Validation**
  Modify `frontend/src/components/RegisterPage.tsx`:
  Update the validation schema or submit handler to enforce password complexity on the frontend before calling the signup API.
  ```typescript
  const validate = () => {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>_]/.test(password)) return "Password must contain at least one special character.";
    return null;
  };
  ```

- [ ] **Step 5: Run tests and verify they pass**
  Run: `npx vitest run tests/auth.test.ts`
  Expected: PASS

- [ ] **Step 6: Commit**
  ```bash
  git add src/services/AuthService.ts src/routes/auth.ts frontend/src/components/RegisterPage.tsx tests/auth.test.ts
  git commit -m "feat: enforce strong password requirements in registration"
  ```

---

### Task 3: In-Memory Login Rate Limiter (Brute Force Protection)

**Files:**
- Create: `src/utils/rateLimiter.ts`
- Test: `tests/rateLimiter.test.ts`

- [ ] **Step 1: Write a failing unit test**
  Create `tests/rateLimiter.test.ts`:
  ```typescript
  import { describe, it, expect, beforeEach, vi } from 'vitest';
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
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run tests/rateLimiter.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement LoginRateLimiter**
  Create `src/utils/rateLimiter.ts`:
  ```typescript
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
  }

  export const loginRateLimiter = new LoginRateLimiter();
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run tests/rateLimiter.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/utils/rateLimiter.ts tests/rateLimiter.test.ts
  git commit -m "feat: implement in-memory login rate limiter for lockout"
  ```

---

### Task 4: Integrate Login Lockout in AuthService & Log Security Incidents

**Files:**
- Modify: `src/services/AuthService.ts`
- Test: `tests/auth.test.ts`

- [ ] **Step 1: Write failing lockout integration test**
  Modify `tests/auth.test.ts`:
  ```typescript
  it('should temporarily lock account after 5 failed logins', async () => {
    // Attempt 5 incorrect logins
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@stitch.com', password: 'wrongpassword' });
    }
    // 6th attempt should return 423 Locked or 401 with lockout description
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@stitch.com', password: 'password123' });
    expect(res.status).toBe(423);
    expect(res.body.error).toContain('locked');
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run tests/auth.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement Lockout in login handler**
  Modify `src/services/AuthService.ts:login`:
  ```typescript
  import { loginRateLimiter } from '../utils/rateLimiter';
  ```
  Inside `login`:
  ```typescript
  const lockStatus = loginRateLimiter.isLocked(email);
  if (lockStatus.locked) {
    const mins = Math.ceil(lockStatus.remainingMs / 60000);
    throw new Error(`Account is temporarily locked. Please try again in ${mins} minutes.`);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: true },
  });

  if (!user) {
    loginRateLimiter.recordFailure(email);
    throw new Error('Invalid email or password');
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    loginRateLimiter.recordFailure(email);
    // If lockout is triggered now, write a SECURITY audit log
    const updatedStatus = loginRateLimiter.isLocked(email);
    if (updatedStatus.locked) {
      await prisma.auditLog.create({
        data: {
          entityType: 'SECURITY',
          entityId: user.id,
          action: 'BRUTE_FORCE_LOCKOUT',
          performedBy: user.id,
          newValues: { email, reason: '5 consecutive failed login attempts' }
        }
      });
    }
    throw new Error('Invalid email or password');
  }

  // Reset failures on successful login
  loginRateLimiter.reset(email);
  ```
  Modify `src/routes/auth.ts` to return `423` on lockout error:
  ```typescript
  // in POST /api/auth/login
  } catch (error: any) {
    const status = error.message.includes('locked') ? 423 : (error.message === 'Invalid email or password' ? 401 : 500);
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
  ```

- [ ] **Step 4: Run tests and verify they pass**
  Run: `npx vitest run tests/auth.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/services/AuthService.ts src/routes/auth.ts tests/auth.test.ts
  git commit -m "feat: integrate account lockout & audit logging on failed logins"
  ```

---

### Task 5: Intrusion Detection System (IDS) Middleware

**Files:**
- Create: `src/middleware/intrusionDetection.ts`
- Test: `tests/ids.test.ts`

- [ ] **Step 1: Write failing IDS test**
  Create `tests/ids.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest';
  import request from 'supertest';
  import app from '../src/app';

  describe('Intrusion Detection Middleware', () => {
    it('should block SQL injection signature in body', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: "' OR '1'='1", password: 'pass' });
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('security policy');
    });

    it('should block Directory Traversal signature in query', async () => {
      const res = await request(app)
        .get('/api/projects?file=../../etc/passwd');
      expect(res.status).toBe(403);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run tests/ids.test.ts`
  Expected: FAIL (should return normal validation error or 401 instead of 403).

- [ ] **Step 3: Implement Intrusion Detection Middleware**
  Create `src/middleware/intrusionDetection.ts`:
  ```typescript
  import type { Request, Response, NextFunction } from 'express';
  import prisma from '../lib/prisma';

  const SQLI_PATTERN = /(\bUNION\b|\bSELECT\b|--|\/\*|' OR '1'='1'|\bOR\b\s+\d+=\d+)/i;
  const TRAVERSAL_PATTERN = /(\.\.\/|\.\.\\|etc\/passwd|etc\/hosts)/i;

  function containsMaliciousPayload(val: any): string | null {
    if (typeof val === 'string') {
      if (SQLI_PATTERN.test(val)) return 'SQL_INJECTION';
      if (TRAVERSAL_PATTERN.test(val)) return 'PATH_TRAVERSAL';
    } else if (typeof val === 'object' && val !== null) {
      for (const k of Object.keys(val)) {
        const match = containsMaliciousPayload(val[k]);
        if (match) return match;
      }
    }
    return null;
  }

  export async function intrusionDetection(req: Request, res: Response, next: NextFunction) {
    const payloadSignature = 
      containsMaliciousPayload(req.body) ||
      containsMaliciousPayload(req.query) ||
      containsMaliciousPayload(req.params);

    if (payloadSignature) {
      // Find default superadmin or target admin to tag for audit (if possible)
      const systemUser = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
      const performedBy = systemUser?.id || '';

      if (performedBy) {
        await prisma.auditLog.create({
          data: {
            entityType: 'SECURITY',
            entityId: 'IDS',
            action: 'INTRUSION_BLOCKED',
            performedBy,
            newValues: {
              ip: req.ip || 'unknown',
              path: req.path,
              matchedPattern: payloadSignature,
              timestamp: new Date().toISOString()
            }
          }
        });
      }

      res.status(403).json({ error: 'Malicious request blocked by security policy.' });
      return;
    }
    next();
  }
  ```

- [ ] **Step 4: Register middleware globally**
  Modify `src/app.ts` to register `intrusionDetection` before routers:
  ```typescript
  import { intrusionDetection } from './middleware/intrusionDetection';
  // ...
  app.use(express.json());
  app.use(intrusionDetection);
  // routers follow...
  ```

- [ ] **Step 5: Run tests and verify they pass**
  Run: `npx vitest run tests/ids.test.ts`
  Expected: PASS

- [ ] **Step 6: Commit**
  ```bash
  git add src/middleware/intrusionDetection.ts src/app.ts tests/ids.test.ts
  git commit -m "feat: add global intrusion detection middleware (SQLi & Traversal blocking)"
  ```

---

### Task 6: System Status & Health Metrics Route

**Files:**
- Create: `src/routes/adminStatus.ts`
- Modify: `src/app.ts`
- Test: `tests/adminStatus.test.ts`

- [ ] **Step 1: Write a failing router test**
  Create `tests/adminStatus.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest';
  import request from 'supertest';
  import app from '../src/app';

  describe('System Status Health Check', () => {
    it('should reject status request for unauthenticated users', async () => {
      const res = await request(app).get('/api/admin/system-status');
      expect(res.status).toBe(401);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run tests/adminStatus.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement adminStatusRouter**
  Create `src/routes/adminStatus.ts`:
  ```typescript
  import express from 'express';
  import { authMiddleware, AuthRequest } from '../middleware/auth';
  import prisma from '../lib/prisma';

  const router = express.Router();

  router.get('/system-status', authMiddleware, async (req: AuthRequest, res) => {
    if (req.userRole !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    try {
      // Database connection latency check
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbLatencyMs = Date.now() - start;

      // Memory Usage check
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      };

      // Security incidents count & list
      const securityIncidents = await prisma.auditLog.findMany({
        where: { entityType: 'SECURITY' },
        orderBy: { timestamp: 'desc' },
        take: 30,
        include: { user: { select: { name: true, email: true } } }
      });

      res.json({
        dbStatus: 'ONLINE',
        dbLatencyMs,
        uptimeSeconds: Math.round(process.uptime()),
        memoryUsageMB,
        securityIncidents: securityIncidents.map(incident => ({
          id: incident.id,
          action: incident.action,
          timestamp: incident.timestamp,
          details: incident.newValues,
          userName: incident.user?.name || 'System / IDS'
        }))
      });
    } catch (err: any) {
      console.error('System health check failure:', err);
      res.status(500).json({ error: 'Failed to retrieve system status metrics' });
    }
  });

  export default router;
  ```
  Register the route in `src/app.ts`:
  ```typescript
  import adminStatusRouter from './routes/adminStatus';
  // ...
  app.use('/api/admin', adminStatusRouter);
  ```

- [ ] **Step 4: Run tests and verify they pass**
  Run: `npx vitest run tests/adminStatus.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/routes/adminStatus.ts src/app.ts tests/adminStatus.test.ts
  git commit -m "feat: implement system-status backend route for super admins"
  ```

---

### Task 7: Super Admin Dashboard Monitor Interface

**Files:**
- Modify: `frontend/src/api/index.ts`
- Modify: `frontend/src/components/SuperAdminTable.tsx`

- [ ] **Step 1: Add API client method**
  Modify `frontend/src/api/index.ts` to add standard API caller wrapper:
  ```typescript
  export async function getSystemStatus(): Promise<any> {
    return apiFetch('/api/admin/system-status');
  }
  ```

- [ ] **Step 2: Add System Monitor tab & UI to SuperAdminTable**
  Modify `frontend/src/components/SuperAdminTable.tsx` to:
  - Add state toggling: `const [activeTab, setActiveTab] = useState<'grid' | 'monitor'>('grid');`
  - Render Tab switcher buttons: "Data Grid" and "System Status Monitor" at the top action bar.
  - Implement the "System Status Monitor" view, fetching `/api/admin/system-status` every 10 seconds.
  - Display system meters (Database latency stats, Memory usage RSS/Heap size, System uptime indicator).
  - Add security events log table display, rendering recent blocked SQL injection attempts and brute-force locks list with dates and descriptive content.

- [ ] **Step 3: Test Build & Correctness**
  Run: `npm run build`
  Expected: Compilation succeeds with no typescript/bundler warnings.

- [ ] **Step 4: Commit**
  ```bash
  git add frontend/src/api/index.ts frontend/src/components/SuperAdminTable.tsx
  git commit -m "feat: integrate system status monitor UI tab on Super Admin page"
  ```
