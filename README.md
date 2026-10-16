# Analytics History Archive

> Your analytics shouldn't disappear just because your provider forgets them.

**Preserve your website analytics, explore historical trends, and keep your data organized in one place.**

## Current Status

**Stage 1 completed** — Repository foundation and project audit.

This repository is the beginning of a production-oriented SaaS application that helps website owners import, store, visualize, and export historical analytics data (CSV, JSON, and later integrations).

The project follows a strict stage-by-stage development process. Each stage is documented, tested, committed, and requires explicit approval before the next stage begins.

## Planned Tech Stack (MVP)

| Layer              | Technology                          |
|--------------------|-------------------------------------|
| Framework          | Next.js (App Router) + TypeScript   |
| Styling            | Tailwind CSS                        |
| Database           | Cloudflare D1                       |
| File storage       | Cloudflare R2                       |
| Hosting            | Vercel (application)                |
| Charts             | Recharts (planned)                  |
| Validation         | Zod (planned)                       |
| Auth               | To be selected in Stage 4           |

## Development Stages Overview

1. **Repository Foundation & Project Audit** ← *current*
2. Design System & Application Shell
3. Landing Page
4. Authentication
5. Website Project Management
6. Database & Analytics Data Model
7. CSV / JSON Import
8. Historical Analytics Dashboard
9. Export, History & Data Management
10. Security, Testing & MVP Stabilization
11. Vercel Analytics Integration (later)
12. AI Screenshot Extraction (later)

See `docs/stages/` for detailed stage reports.

## Getting Started (after Stage 2+)

```bash
# Install dependencies (once package.json is fully populated)
npm install

# Copy environment template
cp .env.example .env.local
# Fill in required values — never commit real secrets

# Run development server
npm run dev
```

## Important Rules for Contributors / AI Assistants

- Build **one stage at a time**.
- Test and document every stage.
- Never claim a feature works if it is only a visual mockup.
- Never expose secrets, tokens, or passwords.
- Wait for explicit approval before starting the next stage.

## License

Private / All rights reserved until otherwise decided.
