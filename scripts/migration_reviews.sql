-- Migration: External Reviews feature
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS external_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'google', -- google, tripadvisor, facebook, manual
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date TIMESTAMPTZ,
  external_id TEXT, -- ID from the external platform
  reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_external_reviews_business ON external_reviews(business_id);
CREATE INDEX idx_external_reviews_platform ON external_reviews(business_id, platform);

-- RLS
ALTER TABLE external_reviews ENABLE ROW LEVEL SECURITY;

-- Owner can read their own reviews
CREATE POLICY "Users can view own business reviews"
  ON external_reviews FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Owner can insert reviews
CREATE POLICY "Users can insert own business reviews"
  ON external_reviews FOR INSERT
  WITH CHECK (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Owner can update (reply to) reviews
CREATE POLICY "Users can update own business reviews"
  ON external_reviews FOR UPDATE
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

-- Owner can delete reviews
CREATE POLICY "Users can delete own business reviews"
  ON external_reviews FOR DELETE
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));
