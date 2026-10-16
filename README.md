# Analytics History Archive

> Your analytics shouldn't disappear just because your provider forgets them.

## Current Status

**Stage 6 completed** — Database and Analytics Data Model.

Branch: `stage/06-database`

## Getting Started

```bash
npm install
cp .env.example .env.local
# Set AUTH_SECRET (openssl rand -base64 32)
npm run db:migrate
npm run dev
```

Local SQLite DB is created at `data/aha.db` (gitignored).

## Stages

1–5 done · **6 Database** ← current · 7 Import · 8 Dashboard · …

See `docs/stages/`.
