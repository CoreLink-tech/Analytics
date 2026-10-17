# Stage 08 — Historical Analytics Dashboard

**Date:** 2026-10-17  
**Branch:** `stage/08-analytics-dashboard`  
**Status:** Completed — awaiting approval

## A. Stage Overview

- **Objective:** Explore imported analytics with filters, summary cards, charts, and tables.
- **Result:** Project-scoped dashboard at `/dashboard/websites/[id]/analytics`.

## B. Features

- Date range filters (from / to)
- Metric selection
- Summary cards (records, metrics, sum, average)
- Line chart (Recharts) for selected metric over time
- Data table (latest 50 matching rows)
- Empty state when no data
- Ownership enforced via project queries

## C. Files

| Path | Purpose |
|------|---------|
| `src/lib/analytics/queries.ts` | Aggregations & table queries |
| `src/components/analytics/*` | Filters + chart |
| `src/app/dashboard/websites/[id]/analytics/page.tsx` | Dashboard page |

## D. Decisions

- Recharts for charts
- Server-side SQL aggregation (GROUP BY date)
- Filter state via URL search params
- No R2

## E. Testing

```text
npx tsc --noEmit → Exit 0
npm run lint → No errors
npm run build → Success
```

## F. Next

**Stage 9: Export, History & Data Management**
