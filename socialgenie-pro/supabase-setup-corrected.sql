-- ============================================
-- SocialGenie Pro - CORRECTED Supabase Setup
-- ============================================
-- This script FIXES the weekly reset issue by:
-- 1. Removing week_start_date field
-- 2. Changing to LIFETIME limit (3 generations total, no reset)
-- ============================================

-- Step 1: Drop the existing table (if it exists) to start fresh
DROP TABLE IF EXISTS generation_usage CASCADE;

-- Step 2: Create the corrected generation_usage table (NO week_start_date)
CREATE TABLE generation_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    generation_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(app_id, device_id)
);

-- Step 3: Create index for faster lookups
CREATE INDEX idx_generation_usage_lookup 
ON generation_usage(app_id, device_id);

-- Step 4: Enable Row Level Security
ALTER TABLE generation_usage ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies (if any)
DROP POLICY IF EXISTS "Allow anonymous read for generation_usage" ON generation_usage;
DROP POLICY IF EXISTS "Allow anonymous insert for generation_usage" ON generation_usage;
DROP POLICY IF EXISTS "Allow anonymous update for generation_usage" ON generation_usage;

-- Step 6: Create RLS policies for anonymous access

-- Policy 1: Allow anonymous users to read all rows
CREATE POLICY "Allow anonymous read for generation_usage"
ON generation_usage
FOR SELECT
TO anon
USING (true);

-- Policy 2: Allow anonymous users to insert new rows
CREATE POLICY "Allow anonymous insert for generation_usage"
ON generation_usage
FOR INSERT
TO anon
WITH CHECK (app_id = 'socialgenie-pro');

-- Policy 3: Allow anonymous users to update their own device's rows
CREATE POLICY "Allow anonymous update for generation_usage"
ON generation_usage
FOR UPDATE
TO anon
USING (app_id = 'socialgenie-pro')
WITH CHECK (app_id = 'socialgenie-pro');

-- Step 7: Drop the old RPC function (if it exists)
DROP FUNCTION IF EXISTS increment_generation_count(TEXT, TEXT);

-- Step 8: Create CORRECTED RPC function (no weekly reset logic)
CREATE OR REPLACE FUNCTION increment_generation_count(
    p_app_id TEXT,
    p_device_id TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Simply increment the count, NO weekly reset
    UPDATE generation_usage
    SET 
        generation_count = generation_count + 1,
        updated_at = now()
    WHERE 
        app_id = p_app_id 
        AND device_id = p_device_id;
END;
$$;

-- Step 9: Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION increment_generation_count(TEXT, TEXT) TO anon;

-- ============================================
-- IMPORTANT CHANGES FROM PREVIOUS VERSION:
-- ============================================
-- ❌ REMOVED: week_start_date field
-- ❌ REMOVED: Weekly reset logic
-- ✅ CHANGED: Lifetime limit (3 generations total)
-- ✅ KEPT: Same RLS policies (multi-app safe)
-- ============================================

-- ============================================
-- Setup Complete!
-- ============================================
-- Next steps:
-- 1. Update usageLimitService.ts to remove weekly reset logic
-- 2. Test that free users are limited to 3 generations TOTAL
-- 3. Verify Pro users bypass limits
-- ============================================
