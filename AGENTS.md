# AGENTS.md — NutriMind-AI

Repository memory and agent operating guide for NutriMind-AI.

## Project overview
NutriMind-AI is an AI health & nutrition platform: an Express + Vite server
(`server.ts`, ~3200 lines) exposing REST APIs (meals, AI coach chat, family,
wearables, admin console: feature flags, plugins, OTA, revenue) and a React
frontend (`src/`). It uses Supabase (Postgres + Auth) and Google Gemini, and
falls back to in-memory demo data when no credentials are configured.

## Critical history note
The original `server.ts` committed the entry point but NOT the `./server/*`
and `./src/*` modules it imports. This repo was rebuilt from scratch on the
`rebuild-missing-architecture` branch to recreate that missing architecture.
Do not assume earlier "production-hardening" commits exist — they did not.

## Architecture

```
server.ts                         # Express app + all routes (inline)
├── server/supabaseAdmin.ts       # getSupabaseAdmin() — service-role client | null
├── server/supabaseUser.ts       # requireUserAuth middleware, AuthenticatedRequest
├── server/prisma.ts              # getPrisma() singleton | null, handlePrismaError
src/
├── types.ts                      # ChatMessage, FoodItem, FoodDatabase
├── food_database.json            # keyed food nutrition DB
├── main.tsx, App.tsx, index.css  # React frontend (Vite entry)
prisma/
├── schema.prisma                 # 8 models mirroring supabase_schema.sql
├── migrations/0001_init/        # SQL migration
└── seed.ts                       # idempotent seed (npm run db:seed)
```

## Key design conventions
- **Null-safe DB helpers**: `getPrisma()` and `getSupabaseAdmin()` return
  `null` when credentials are absent/placeholder so routes fall through to
  in-memory fallbacks. NEVER make these throw on missing config.
- **Permissive auth**: `requireUserAuth` never rejects; it attaches a demo
  user + anon client (or null). Routes use `req.user?.id` and
  `req.supabaseUserClient` defensively.
- **Food DB contract**: each portion needs `label`, `calories`, `protein`,
  `carbs`, `fat` (server.ts reads `portionData.label`).

## Commands
| Command | Purpose |
|---|---|
| `npm run dev` | Run dev server (tsx) on :3000 with Vite middleware |
| `npm run lint` | `tsc --noEmit` (type-check; CI gate) |
| `npm test` | Vitest suite (15 tests, real code paths) |
| `npm run build` | `vite build` + `esbuild` server bundle → `dist/` |
| `npm start` | `node dist/server.cjs` (production runtime) |
| `npm run db:seed` | Seed the DB (requires DATABASE_URL) |
| `npx prisma generate` | Regenerate Prisma client (after schema change) |
| `docker compose up --build` | Containerized build + run |

## CI
`.github/workflows/ci.yml`: install → `prisma generate` → lint → test → build.
All four gates must pass. Build artifacts are uploaded.

## Environment
See `.env.example` for all vars. Required for full functionality:
`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`. Without them the app runs in
demo/fallback mode (meals, flags, etc. return seeded demo data).

## Testing guidelines
- Tests must exercise real code paths (no mocks of module logic). Use
  `vi.resetModules()` + env mutation to test singleton branching.
- The Vitest config covers `server/**/*.test.ts` and `src/**/*.test.ts`.
- `tsc --noEmit` also type-checks test files.

## Git & PR conventions
- Never push directly to `main`. Work on a feature branch + PR.
- Branch for this rebuild: `rebuild-missing-architecture` → PR #1.
- Commits are co-authored: `Co-authored-by: openhands <openhands@all-hands.dev>`.
