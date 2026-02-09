-- =====================================================================
-- Migration: Move plan from businesses to user level (profiles table)
-- Date: 2026-02-09
-- Description: Move subscription plan from business level to user level
-- =====================================================================

-- Step 1: Add plan-related columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Create index for faster plan lookups
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription ON profiles(stripe_subscription_id);

-- Step 3: Migrate existing plan data from businesses to profiles
-- For each user, take the HIGHEST plan from their businesses
UPDATE profiles p
SET 
  plan = COALESCE(
    (
      SELECT 
        CASE 
          WHEN COUNT(*) FILTER (WHERE b.plan = 'premium') > 0 THEN 'premium'
          WHEN COUNT(*) FILTER (WHERE b.plan = 'pro') > 0 THEN 'pro'
          ELSE 'free'
        END
      FROM businesses b
      WHERE b.user_id = p.id
    ),
    'free'
  ),
  plan_updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM businesses b WHERE b.user_id = p.id
);

-- Step 4: Migrate Stripe subscription IDs (take from first business with subscription)
UPDATE profiles p
SET 
  stripe_subscription_id = (
    SELECT b.stripe_subscription_id
    FROM businesses b
    WHERE b.user_id = p.id 
      AND b.stripe_subscription_id IS NOT NULL
    LIMIT 1
  )
WHERE EXISTS (
  SELECT 1 FROM businesses b 
  WHERE b.user_id = p.id 
    AND b.stripe_subscription_id IS NOT NULL
);

-- Step 5: Comment on deprecated columns in businesses table
-- Keep the columns temporarily for rollback safety
COMMENT ON COLUMN businesses.plan IS 'DEPRECATED: Plan is now stored at user level in profiles.plan';
COMMENT ON COLUMN businesses.stripe_subscription_id IS 'DEPRECATED: Stripe subscription is now stored at user level in profiles.stripe_subscription_id';

-- Step 6: Update RLS policies for profiles
-- Allow users to read their own plan
CREATE POLICY IF NOT EXISTS "Users can view their own profile plan"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile plan"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Step 7: Create function to get user plan (helper for RLS and queries)
CREATE OR REPLACE FUNCTION get_user_plan(user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT plan FROM profiles WHERE id = user_id;
$$;

-- Step 8: Create trigger to update plan_updated_at automatically
CREATE OR REPLACE FUNCTION update_plan_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.plan_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_plan_timestamp ON profiles;
CREATE TRIGGER trigger_update_plan_timestamp
  BEFORE UPDATE OF plan ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_timestamp();

-- =====================================================================
-- ROLLBACK INSTRUCTIONS (if needed):
-- =====================================================================
-- To rollback this migration:
-- 
-- 1. Copy plan back from profiles to businesses:
--    UPDATE businesses b
--    SET plan = (SELECT plan FROM profiles p WHERE p.id = b.user_id)
--    WHERE user_id IS NOT NULL;
--
-- 2. Drop columns from profiles:
--    ALTER TABLE profiles 
--    DROP COLUMN plan,
--    DROP COLUMN stripe_customer_id,
--    DROP COLUMN stripe_subscription_id,
--    DROP COLUMN plan_updated_at;
--
-- 3. Drop indexes:
--    DROP INDEX IF EXISTS idx_profiles_plan;
--    DROP INDEX IF EXISTS idx_profiles_stripe_customer;
--    DROP INDEX IF EXISTS idx_profiles_stripe_subscription;
--
-- 4. Drop function and trigger:
--    DROP TRIGGER IF EXISTS trigger_update_plan_timestamp ON profiles;
--    DROP FUNCTION IF EXISTS update_plan_timestamp();
--    DROP FUNCTION IF EXISTS get_user_plan(UUID);
--
-- 5. Remove RLS policies:
--    DROP POLICY IF EXISTS "Users can view their own profile plan" ON profiles;
--    DROP POLICY IF EXISTS "Users can update their own profile plan" ON profiles;
-- =====================================================================
