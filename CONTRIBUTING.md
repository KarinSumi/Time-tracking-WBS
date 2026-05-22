# Contributing to Aion Enterprise Time Logger

Welcome to the project! We are excited to have you contribute. This guide outlines the development workflow, coding standards, and repository rules to ensure a smooth collaboration.

---

## 🛠️ 1. Getting Started

### Prerequisites
- **Node.js**: version 18.x or higher
- **npm**: version 9.x or higher
- **Git**

### Installation & Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/KarinSumi/Time-tracking-WBS.git
   cd Time-tracking-WBS
   ```
2. Run the automated installer which sets up dependencies, environment files, and database seeds:
   ```bash
   node setup.js
   ```
3. Boot the development servers:
   ```bash
   npm run dev
   ```

---

## 🌿 2. Git Workflow

### Branching Policy
- Create descriptive feature branches from `master`:
  - `feat/your-feature-name` for new features or capabilities
  - `fix/bug-description` for bug fixes
  - `docs/topic-name` for documentation updates
  - `chore/task-name` for build, dependencies, or configuration changes

### Commit Message Conventions
We follow standard semantic prefixing for commit messages:
- `feat: add 2FA authentication`
- `fix: resolve task calculation drift`
- `docs: update deployment instructions`
- `chore: bump swagger dependencies`

### Git Hooks & Restrictions
> [!IMPORTANT]
> **Owner-Only Commit Restriction**: This repository has active pre-commit and pre-push hooks that restrict push privileges to the repository owner (`KarinSumi` / `kr19m1168@gmail.com`).
> 
> If you are a collaborator or contractor:
> 1. You **MUST** develop on your local branch.
> 2. Submit your changes via a Pull Request (PR). Do not attempt to push directly to `master`.

---

## 🏗️ 3. Architectural Rules & Standards

To maintain code quality, all contributors must strictly adhere to the following:

### A. Service Layer Pattern (Backend)
- All database operations and business logic **MUST** live in `src/services/`.
- Express route controllers (`src/routes/`) should only parse parameters, call services, and return JSON responses.
- Never write raw Prisma queries inside route handlers.

### B. Centralized API Client (Frontend)
- The frontend must only communicate with the backend using the Axios instance located in `frontend/src/api/client.ts`.
- Do not use raw `fetch()` or construct ad-hoc Axios clients.

### C. Multi-Tenant Isolation
- The application stores data for multiple organizations. You **must** ensure no tenant data leaks to another.
- Every query selecting, creating, updating, or deleting `User`, `Project`, `TimeEntry`, `Phase`, or `PlannedTask` must filter by `orgId` (or `organizationId`).
- Validate referenced IDs (e.g. check that a assigned `projectId` belongs to the current user's `orgId` before saving).

### D. Strict Type Safety
- All new code must be fully typed in TypeScript.
- Avoid using the `any` type. Configure proper interfaces or type definitions.

---

## 🧪 4. Testing & Verification

We use **Vitest** for testing backend APIs and services. 

### Writing Tests
- When adding new endpoints or services, write corresponding unit/integration tests in `/tests/`.
- Ensure you test both successful paths and negative cases (e.g. invalid inputs, unauthorized access).

### Running Tests
Before submitting a PR, verify that all tests pass locally:
```bash
npm run test
```
> [!NOTE]
> Tests run sequentially (`--fileParallelism=false`) because SQLite is a file-based database and does not support concurrent write operations across tests.

---

## 📄 5. Pull Request Checklist

Before submitting a pull request, ensure:
1. [ ] Code compiles without TypeScript errors (`npm run build`).
2. [ ] All automated tests pass (`npm run test`).
3. [ ] If you added or modified API endpoints, you updated the OpenAPI specification in `docs/openapi.yaml`.
4. [ ] No credentials or secrets are committed.
