<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# NutriMind AI

> Simple Outside. Infinite Intelligence Inside.

An AI health & nutrition platform — Express + Vite server with REST APIs
(meals, AI coach chat, family, wearables, admin console) and a React
frontend, backed by Supabase (Postgres + Auth) and Google Gemini.

## Run Locally

**Prerequisites:** Node.js 22+, npm.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (copy the example and fill in real values)
cp .env.example .env
#   - GEMINI_API_KEY      (Google Gemini)
#   - SUPABASE_URL        (Supabase project URL)
#   - SUPABASE_ANON_KEY   (Supabase anon/publishable key)
#   - SUPABASE_SERVICE_ROLE_KEY (server-side admin key)
#   - DATABASE_URL        (Postgres connection string for Prisma)

# 3. Generate the Prisma client (after cloning or schema changes)
npx prisma generate

# 4. Start the dev server (Vite middleware + Express) on http://localhost:3000
npm run dev
```

> The app runs in **demo/fallback mode** without credentials — routes
> return seeded demo data — so you can explore the UI before configuring
> Supabase/Gemini.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run lint` | Type-check (`tsc --noEmit`) |
| `npm test` | Run the Vitest suite |
| `npm run build` | Production build → `dist/` (frontend + server bundle) |
| `npm start` | Run the production server (`node dist/server.cjs`) |
| `npm run db:seed` | Seed the database (requires `DATABASE_URL`) |

## Production / Docker

```bash
# Build and run the containerized app on http://localhost:3000
docker compose up --build
```

The Dockerfile uses a multi-stage build: install + `vite build` + `esbuild`
server bundle + `prisma generate` in a build stage, then a slim production
image serving `dist/server.cjs`.

## Project Layout

- `server.ts` — Express app and all REST routes.
- `server/` — `prisma.ts`, `supabaseAdmin.ts`, `supabaseUser.ts` (null-safe
  database/auth helpers).
- `src/` — React frontend (`main.tsx`, `App.tsx`) and the food database.
- `prisma/` — `schema.prisma`, SQL migration, and seed script.
- `supabase_schema.sql` — Canonical Supabase Postgres schema (RLS + triggers).

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR:
install → `prisma generate` → lint → test → build. All gates must pass.

