# AGENTS.md — NutriMind-AI

Repository memory and agent operating guide for NutriMind-AI.

## Project overview
NutriMind-AI is an AI health & nutrition platform: an Express + Vite server
(`server.ts`, ~3200 lines) exposing REST APIs (meals, AI coach chat, family,
wearables, admin console: feature flags, plugins, OTA, revenue) and a React
frontend (`src/`). It uses Supabase (Postgres + Auth) and Google Gemini, and
falls back to in-memory demo data when no credentials are configured.

## Restoration note (2026-08-18) — replaces the earlier "Critical history note"
On 2026-08-18 the repository was restored to the **complete application** as
part of roadmap P0-12 (repository integrity):

- `src/components/` (28 components), `src/lib/` (11 modules), `public/`,
  `src-tauri/`, `docs/`, `assets/` and the full 12-model `prisma/schema.prisma`
  were re-committed from `remix_-nutrimind-ai.zip` (the original deployment
  artifact, which had been committed to the repo but never extracted).
- The trimmed rebuild on branch `rebuild-missing-architecture` (PR #1) had
  shipped only `server.ts` + three `server/*` helpers + six `src/*` files + an
  8-model Prisma schema. Those six `src/*` files were replaced by the real
  versions; the three `server/*` helpers were kept (they are the current,
  test-covered implementation — see "Key design conventions").
- The `remix_-nutrimind-ai.zip` archive itself was removed from the repo (its
  content now lives in the tree). The `stitch_*` zip of prototype screens
  remains committed but is a design library, not part of the build.

Known remaining gaps (tracked in the roadmap, not yet fixed):
- Auth is still **permissive** (`requireUserAuth` never rejects) — P0-03.
- All `/api/admin/*` endpoints are **unauthenticated** — P0-01.
- Payments, wearables and telemetry are **simulated** — P0-05/P0-06.
- `prisma/migrations/0001_init` covers only the 8 admin tables; the schema has
  12 models (Profile/Meal/FamilyMember/Wearable are managed via
  `supabase_schema.sql` on Supabase) — regenerate the migration in P1.
- `docs/PRODUCTION_READINESS.md` contains a self-assessment (98/100) that does
  not match the codebase; treat it as aspirational, not factual.

## Architecture

```
server.ts                         # Express app + all routes (inline)
├── server/supabaseAdmin.ts       # getSupabaseAdmin() — service-role client | null
├── server/supabaseUser.ts       # requireUserAuth middleware, AuthenticatedRequest
├── server/prisma.ts              # getPrisma() singleton | null, handlePrismaError
src/
├── App.tsx                       # mode shell: auth | customer | admin
├── main.tsx, index.css, types.ts
├── components/                   # 28 React components
│   ├── CustomerCompanion.tsx     # main customer shell (7 tabs)
│   ├── AdminDashboard.tsx        # admin console (5 tabs: dashboard/ota/plugins/logs/admin_ai)
│   ├── SupabaseAuth.tsx          # auth UI (email+OTP, signup, reset)
│   ├── PremiumPanel.tsx          # plans/paywall UI
│   ├── CleanHomeDashboard.tsx, AIHub.tsx, LifeOsSecondBrain.tsx, ...
├── lib/                          # 11 client modules
│   ├── supabase.ts, platform.ts, chatStorage.ts, crashReporter.ts, ...
└── food_database.json            # 106-item Indian food nutrition DB (keyed)
public/
├── manifest.json                 # PWA manifest
└── service-worker.js             # PWA shell + cache (stale-while-revalidate)
src-tauri/
└── tauri.conf.json               # desktop shell config
docs/
└── PRODUCTION_READINESS.md       # ⚠ self-assessment; outdated claims (see note)
prisma/
├── schema.prisma                 # 12 models mirroring supabase_schema.sql
├── migrations/0001_init/        # SQL migration (admin tables only)
└── seed.ts                       # idempotent seed (npm run db:seed)
supabase_schema.sql               # Canonical Supabase Postgres schema (RLS + triggers)
```

## Key design conventions
- **Null-safe DB helpers**: `getPrisma()` and `getSupabaseAdmin()` return
  `null` when credentials are absent/placeholder so routes fall through to
  in-memory fallbacks. NEVER make these throw on missing config.
- **Permissive auth**: `requireUserAuth` never rejects; it attaches a demo user
  + anon client (or null). Routes use `req.user?.id` and
  `req.supabaseUserClient` defensively. ⚠ This is a known security gap (P0-03),
  do not extend it; keep behaviour unchanged until the P0 fixes are approved.
- **Simulated subsystems**: payments (`/api/payments/checkout`), wearable sync
  (hardcoded metrics), admin OTA/plugins (DB rows only) are prototypes. Do not
  build new features on them; the roadmap replaces them (P0-05/P0-06, P1).
- **Food DB contract**: each portion needs `label`, `calories`, `protein`,
  `carbs`, `fat` (server.ts reads `portionData.label`). Labels are display
  strings (e.g. "1 Pack", "100g"), not size identifiers.

## Commands
| Command | Purpose |
|---|---|
| `npm run dev` | Run dev server (tsx) on :3000 with Vite middleware |
| `npm run lint` | `tsc --noEmit` (type-check; CI gate) |
| `npm test` | Vitest suite (real code paths, env-mutation based) |
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
- Restoration branch: `p0-12-repo-integrity` (P0-12 of the roadmap).
- Commits are co-authored: `Co-authored-by: devv devv via Moxt <noreply@moxt.ai>`.
