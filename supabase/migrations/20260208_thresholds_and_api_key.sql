-- Add configurable Google Reviews thresholds and API key
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_reviews_nps_threshold INTEGER DEFAULT 9;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_reviews_star_threshold INTEGER DEFAULT 4;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE;
