# Changelog

All notable changes to the Aion Enterprise Time Logger will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.4.0] - 2026-05-22
### Added
- Interactive API documentation using Swagger UI at `/api-docs` via `openapi.yaml` configuration.
- Detailed `CONTRIBUTING.md` guide for collaborators outlining branching, testing, and multi-tenant rules.
- Headless setup validation to prevent platform-specific dependency crashes.
- Global badges, tech stack tables, and interactive architecture flows in the master documentation.

### Changed
- Refactored `package.json` to prune platform-specific `@rolldown` bindings blocking non-Windows environments.
- Updated `DEVELOPER.md` system guidelines to cover all 16 test suites (48 specs) and current security layout.

---

## [1.3.0] - 2026-05-21
### Added
- **System Monitor Dashboard**: Super Admin UI dashboard displaying live CPU/memory telemetry, database health state, and rate-limiting lockout registers.
- **Lockout Manager**: Route for administrators to manually unlock locked user accounts (`POST /api/admin/status/unlock`).
- **Prisma Middlewares & Hooks**: Restrict cross-tenant ID leakage inside Time Entry reference schemas.
- **Git Restrictions**: Configured `pre-commit` and `pre-push` hooks constraining push authors to KarinSumi owner identity.

---

## [1.2.0] - 2026-05-20
### Added
- **Intrusion Detection System (IDS)**: Global middleware scanner scanning request parameters for potential SQL injection or directory traversal signatures.
- **Rate-Limiting Lockouts**: Brute-force protection layer locking accounts for 15 minutes after 5 consecutive failures.
- **Password Policies**: Enforce strong checks (8+ characters, mixed casing, integers, special characters) during new user signup.
- **Audit Logs**: Enhanced logging for security operations.

---

## [1.1.0] - 2026-05-18
### Added
- **Smart Insights Engine**: Core pathing recommendations advising users which task to log hours to next.
- Bilingual manual additions (Japanese and Thai localization readmes).

---

## [1.0.0] - 2026-05-15
### Added
- Initial Release of Aion Enterprise Time Logger.
- Core WBS Gantt planner tree structure.
- Daily/weekly time logs worksheets.
- Bulk Excel team uploading template structures.
- Organization customization branding hex styles.
