# Auto-Update and Redeployment Design Spec

This specification details the design for the server auto-update feature. It allows a Super Administrator to trigger a Git pull and full rebuild of the application from the web UI, during which the system is placed in maintenance mode, and active user session states are preserved in-browser.

---

## 1. Maintenance Mode Middleware

A custom Express middleware will be placed at the top of the middleware stack in `src/app.ts`.

### Logic
* It checks if a `.maintenance` file exists in the root directory.
* If `.maintenance` exists:
  - If the request path is a public health check (`/health`), public auth endpoint (`/api/auth/login`, `/api/auth/me`), or admin status endpoints (`/api/admin/status`), the request is **allowed** to pass.
  - For all other endpoints (e.g. `/api/entries`, `/api/projects`), the middleware blocks the request and responds with:
    - Status: `503 Service Unavailable`
    - Body: `{ error: "System is currently undergoing maintenance. Please try again shortly." }`
* If `.maintenance` does not exist, requests pass normally.

---

## 2. Auto-Update Router Endpoint

A new endpoint will be created in `src/routes/adminStatus.ts`:
* **Route**: `POST /api/admin/status/upgrade`
* **Authorization**: Restricted to `SUPER_ADMIN` or `ADMIN` roles.
* **Flow**:
  1. Create the `.maintenance` file in the root directory.
  2. Spawn a detached child process running `bash scripts/redeploy.sh`.
  3. Respond immediately to the request with `{ success: true, message: "System upgrade initiated. Entering maintenance mode." }`.

---

## 3. Redeployment Shell Script (`scripts/redeploy.sh`)

A bash script will handle the build and restart logic.
* **Location**: `scripts/redeploy.sh`
* **Workflow**:
  1. Wait 2 seconds for the HTTP response to finish sending.
  2. Run `git pull origin master` (pull latest code).
  3. Run `npm install` (update dependencies).
  4. Run `npx prisma db push` (update database schema).
  5. Run `npm run build` (recompile frontend and backend).
  6. Delete the `.maintenance` file.
  7. Terminate the Node.js parent process (e.g., `kill` or `pkill` the server process, or exit).
* *Note: Since the app runs in development/production with process managers (like nodemon, PM2, or standard concurrent script execution), process exit will trigger automatic reload of the newly built server.*

---

## 4. Frontend Maintenance Overlay & Polling

In the React frontend, when the Super Admin triggers the update, or when any client receives a `503` error from the API:
* Catch `503` responses globally in the Axios client interceptor `frontend/src/api/client.ts`.
* Trigger a global maintenance state (using a listener or context) that displays a beautiful, full-screen blur overlay: **"Aion is undergoing a system update. Your session and unsaved changes are preserved. Resuming shortly..."**
* Start polling the public `/health` endpoint every 3 seconds.
* Once the server comes back online and returns `200 OK`, remove the overlay. All inputs and pages remain active in React state, allowing users to submit forms immediately.
