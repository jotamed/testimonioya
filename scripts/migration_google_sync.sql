-- Migration: Google Reviews auto-sync
-- Adds google_place_id to businesses for automatic review import

-- Add columns for Google Places integration
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_place_id TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS reviews_last_synced TIMESTAMPTZ;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS reviews_auto_sync BOOLEAN DEFAULT false;

-- Add external_id to track duplicates
ALTER TABLE external_reviews ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Unique constraint to prevent duplicate imports
CREATE UNIQUE INDEX IF NOT EXISTS idx_external_reviews_external_id 
  ON external_reviews(business_id, platform, external_id) 
  WHERE external_id IS NOT NULL;
