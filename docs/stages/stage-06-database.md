# Stage 06 — Database and Analytics Data Model

**Date:** 2026-10-16  
**Branch:** `stage/06-database`  
**Status:** Completed (with post-review corrections) — awaiting approval

## A. Stage Overview

- **Objective:** Establish reliable structured storage with reproducible migrations and ownership-safe queries.
- **Result:** SQLite-compatible schema (libsql) for users, projects, import batches, and analytics records; in-memory stores replaced with database access.

## B. Features Implemented

- Migration file `db/migrations/001_init.sql`
- CLI `npm run db:migrate` and automatic `ensureDbReady()` on first DB use
- Tables: `users`, `projects`, `import_batches`, `analytics_records`, `schema_migrations`
- Indexes for ownership, dates, metrics, and batches
- Users and projects modules read/write the database
- Analytics helpers (list records, create/list import batches) with project ownership checks
- Documented metric/source identifiers
- `.env.example` documents `DATABASE_URL` / local file default

## C. Files Changed

| Path | Purpose |
|------|---------|
| `db/migrations/001_init.sql` | Schema |
| `src/lib/db/*` | Client, migrate, ensure |
| `scripts/db-migrate.mjs` | CLI migrate |
| `src/lib/auth/users.ts` | DB-backed users |
| `src/lib/projects/store.ts` | DB-backed projects |
| `src/lib/analytics/*` | Types + record/batch helpers |
| `.gitignore` | `/data`, `*.db` |

## D. Technical Decisions

- **libsql (`@libsql/client`)** — SQLite dialect compatible with Cloudflare D1 SQL; works from Node/Vercel with a remote Turso URL; defaults to `file:./data/aha.db` locally.
- **Not using native D1 bindings yet** — those require Cloudflare Workers runtime. Schema is portable; binding adapter can be added when deploying on Cloudflare.
- **Auto-migrate on first use** — simplifies local dev; production should still run `npm run db:migrate` in deploy pipelines.
- **CASCADE deletes** — deleting a project removes its batches and records.

## E. Testing

```text
npm run db:migrate
npx tsc --noEmit
npm run lint
npm run build
```

## F. Security

- Parameterized queries only
- All project/analytics access scoped by `user_id` ownership
- Password hashes remain bcrypt; never selected into client responses via public helpers

## G. Known Limitations

- Local file DB is not suitable for multi-instance serverless without a remote `DATABASE_URL`
- D1 Workers bindings not wired in this stage
- CSV/JSON import writers land in Stage 7

## H. Next Stage

**Stage 7: CSV and JSON Import**

## I. Rollback

```bash
git checkout main
# or stage/05-project-management
```
Remove local `data/aha.db` if discarding local schema.

## J. Post-Review Corrections

1. **Foreign keys on app connections** — `getDb()` runs `PRAGMA foreign_keys = ON` for every process connection.
2. **Production DATABASE_URL required** — local file DB is refused when `NODE_ENV=production`, `VERCEL=1`, or `CF_PAGES=1`.
3. **Auto-migrate only in development** — production must run `npm run db:migrate` (or set `ALLOW_AUTO_MIGRATE=1`).
4. **R2 deferred** — object storage will be added only after the rest of the product is complete.
