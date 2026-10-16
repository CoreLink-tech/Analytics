# Analytics History Archive

> Your analytics shouldn't disappear just because your provider forgets them.

**Preserve your website analytics, explore historical trends, and keep your data organized in one place.**

## Current Status

**Stage 4 completed** — Authentication.

Current working branch: `stage/04-authentication`

## Getting Started

```bash
npm install
cp .env.example .env.local
# Set AUTH_SECRET (e.g. openssl rand -base64 32)
npm run dev
```

- http://localhost:3000 — landing page  
- http://localhost:3000/register — create account  
- http://localhost:3000/login — sign in  
- http://localhost:3000/dashboard — protected app (requires sign-in)

**Note:** Stage 4 stores users in memory for development. Accounts may not persist across server restarts until Stage 6 (database).

## Stages

1. Repository Foundation  
2. Design System & Application Shell  
3. Landing Page  
4. **Authentication** ← current  
5. Website Project Management  
6. Database & Analytics Data Model  
7. CSV / JSON Import  
8. Historical Analytics Dashboard  
9. Export, History & Data Management  
10. Security, Testing & MVP Stabilization  
11–12. Later integrations / AI  

See `docs/stages/` for reports.
