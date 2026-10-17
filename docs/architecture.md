# Architecture Overview — Analytics History Archive

*Last updated: Stage 6 (Database)*

## Product Summary

Long-term analytics archive: import, store, visualize, and export historical website analytics.

## Stack

| Layer | Choice |
|-------|--------|
| App | Next.js 15 App Router + TypeScript |
| UI | Tailwind CSS v4 + design tokens |
| Auth | Auth.js (credentials) + bcrypt |
| Database | libsql / SQLite (file local; Turso remote) — D1-compatible SQL |
| Hosting target | Vercel (app); remote SQL URL for multi-instance |

## Data model

- **users** — credential accounts
- **projects** — website archives owned by a user
- **import_batches** — import job metadata
- **analytics_records** — normalized metric observations

Ownership is enforced in application queries (`user_id` / project ownership checks).

## Database setup

```bash
npm run db:migrate
```

Default URL: `file:./data/aha.db`  
Override: `DATABASE_URL` (+ optional `DATABASE_AUTH_TOKEN` for Turso).

Production requires `DATABASE_URL`. Foreign keys are enabled on each connection. Auto-migrate runs in development only; use `npm run db:migrate` for production. R2 storage is deferred until after the core product stages.

## Security principles

Server-side auth, project isolation, parameterized SQL, no secrets in repo.
