# Stage 05 — Website Project Management

**Date:** 2026-10-16  
**Branch:** `stage/05-project-management`  
**Status:** Completed — awaiting approval

## A. Stage Overview

- **Objective:** Let users manage website projects that will hold archived analytics.
- **Result:** Full CRUD with ownership checks, confirmation on delete, empty states, responsive UI.

## B. Features Implemented

- Project list (`/dashboard/websites`)
- Create project (`/dashboard/websites/new`)
- Project detail (`/dashboard/websites/[id]`)
- Edit project (`/dashboard/websites/[id]/edit`)
- Delete with explicit confirmation
- REST API: `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/[id]`
- Server-side ownership validation (user can only access own projects)
- Input validation (name required; domain/description optional with limits)
- Empty state when no projects exist
- Deletion policy documented (cascade of analytics deferred until those entities exist)

## C. Files Changed

| Path | Purpose |
|------|---------|
| `src/lib/projects/store.ts` | In-memory project store + ownership helpers |
| `src/app/api/projects/route.ts` | List + create |
| `src/app/api/projects/[id]/route.ts` | Get, update, delete |
| `src/app/dashboard/websites/**` | UI pages |
| `src/components/projects/*` | Form + delete confirmation |
| Dashboard overview | Link to My Websites |

## D. Technical Decisions

- In-memory store (same pattern as Stage 4 users) until D1 in Stage 6.
- Unauthorized access to another user’s project ID returns 404 / `notFound()` (no existence leak across users beyond 404).
- Domain stored without protocol when possible.

## E. Testing

```text
npx tsc --noEmit
npm run lint
npm run build
```

Manual: register → create project → edit → open detail → delete with confirm → list empty.

## F. Security

- All project APIs require session
- Every read/write checks `project.userId === session.user.id`
- No cross-user access by ID guessing (returns not found)

## G. Known Limitations

- In-memory only until Stage 6
- No analytics records yet to cascade on delete
- No multi-member / team projects

## H. Next Stage

**Stage 6: Database and Analytics Data Model**

## I. Rollback

```bash
git checkout stage/04-authentication
```
