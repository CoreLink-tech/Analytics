# Stage 07 — CSV and JSON Import

**Date:** 2026-10-17  
**Branch:** `stage/07-csv-json-import`  
**Status:** Completed — awaiting approval

## A. Stage Overview

- **Objective:** Let users import historical analytics from CSV/JSON into a project they own.
- **Result:** Upload, preview, column mapping, normalization, duplicate skip, import summary; rows stored in `analytics_records` with `import_batches` metadata.

## B. Features Implemented

- CSV and JSON parsers (5 MB / 10k row limits)
- Preview + auto-suggested column mapping
- Manual mapping for date, metric name, value (+ optional path/dimensions)
- Ownership-checked API `POST /api/projects/[id]/import`
- Duplicate detection (same project/source/metric/date/dims/path/source id)
- Import summary (accepted / rejected / duplicates)
- Project detail shows import history and sample records
- **No R2** — originals not retained in object storage (deferred by product decision)

## C. Files

| Path | Purpose |
|------|---------|
| `src/lib/analytics/parse.ts` | CSV/JSON parse |
| `src/lib/analytics/import.ts` | Map, validate, insert |
| `src/app/api/projects/[id]/import/route.ts` | Import API |
| `src/components/projects/import-form.tsx` | UI |
| `src/app/dashboard/websites/[id]/import/page.tsx` | Import page |

## D. Technical Decisions

- In-memory parse only; durable data is normalized SQL rows.
- Application-level duplicate checks (schema has no unique index on all dims).
- Auth + project ownership required for every import.

## E. Testing

```text
npx tsc --noEmit
npm run lint
npm run build
```

## F. Security

- Session required; 404 for non-owned projects
- File size limits; no executable handling

## G. Known Limitations

- No permanent original-file storage (R2 later)
- No multi-metric wide CSV pivot (one metric column per row expected)
- Duplicate detection is sequential (not bulk upsert)

## H. Next Stage

**Stage 8: Historical Analytics Dashboard**

## I. Rollback

```bash
git checkout stage/06-database
```
