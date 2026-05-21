# Aion Security, Intrusion Detection, and System Health Monitoring Spec

This specification details the enhancements to user authentication security (password complexity and login lockout), real-time malicious input detection (SQL injection and path traversal blocking), and superadmin system status monitoring.

---

## 1. Strong Password Policy & Authentication Lockout

### Password Complexity Rules
During user registration (and any future password change functionality), the password must meet the following minimum requirements:
- Minimum length of **8 characters**.
- Contains at least **1 uppercase letter** (A-Z).
- Contains at least **1 lowercase letter** (a-z).
- Contains at least **1 numeric digit** (0-9).
- Contains at least **1 special character** (e.g., `@`, `$`, `!`, `%`, `*`, `?`, `&`, `#`).

A validation helper `validatePassword(password: string): { valid: boolean; reason?: string }` will be implemented in `src/utils/security.ts`.
If verification fails, the server responds with a `400 Bad Request` and a descriptive message.

### Brute Force Lockout
- A memory-based login rate limiter will track consecutive failed login attempts by email address.
- If a user triggers **5 consecutive failed attempts** within a **5-minute window**:
  - The account is locked temporarily for **15 minutes**.
  - Any login attempt during the lockout period is immediately rejected with a `423 Locked` or `401 Unauthorized` status (e.g., "Account is temporarily locked. Please try again in 15 minutes.").
  - A `SECURITY` event is created in the `AuditLog` table:
    - `entityType`: `"SECURITY"`
    - `entityId`: `user.id` or `"SYSTEM"`
    - `action`: `"BRUTE_FORCE_LOCKOUT"`
    - `performedBy`: `user.id` (or if not registered, a system marker)
    - `newValues`: `{ email: "target@example.com", reason: "5 consecutive failed login attempts" }`

---

## 2. Intrusion Detection System (IDS) Middleware

A custom Express middleware `src/middleware/intrusionDetection.ts` will inspect all incoming API requests (JSON request body, query parameters, and URL route parameters).

### Signature Scanning
It will inspect parameters using regex patterns for:
1. **SQL Injection (SQLi)**:
   - Match signature words: `UNION SELECT`, `UNION ALL SELECT`, `OR 1=1`, `' OR ''='`, `ORDER BY`, `--`, `/*`.
2. **Directory / Path Traversal**:
   - Match path escape signatures: `../`, `..\\`, `/etc/passwd`, `/etc/hosts`.

### Response & Incident Logging
- If a match is found:
  - The request is immediately rejected with a `403 Forbidden` response: `{ error: "Malicious request blocked by security policy." }`.
  - A `SECURITY` audit entry is written to `AuditLog`:
    - `entityType`: `"SECURITY"`
    - `entityId`: `"IDS"`
    - `action`: `"INTRUSION_BLOCKED"`
    - `performedBy`: (system or authenticated userId if available)
    - `newValues`: `{ ip: req.ip, path: req.path, matchedPattern: "SQL_INJECTION", payload: ... }`

---

## 3. Real-Time System Health Status & Dashboard

### Backend System Status Route
A new route `GET /api/admin/system-status` will be created under `src/routes/admin.ts` (or similar admin routing).
- Restrained to users with the `SUPER_ADMIN` role.
- Checks and returns:
  - **Database Connection Status**: Measures latency of a simple `SELECT 1` query via Prisma.
  - **Memory Usage**: Returns Node's memory consumption (RSS, Heap Used, Heap Total) in MB.
  - **System Uptime**: Returns process uptime in seconds.
  - **Security Counters**: Retrieves count of recent blocked attacks and locks.

### Super Admin Dashboard Panel
A new tab `"System Monitor"` will be introduced in the `/admin` page component `SuperAdminTable.tsx`.
- Displays graphical status cards/widgets for:
  - Uptime, Database Health (Online/Offline + latency), and Memory Usage.
- Displays a dedicated **Security Alerts Log** table:
  - Lists the `SECURITY` audit logs (brute force lockouts, blocked SQL injections/path traversals) with timestamps, IP addresses, and matched signatures.
