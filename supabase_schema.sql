-- 
-- NutriMind AI - Production PostgreSQL Database Schema for Supabase
-- This schema establishes tables, foreign keys, row-level security (RLS), and custom triggers.
-- Run this script inside your Supabase SQL Editor.
-- 

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FEATURE FLAGS TABLE
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    key VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. PLUGINS TABLE (System Modules)
CREATE TABLE IF NOT EXISTS public.system_plugins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'inactive')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('integrations', 'ai', 'analytics', 'core')),
    is_installed BOOLEAN NOT NULL DEFAULT TRUE,
    permissions TEXT,
    dependencies TEXT,
    author VARCHAR(255) DEFAULT 'NutriMind Core',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    install_count INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. REVENUE SUMMARY TABLE (Admin Analytics)
CREATE TABLE IF NOT EXISTS public.revenue_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mrr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    arr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    active_subscribers INT NOT NULL DEFAULT 0,
    conversion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. MONTHLY REVENUE PROGRESSION
CREATE TABLE IF NOT EXISTS public.revenue_by_month (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month VARCHAR(20) NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    target NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. PREMIUM TRANSACTIONS LEDGER (Webhook updates)
CREATE TABLE IF NOT EXISTS public.transactions (
    id VARCHAR(100) PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    plan VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'pending', 'failed')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. SYSTEM AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warn', 'error')),
    service VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 7. CUSTOMER PROFILES / USERS MAPPING
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    daily_calorie_goal INTEGER DEFAULT 2000,
    water_goal_ml INTEGER DEFAULT 2000,
    avatar_emoji VARCHAR(10) DEFAULT '👤',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 8. MEALS TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    calories INTEGER NOT NULL,
    protein NUMERIC(6, 2) DEFAULT 0.00,
    carbs NUMERIC(6, 2) DEFAULT 0.00,
    fat NUMERIC(6, 2) DEFAULT 0.00,
    score INTEGER NOT NULL DEFAULT 80 CHECK (score BETWEEN 1 AND 100),
    category VARCHAR(50) NOT NULL CHECK (category IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    image_url TEXT,
    analysis TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 9. FAMILY MODE METRICS (Circle sharing)
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    daily_calorie_goal INTEGER DEFAULT 2000,
    calories_consumed INTEGER DEFAULT 0,
    water_goal_ml INTEGER DEFAULT 2000,
    water_consumed_ml INTEGER DEFAULT 0,
    avatar_url VARCHAR(10) DEFAULT '👤',
    status_message VARCHAR(255) DEFAULT 'Ready to log healthy meals!',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 10. WEARABLES BIOMETRIC CONNECTOR
CREATE TABLE IF NOT EXISTS public.wearables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device VARCHAR(50) NOT NULL CHECK (device IN ('Apple Watch', 'Fitbit', 'Garmin')),
    connected BOOLEAN DEFAULT FALSE,
    heart_rate_bpm INTEGER DEFAULT 0,
    steps INTEGER DEFAULT 0,
    calories_burned INTEGER DEFAULT 0,
    sleep_hours NUMERIC(4, 2) DEFAULT 0.00,
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, device)
);


-- ======================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ======================================================================

-- Enable RLS on user-specific tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearables ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 2. Meals Policies
CREATE POLICY "Users can view their own tracked meals" 
    ON public.meals FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meals" 
    ON public.meals FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals" 
    ON public.meals FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals" 
    ON public.meals FOR DELETE 
    USING (auth.uid() = user_id);

-- 3. Family Members Policies
CREATE POLICY "Users can view family members in their circle" 
    ON public.family_members FOR SELECT 
    USING (auth.uid() = parent_user_id);

CREATE POLICY "Users can manage family members" 
    ON public.family_members FOR ALL 
    USING (auth.uid() = parent_user_id);

-- 4. Wearables Policies
CREATE POLICY "Users can view their paired wearables" 
    ON public.wearables FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their wearables" 
    ON public.wearables FOR ALL 
    USING (auth.uid() = user_id);


-- ======================================================================
-- SEED INITIAL SYSTEM DATA (For Feature Flags, Plugins, and Revenue)
-- ======================================================================

INSERT INTO public.feature_flags (name, key, description, enabled) VALUES
('AI Meal Scanner v2.5', 'enableMealScanner', 'Enables real-time camera ingestion and instant nutritional breakdown via Gemini API', TRUE),
('Enterprise Family Mode', 'enableFamilySharing', 'Allows real-time calorie tracking and nutrition telemetry sharing across family accounts', TRUE),
('Premium Coach Mode', 'enablePremiumCoach', 'Activates high-performance proactive clinical advice through voice and chat', TRUE),
('Wearables Live Telemetry Sync', 'enableWearableAutoSync', 'Streams continuous step, heart rate, and caloric burn updates automatically', TRUE)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.system_plugins (name, description, version, status, category) VALUES
('Apple HealthKit Ingestor', 'Synchronizes active calorie burn, resting heart rate, and sleep state data.', '1.2.4', 'active', 'integrations'),
('Fitbit Cloud Connector', 'Imports daily activity and food logs securely from Fitbit personal cloud APIs.', '2.1.0', 'inactive', 'integrations'),
('Gemini Nutritional Vision', 'Powers instant visual plate auditing and micro-nutrients segmentation.', '3.5.0', 'active', 'ai'),
('Stripe Billing Bridge', 'Manages recurring monthly subscriptions and premium coach transactions.', '1.10.2', 'active', 'core'),
('Deep Performance Diagnostics', 'Exposes telemetry logs and system throughput statistics for administration.', '1.0.1', 'active', 'analytics');

