# Stage 09 — Export, History & Data Management

**Date:** 2026-10-17  
**Branch:** `stage/09-export-data-management`  
**Status:** Completed — awaiting approval

## A. Overview

- Export project analytics as CSV or JSON
- Import batch history with per-batch delete
- Filtered record deletion (date and/or metric; unbounded delete blocked)
- Manage page + export actions on analytics dashboard

## B. APIs

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/projects/[id]/export` | CSV/JSON download |
| DELETE | `/api/projects/[id]/records` | Delete by filter |
| DELETE | `/api/projects/[id]/batches/[batchId]` | Delete batch + rows |

All require session + project ownership.

## C. Files

- `src/lib/analytics/manage.ts`
- `src/app/api/projects/[id]/export/route.ts`
- `src/app/api/projects/[id]/records/route.ts`
- `src/app/api/projects/[id]/batches/[batchId]/route.ts`
- `src/app/dashboard/websites/[id]/manage/page.tsx`
- `src/components/projects/data-manage-panel.tsx`

## D. Security

- Ownership on every mutation
- Confirm dialogs in UI
- Export capped at 5–10k rows
- Delete requires at least one filter

## E. Next

**Stage 10: Security, Testing & MVP Stabilization**
