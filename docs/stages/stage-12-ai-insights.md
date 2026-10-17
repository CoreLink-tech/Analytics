# Stage 12 — Optional AI Insights

**Date:** 2026-10-17  
**Branch:** `stage/12-ai-insights`  
**Status:** Completed — awaiting approval

## A. Overview

Optional narrative insights over archived metrics for a project.

## B. Features

- `POST /api/projects/[id]/insights` (auth + ownership + rate limit)
- Aggregated context only (no raw password or full export dump to the model beyond summary JSON)
- **Local heuristics** when `AI_API_KEY` is unset
- **OpenAI-compatible** chat API when configured (`AI_BASE_URL`, default xAI; `AI_MODEL`)
- UI panel on the project analytics dashboard

## C. Env

```bash
AI_API_KEY=
AI_BASE_URL=https://api.x.ai/v1
AI_MODEL=grok-3
```

## D. Security

- Session required; project ownership enforced
- Rate limit 20/hour/user
- Server-side only API key

## E. Product plan status

Optional stages 11–12 complete. Core MVP was 1–10. R2 still deferred.