INSERT INTO public.revenue_metrics (mrr, arr, active_subscribers, conversion_rate) VALUES
(14850.00, 178200.00, 1240, 4.80);

INSERT INTO public.revenue_by_month (month, amount, target) VALUES
('Feb', 9200.00, 8000.00),
('Mar', 10400.00, 9500.00),
('Apr', 11800.00, 11000.00),
('May', 12500.00, 12000.00),
('Jun', 13900.00, 13000.00),
('Jul', 14850.00, 14000.00)
ON CONFLICT (month) DO NOTHING;

INSERT INTO public.transactions (id, user_email, plan, amount, status, timestamp) VALUES
('tx104', 'ecovisionfilm@gmail.com', 'Premium Monthly', 14.99, 'success', NOW() - INTERVAL '15 minutes'),
('tx103', 'sarah.jones@example.com', 'Family Plan Annual', 149.99, 'success', NOW() - INTERVAL '2 hours'),
('tx102', 'marcus.fit@example.com', 'Pro Coach Addon', 49.99, 'success', NOW() - INTERVAL '6 hours'),
('tx101', 'john.smith@example.com', 'Premium Monthly', 14.99, 'failed', NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_logs (level, service, message) VALUES
('info', 'API_GATEWAY', 'NutriMind AI real PostgreSQL server microservices online'),
('info', 'AI_COACH', 'Gemini Client initialized successfully for direct queries'),
('info', 'WEARABLE_BRIDGE', 'Apple HealthKit integration established securely with RLS validation');

-- Trigger to auto-create user profile when a new user signs up via Supabase auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_emoji)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'NutriMind Athlete'),
    '👤'
  );
  
  -- Create default wearable bridges for user
  INSERT INTO public.wearables (user_id, device, connected) VALUES
  (new.id, 'Apple Watch', FALSE),
  (new.id, 'Fitbit', FALSE),
  (new.id, 'Garmin', FALSE);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ======================================================================
-- 11. SUPABASE STORAGE BUCKETS & RLS POLICIES
-- ======================================================================

-- Create the "meal-scans" storage bucket if it does not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meal-scans',
  'meal-scans',
  false, -- private bucket for ultimate user privacy
  10485760, -- 10MB limit
  '{"image/jpeg", "image/png", "image/gif", "image/webp"}'
)
ON CONFLICT (id) DO NOTHING;

-- Note: The following ALTER TABLE and storage.objects policies are configured to resolve RLS violations.
-- You can configure these policies in the Supabase Dashboard under Storage > Policies, or run them in the Supabase SQL Editor:

-- 1. Policy for INSERT: Users can upload their own files under /{user_id}/meal-scans/{filename}, and guests can upload under /guest-user/meal-scans/{filename}
CREATE POLICY "Users and guests can upload meal-scans"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'meal-scans' AND 
  (
    (auth.uid() IS NOT NULL AND auth.uid()::text = split_part(name, '/', 1)) OR
    (split_part(name, '/', 1) = 'guest-user')
  ) AND
  split_part(name, '/', 2) = 'meal-scans'
);

-- 2. Policy for SELECT: Users can view their own files, or guest-user files
CREATE POLICY "Users and guests can view meal-scans"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'meal-scans' AND 
  (
    (auth.uid() IS NOT NULL AND auth.uid()::text = split_part(name, '/', 1)) OR
    (split_part(name, '/', 2) = 'guest-user')
  )
);

-- 3. Policy for UPDATE: Users can update their own files, or guest-user files
CREATE POLICY "Users and guests can update meal-scans"
ON storage.objects FOR UPDATE
TO public
USING (
  bucket_id = 'meal-scans' AND 
  (
    (auth.uid() IS NOT NULL AND auth.uid()::text = split_part(name, '/', 1)) OR
    (split_part(name, '/', 1) = 'guest-user')
  )
);

-- 4. Policy for DELETE: Users can delete their own files, or guest-user files
CREATE POLICY "Users and guests can delete meal-scans"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'meal-scans' AND 
  (
    (auth.uid() IS NOT NULL AND auth.uid()::text = split_part(name, '/', 1)) OR
    (split_part(name, '/', 1) = 'guest-user')
  )
);


-- ======================================================================
-- 12. ENTERPRISE OTA UPDATES & DEPLOYMENTS
-- ======================================================================

CREATE TABLE IF NOT EXISTS public.ota_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(50) NOT NULL UNIQUE,
    channel VARCHAR(50) NOT NULL, -- 'development', 'beta', 'staging', 'production'
    description TEXT,
    bundle_url TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'published', -- 'published', 'retracted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.ota_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ota_update_id UUID REFERENCES public.ota_updates(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'deploy', 'rollback'
    deployed_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'success', 'failed'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ======================================================================
-- 13. ADMIN ROLES (user_roles) — P0-01 Admin Authentication & Authorization
-- ======================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'clinician', 'support')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, role)
);

-- RLS: deny ALL direct access. Roles are read server-side only, via the
-- service-role client (which bypasses RLS) or Prisma (direct connection).
-- The anon key shipped in the client bundle must never be able to read roles.
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct access to user roles"
    ON public.user_roles FOR ALL
    USING (false) WITH CHECK (false);

-- Promote a user to admin (run once in the Supabase SQL editor):
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'ecovisionfilm@gmail.com'
-- ON CONFLICT (user_id, role) DO NOTHING;
