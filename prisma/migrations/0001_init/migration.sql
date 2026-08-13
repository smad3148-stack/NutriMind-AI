-- NutriMind-AI initial migration
-- Creates the Prisma-managed tables that mirror supabase_schema.sql.
-- These tables back the admin console (feature flags, plugins, OTA,
-- revenue, system logs) used by server.ts when DATABASE_URL is configured.

-- 1. Feature flags
CREATE TABLE IF NOT EXISTS "feature_flags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "feature_flags_key_key" ON "feature_flags"("key");

-- 2. System logs (diagnostics/audit trail)
CREATE TABLE IF NOT EXISTS "system_logs" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- 3. System plugins (marketplace / installed modules)
CREATE TABLE IF NOT EXISTS "system_plugins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "category" TEXT NOT NULL,
    "is_installed" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT,
    "dependencies" TEXT,
    "author" TEXT,
    "rating" DOUBLE PRECISION,
    "install_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "system_plugins_pkey" PRIMARY KEY ("id")
);

-- 4. OTA updates (published app bundles)
CREATE TABLE IF NOT EXISTS "ota_updates" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "description" TEXT,
    "bundle_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deployed_at" TIMESTAMP(3),
    CONSTRAINT "ota_updates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ota_updates_version_key" ON "ota_updates"("version");

-- 5. OTA deployments (per deploy/rollback event)
CREATE TABLE IF NOT EXISTS "ota_deployments" (
    "id" TEXT NOT NULL,
    "ota_update_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "deployed_by" TEXT,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ota_deployments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ota_deployments_ota_update_id_fkey"
        FOREIGN KEY ("ota_update_id") REFERENCES "ota_updates"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "ota_deployments_ota_update_id_idx" ON "ota_deployments"("ota_update_id");

-- 6. Revenue metrics (MRR/ARR snapshot)
CREATE TABLE IF NOT EXISTS "revenue_metrics" (
    "id" TEXT NOT NULL,
    "mrr" DECIMAL(65,30) NOT NULL,
    "arr" DECIMAL(65,30) NOT NULL,
    "active_subscribers" INTEGER NOT NULL,
    "conversion_rate" DECIMAL(65,30) NOT NULL,
    CONSTRAINT "revenue_metrics_pkey" PRIMARY KEY ("id")
);

-- 7. Revenue by month
CREATE TABLE IF NOT EXISTS "revenue_by_month" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "target" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "revenue_by_month_pkey" PRIMARY KEY ("id")
);

-- 8. Transactions
CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- Seed default feature flags referenced by server.ts fallbacks.
INSERT INTO "feature_flags" ("id", "name", "key", "description", "enabled") VALUES
    (gen_random_uuid(), 'AI Meal Scanner', 'enableMealScanner', 'Real-time camera meal ingestion', true),
    (gen_random_uuid(), 'Family Sharing', 'enableFamilySharing', 'Biometrics sharing across circles', true),
    (gen_random_uuid(), 'Premium Coach', 'enablePremiumCoach', 'NutriChat AI coach', true)
ON CONFLICT ("key") DO NOTHING;
