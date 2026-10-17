# Analytics History Archive

**Stage 11 completed** — Optional Vercel Analytics Integration.

Branch: `stage/11-vercel-analytics`

Core MVP: stages **1–10**. Optional: **11** (this), **12** (AI insights). R2 still deferred.

## Vercel

- App ships with `@vercel/analytics` and `@vercel/speed-insights`.
- Deploy on Vercel and enable Analytics in the project dashboard.
- Import Vercel-style JSON (pageviews/visitors) via project → Import data.

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```
