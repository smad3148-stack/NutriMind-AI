-- NutriMind-AI migration 0002: admin roles (P0-01)
-- Mirrors public.user_roles from supabase_schema.sql. No FK is declared to
-- auth.users here (Prisma models in this repo do not model auth.users
-- relations); the canonical FK lives in supabase_schema.sql.

CREATE TABLE "user_roles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles"("user_id", "role");
