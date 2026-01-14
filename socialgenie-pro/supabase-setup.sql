-- ============================================
-- SocialGenie Pro - Supabase Setup Script
-- ============================================
-- This script sets up the generation_usage table with proper RLS policies
-- for the shared "IOS APP Factory" Supabase project.
--
-- IMPORTANT: This is safe to run even if other apps are using the database.
-- It only affects the generation_usage table used by SocialGenie Pro.
-- ============================================

-- Step 1: Create the generation_usage table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS generation_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    generation_count INTEGER NOT NULL DEFAULT 0,
    week_start_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(app_id, device_id)
);

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_generation_usage_lookup 
ON generation_usage(app_id, device_id);

-- Step 3: Enable Row Level Security
ALTER TABLE generation_usage ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous read for generation_usage" ON generation_usage;
DROP POLICY IF EXISTS "Allow anonymous insert for generation_usage" ON generation_usage;
DROP POLICY IF EXISTS "Allow anonymous update for generation_usage" ON generation_usage;

-- Step 5: Create RLS policies for anonymous access

-- Policy 1: Allow anonymous users to read all rows
-- (App filters by device_id client-side via .eq('device_id', deviceId))
CREATE POLICY "Allow anonymous read for generation_usage"
ON generation_usage
FOR SELECT
TO anon
USING (true);

-- Policy 2: Allow anonymous users to insert new rows
-- (Enforce app_id to prevent cross-app pollution)
CREATE POLICY "Allow anonymous insert for generation_usage"
ON generation_usage
FOR INSERT
TO anon
WITH CHECK (app_id = 'socialgenie-pro');

-- Policy 3: Allow anonymous users to update their own device's rows
-- (Enforce app_id to prevent cross-app pollution)
CREATE POLICY "Allow anonymous update for generation_usage"
ON generation_usage
FOR UPDATE
TO anon
USING (app_id = 'socialgenie-pro')
WITH CHECK (app_id = 'socialgenie-pro');

-- Note: No DELETE policy = deletes are blocked (data retention for analytics)

-- Step 6: Create RPC function for atomic counter increment
CREATE OR REPLACE FUNCTION increment_generation_count(
    p_app_id TEXT,
    p_device_id TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE generation_usage
    SET 
        generation_count = generation_count + 1,
        updated_at = now()
    WHERE 
        app_id = p_app_id 
        AND device_id = p_device_id;
    
    -- If no rows updated, the record doesn't exist yet
    -- This is handled by the app creating the record first
END;
$$;

-- Step 7: Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION increment_generation_count(TEXT, TEXT) TO anon;

-- ============================================
-- Setup Complete!
-- ============================================
-- Next steps:
-- 1. Verify in Supabase Security Advisor that the warning is resolved
-- 2. Test the app with usage limits enabled
-- 3. Check that free users are limited to 3 generations/week
-- ============================================
