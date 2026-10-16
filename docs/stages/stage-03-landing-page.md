# Stage 03 — Landing Page

**Date:** 2026-10-16  
**Branch:** `stage/03-landing-page`  
**Status:** Completed (with post-review corrections) — approved

## A. Stage Overview

- **Stage number and title:** Stage 3 — Landing Page
- **Objective:** Build a professional, accurate public-facing product website that explains the product and invites users to get started.
- **Problem being solved:** Without a clear landing page, visitors cannot understand the product’s purpose, value, or how it differs from live analytics tools.
- **Result achieved:** A responsive landing page with navigation, hero, problem/solution, how-it-works, features, privacy messaging, final CTA, and footer. Messaging is honest; no fake testimonials or statistics.

## B. Features Implemented

- Sticky responsive navigation (desktop links + mobile menu with Escape, backdrop close, body scroll lock)
- Hero with primary tagline, dual CTAs, and clear interim-destination note
- Labeled illustrative product preview (explicitly not live data)
- Problem / solution section
- How it works (3 steps)
- Feature grid (historical storage, import, charts, multi-site, export, future integrations)
- Privacy and control section with accurate disclosures
- Final CTA with honest note that auth arrives in Stage 4
- Footer with product, account, and legal placeholders
- Improved page metadata (title template, description, Open Graph, robots)
- Section anchor targets use `scroll-mt-20` so sticky header does not hide headings

## C. Files Changed

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Full landing page content |
| `src/app/layout.tsx` | Richer metadata |
| `src/components/landing/nav.tsx` | Public navigation |
| `src/components/landing/footer.tsx` | Public footer |
| `README.md` | Status update |
| `docs/stages/stage-03-landing-page.md` | This report |

## D. Technical Decisions

- Landing page reuses existing design tokens and utility classes; no new UI library.
- CTAs currently link to `/dashboard` (design-system preview) because authentication does not exist yet. Hero, nav, and final CTA all disclose this interim behavior.
- Product preview uses neutral placeholders and an “Illustrative preview — not live data” label.
- Future integrations are described as planned, not available.
- No company address, invented legal entity, or fake social proof was added.

## E. Testing and Verification

```text
npx tsc --noEmit
→ Exit 0

npm run lint
→ No ESLint warnings or errors

npm run build
→ Compiled successfully; static pages for /, /dashboard, /icon.svg
```

Manual checks:
- Anchor links clear the sticky header (`scroll-mt-20`).
- Mobile nav closes on Escape, backdrop click, and body scroll is locked while open.
- CTA microcopy states that destinations are the app preview until auth ships.
- No fake customer logos, testimonials, or usage statistics.

## F. Security Considerations

- No secrets introduced.
- No forms collect credentials yet (auth is Stage 4).
- Public page only; no private data displayed.

## G. Known Limitations

- “Get started” / “Start your archive” still open the design-system preview until Stage 4 (now clearly labeled).
- Terms of service page is listed as “coming soon”.
- Pricing is omitted (not defined yet).
- Design-system dashboard remains available at `/dashboard`.

## H. Next Stage

**Stage 4: Authentication**

- Select a compatible authentication approach
- Registration, login, logout, session management
- Protected routes and server-side checks
- Safe environment configuration

## I. Rollback Considerations

Frontend-only changes. Safe to revert:

```bash
git checkout stage/02-design-system
```

## J. Post-Review Corrections

1. **Sticky header covering anchors** — Added `scroll-mt-20` to `#features`, `#how-it-works`, and `#privacy`.
2. **Mobile nav UX** — Escape closes menu, body scroll locked while open, backdrop click-outside closes menu, `role="dialog"` / `aria-modal`.
3. **Misleading CTA destinations** — Nav uses “App preview” instead of “Sign in”; hero and mobile menu include explicit notes that links open the design-system preview until authentication ships.
