# Analytics History Archive

> Your analytics shouldn't disappear just because your provider forgets them.

## Status

**Stage 10 completed** — Security, Testing & MVP Stabilization.

**Core MVP stages 1–10 are complete** on branch `stage/10-security-mvp`.

Optional later: Stage 11 (Vercel Analytics), Stage 12 (AI insights).  
Object storage (R2) is deferred until you choose to add it after the product is otherwise done.

## Quick start

```bash
npm install
cp .env.example .env.local
# AUTH_SECRET=...   (required in production)
npm run db:migrate
npm run dev
```

## Features

- Auth (register / login)
- Website projects CRUD
- SQLite/libsql database
- CSV/JSON import with mapping
- Historical dashboard (charts + table)
- Export CSV/JSON, import history, filtered deletes
- Security headers, rate limits, health check

## Docs

- `docs/SECURITY.md`
- `docs/architecture.md`
- `docs/stages/`
