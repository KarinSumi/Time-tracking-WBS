# AGENTS.md — Aion Enterprise Time Logger

Cross-platform AI agent instructions for this workspace.

## Global Instructions

See `/home/kmaths/GEMINI.md` for foundational mandates and the **Superpowers Skill Framework**.

## Project Context

- **Stack**: Node.js + Express (backend), React + Vite + TypeScript (frontend), Prisma + SQLite (data)
- **Test Framework**: Vitest + Supertest (`npm run test` — runs `vitest run --fileParallelism=false`)
- **Build**: `npm run build` (backend tsc + frontend vite build)
- **Dev Server**: `npm run dev` (concurrent backend + frontend)

## Superpowers Skills (Active by Default)

The Superpowers skill framework from `/home/kmaths/.gemini/extensions/superpowers/skills/` is **always active** for this project. Before any coding or design task:

1. **Check if a skill applies** — brainstorming, debugging, TDD, verification, etc.
2. **Load the skill** — read the relevant `SKILL.md` file before proceeding.
3. **Follow the skill workflow** — don't skip steps or rationalize shortcuts.

### Key Workflows for This Project

| Situation | Skill to Use |
|-----------|-------------|
| New feature or UI component | `brainstorming` → `writing-plans` → `test-driven-development` |
| Bug fix or test failure | `systematic-debugging` → `test-driven-development` |
| Claiming work is done | `verification-before-completion` |
| Code review feedback | `receiving-code-review` |
| Multi-step implementation | `executing-plans` |

## Architecture Rules

- **Service Layer Pattern**: All backend business logic lives in `/src/services/`. Routes delegate to services.
- **Centralized API Client**: Frontend uses the Axios client in `/frontend/src/api/client.ts`. No raw `fetch()`.
- **Multi-Tenant Isolation**: All database queries must filter by `organizationId`. See tests in `/tests/admin.test.ts`.
- **Type Safety**: Strict TypeScript. No `any` escapes.
