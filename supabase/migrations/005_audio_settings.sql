-- Add audio testimonials setting to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS allow_audio_testimonials BOOLEAN DEFAULT true;

-- Add setting comment
COMMENT ON COLUMN businesses.allow_audio_testimonials IS 'Whether this business accepts audio testimonials';
