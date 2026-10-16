# Architecture Overview — Analytics History Archive

*Last updated: Stage 1 (Repository Foundation)*

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

## Key Design Decisions (Stage 1)

1. **Empty starting point** — The repository previously contained only a one-line README. No existing application code, components, or configuration existed. We therefore establish the foundation cleanly.

2. **Next.js + TypeScript + App Router** — Chosen for modern React development, server components, and good Vercel compatibility. Exact minor versions will be locked when `npm install` is successfully run in a stable network environment.

3. **Cloudflare D1 + R2** — Preferred for cost-effective structured storage (D1) and object storage (R2). Compatibility between Vercel runtime and Cloudflare bindings must be verified in Stage 6 before implementation. Alternative connection methods (e.g. REST API, or co-locating on Cloudflare Workers) will be evaluated then.

4. **No secrets in repo** — All credentials via environment variables. `.env.example` contains only placeholder names.

5. **Stage-gated development** — Strict one-stage-at-a-time workflow with documentation, testing, and explicit human approval required between stages.

## Data Model (Conceptual — implemented in Stage 6)

- **Users** (managed by auth provider)
- **Projects** (website archives owned by a user)
- **Import Batches** (metadata about each upload)
- **Analytics Records** (normalized metric observations)
- **Integration Connections** (later stages)

## Security Principles

- Server-side authorization on every private resource
- Project ownership checks on every query
- File upload validation (type, size, structure)
- No secrets in client bundles or logs
- CSV formula injection protection on export

## Known Constraints (as of Stage 1)

- This development environment has intermittent network connectivity to npm and occasionally GitHub, which prevented a full `create-next-app` + `npm install` cycle during Stage 1. The source structure and configuration files are prepared so that a subsequent `npm install` can complete the setup.
- No production deployment, database, or auth provider has been provisioned yet.
- Mobile-first responsive design and accessibility are required from Stage 2 onward.

## Next Stage

Stage 2 will establish the design system (colors, typography, spacing, reusable components) and the basic application shell (layout, navigation placeholders).
