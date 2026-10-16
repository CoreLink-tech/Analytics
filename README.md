# Analytics History Archive

> Your analytics shouldn't disappear just because your provider forgets them.

## Current Status

**Stage 5 completed** — Website Project Management.

Branch: `stage/05-project-management`

## Getting Started

```bash
npm install
cp .env.example .env.local
# Set AUTH_SECRET (openssl rand -base64 32)
npm run dev
```

- `/` landing  
- `/register` / `/login` auth  
- `/dashboard` overview (protected)  
- `/dashboard/websites` project list  
- `/dashboard/websites/new` create project  

**Note:** Users and projects are stored in memory until Stage 6 (database).

## Stages

1–4 done · **5 Project management** ← current · 6 Database · 7 Import · …

See `docs/stages/`.
