# Analytics History Archive

**Stage 12 completed** — Optional AI Insights.

All planned stages **1–12** are implemented on branch `stage/12-ai-insights`.

R2 object storage remains deferred until you choose to add it after the product is otherwise done.

## Optional AI

```bash
# .env.local
AI_API_KEY=your_key
AI_BASE_URL=https://api.x.ai/v1   # OpenAI-compatible
AI_MODEL=grok-3
```

Without a key, **Generate insights** still returns a local summary from stored metrics.

## Deploy on Vercel

Required env vars:

1. `AUTH_SECRET` — `openssl rand -base64 32`
2. `DATABASE_URL` — **Turso/libsql** URL (`libsql://...`), **not** Vercel Postgres / Neon
3. `DATABASE_AUTH_TOKEN` — Turso auth token

This app uses **SQLite via libsql**. Marketplace Postgres will not work for registration.

After deploy, open `/api/health` — `database` should be `"configured"`.
