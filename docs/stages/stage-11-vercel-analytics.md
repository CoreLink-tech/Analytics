# Stage 11 — Optional Vercel Analytics Integration

**Date:** 2026-10-17  
**Branch:** `stage/11-vercel-analytics`  
**Status:** Completed — awaiting approval

## A. Overview

Optional integration with Vercel Analytics for this app and for importing Vercel-style metric exports into the archive.

## B. Implemented

1. **`@vercel/analytics`** and **`@vercel/speed-insights`** in the root layout (active when deployed on Vercel).
2. CSP updated to allow Vercel Analytics / Insights script and connect endpoints.
3. **`vercel-normalize`**: expands wide JSON (pageviews + visitors on one row) into long-format import rows.
4. JSON import auto-detects Vercel-style fields and expands them with a warning.
5. Documentation of limits: no full historical pull API in this MVP — use export/upload via Stage 7 import.

## C. Files

- `src/app/layout.tsx`
- `next.config.ts` (CSP)
- `src/lib/analytics/vercel-normalize.ts`
- `src/lib/analytics/parse.ts`

## D. How to use

- Deploy on Vercel with Web Analytics / Speed Insights enabled in the project.
- To archive another site’s data: export or craft JSON with `date`, `pageviews`, `visitors`, optional `path`, then Import on a project.

## E. Next

**Stage 12 (optional): AI Insights** — or merge core to `main` and add R2 later.
