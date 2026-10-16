# Architecture Overview — Analytics History Archive

*Last updated: Stage 2 (Design System & Application Shell)*

## Product Summary

Analytics History Archive is a SaaS application that lets users:

- Import historical analytics data (CSV, JSON; later provider integrations)
- Store it in a structured database under their own projects
- Visualize trends with charts and date filters
- Export their data
- Eventually connect live sources and use AI for screenshot extraction

It is **not** a live analytics tracker. It is a long-term archive and analysis tool.

## High-Level Architecture (Target)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Browser /      │────▶│  Next.js App     │────▶│  Cloudflare D1  │
│  Mobile Client  │◀────│  (Vercel)        │◀────│  (structured    │
└─────────────────┘     │                  │     │   analytics &   │
                        │  - App Router    │     │   metadata)     │
                        │  - API Routes /  │     └─────────────────┘
                        │    Server Actions│
                        │  - Auth          │     ┌─────────────────┐
                        │  - Validation    │────▶│  Cloudflare R2  │
                        └──────────────────┘     │  (uploaded      │
                                                 │   CSV/JSON/     │
                                                 │   screenshots)  │
                                                 └─────────────────┘
```

## Current Implementation (Stage 2)

- Next.js 15 App Router + TypeScript
- Tailwind CSS v4 with CSS custom-property design tokens
- Reusable UI primitives under `src/components/ui/`
- Application shell (`AppShell` + `Sidebar` + `Header`) under `src/components/layout/`
- Design-system preview at `/dashboard`
- No authentication, database, or import logic yet

## Key Design Decisions

1. **Empty starting point** — Repository began with only a one-line README.
2. **Next.js + TypeScript + App Router** — Modern React development and Vercel compatibility.
3. **Tailwind v4 + CSS tokens** — Semantic colors and easy theming without a large component library.
4. **Cloudflare D1 + R2** — Target data layer; connection method verified in Stage 6.
5. **No secrets in repo** — All credentials via environment variables.
6. **Stage-gated development** — One stage at a time with documentation and explicit approval.

## Data Model (Conceptual — implemented in Stage 6)

- Users (managed by auth provider)
- Projects (website archives owned by a user)
- Import Batches
- Analytics Records
- Integration Connections (later stages)

## Security Principles

- Server-side authorization on every private resource
- Project ownership checks on every query
- File upload validation
- No secrets in client bundles or logs
- CSV formula injection protection on export

## Known Constraints

- No production deployment, database, or auth provider provisioned yet.
- Mobile-first responsive design and accessibility are required from Stage 2 onward (shell is responsive).
- Real feature routes will replace the current design-system preview links in later stages.

## Next Stage

Stage 3 will build the public landing page with accurate product messaging, hero, how-it-works, features, and CTAs.
