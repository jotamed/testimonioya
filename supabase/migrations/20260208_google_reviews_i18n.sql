-- Add Google Reviews URL and default language to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_reviews_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'es';
