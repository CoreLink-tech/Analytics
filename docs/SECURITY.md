# Security Notes — Analytics History Archive

## Authentication

- Auth.js (NextAuth v5) credentials provider with **JWT sessions** (7-day max age)
- Passwords hashed with **bcrypt** (cost 12)
- `AUTH_SECRET` required in production (min 16 characters)
- Safe callback URL handling (relative paths only)

## Authorization

- Dashboard and `/api/projects/*` require a signed-in session (middleware + route checks)
- All project, import, export, and delete operations scoped by **project ownership** (`user_id`)

## Input & abuse controls

- Zod / explicit validation on registration and imports
- Upload size and row limits on CSV/JSON import
- In-memory rate limits on registration and import (per IP / user)
- Unbounded analytics deletes blocked (require date and/or metric filter)

## HTTP hardening

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Baseline Content-Security-Policy
- `poweredByHeader: false`

## Data

- Local SQLite for development only; production requires `DATABASE_URL`
- Foreign keys enabled on app connections
- No R2 object storage yet (deferred); import originals are not retained long-term

## Known MVP limits

- Rate limits are process-local (not shared across serverless instances)
- CSP allows `'unsafe-inline'` / `'unsafe-eval'` for Next.js compatibility
- Credentials auth only (no OAuth yet)
