# Stage 04 — Authentication

**Date:** 2026-10-16  
**Branch:** `stage/04-authentication`  
**Status:** Completed (with post-review corrections) — awaiting approval

## A. Stage Overview

- **Stage number and title:** Stage 4 — Authentication
- **Objective:** Let users securely create accounts and sign in, with protected private routes.
- **Problem being solved:** Without authentication, users cannot own private projects or data.
- **Result achieved:** Registration, login, logout, JWT sessions, middleware protection for `/dashboard`, and server-side session checks.

## B. Features Implemented

- Auth.js (NextAuth v5) with Credentials provider (email + password)
- Password hashing with bcryptjs (cost factor 12)
- Registration API (`POST /api/auth/register`) with Zod validation
- Login and register pages using the design system
- Logout control in the application header
- Middleware protecting `/dashboard` (redirect to `/login`)
- Logged-in users redirected away from `/login` and `/register`
- Landing page CTAs point to `/register` and `/login`
- `AUTH_SECRET` documented in `.env.example`
- Safe post-login redirect helper (`safeCallbackUrl`) blocking open redirects

## C. Files Changed

| Path | Purpose |
|------|---------|
| `src/lib/auth/config.ts` | Edge-safe Auth.js config for middleware |
| `src/lib/auth/index.ts` | Full Auth.js setup + Credentials provider |
| `src/lib/auth/users.ts` | User create/lookup + password verify |
| `src/lib/auth/callbacks.ts` | Safe relative callback URL helper |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth.js route handlers |
| `src/app/api/auth/register/route.ts` | Registration endpoint |
| `src/middleware.ts` | Route protection |
| `src/app/(auth)/login/*` | Sign-in UI |
| `src/app/(auth)/register/*` | Registration UI |
| `src/components/auth/sign-out-button.tsx` | Sign out control |
| `src/types/next-auth.d.ts` | Session typing |
| Landing nav/footer/page | CTAs to real auth routes |
| `.env.example` | AUTH_SECRET |

## D. Technical Decisions

- **Auth.js v5 (next-auth beta)** — established library; no custom password scheme beyond bcrypt.
- **JWT sessions** — no server session store required yet.
- **In-memory user store** — temporary until Stage 6 (Cloudflare D1).
- **Edge/Node split** — middleware uses config without bcrypt; Node routes use full provider.
- **No social login** — deferred per product specification.
- **callbackUrl allowlist** — only same-origin relative paths starting with a single `/`.

## E. Testing and Verification

```text
npx tsc --noEmit → Exit 0
npm run lint → No ESLint warnings or errors
npm run build → Compiled successfully
```

Manual flows:
1. Register → dashboard
2. Sign out → `/dashboard` redirects to login
3. Sign in → dashboard
4. Wrong password → error
5. Duplicate email → error
6. `callbackUrl=https://evil.com` ignored; falls back to `/dashboard`

## F. Security Considerations

- Passwords stored only as bcrypt hashes
- Password hash never returned from APIs
- Auth secret via environment variable
- Server-side session checks on dashboard
- Middleware authorization for protected paths
- Registration input validated with Zod
- Open-redirect protection on login `callbackUrl`

## G. Known Limitations

- User accounts are in-memory only until Stage 6 database
- No email verification
- No password reset flow
- No rate limiting on auth endpoints yet (Stage 10)
- No social login

## H. Next Stage

**Stage 5: Website Project Management**

## I. Rollback Considerations

```bash
git checkout stage/03-landing-page
```

## J. Post-Review Corrections

1. **Open redirect risk** — Added `safeCallbackUrl()`; login page and form only accept relative same-origin paths.
2. **Redirect origin** — Auth page redirect uses `request.nextUrl.origin` explicitly.
3. **Register validation** — Tighter name/email/password bounds; clearer status codes.
4. **Package hygiene** — Moved `@types/bcryptjs` to `devDependencies`.
