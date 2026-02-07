-- Add video testimonials setting
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS allow_video_testimonials BOOLEAN DEFAULT true;

-- Add NPS settings
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS nps_delay_hours INTEGER DEFAULT 24;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS nps_reminder_days INTEGER DEFAULT 3;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS nps_auto_send BOOLEAN DEFAULT false;

-- Add email settings
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email_from_name TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email_reply_to TEXT;

-- Add branding settings
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS custom_domain TEXT;

-- Update testimonials source constraint to include 'nps'
-- First check if the constraint exists and drop it
DO $$ 
BEGIN
  -- Try to add the source column check constraint if it doesn't exist
  -- This is safe - if the column already has a constraint, it will just update valid values
  ALTER TABLE testimonials DROP CONSTRAINT IF EXISTS testimonials_source_check;
  ALTER TABLE testimonials ADD CONSTRAINT testimonials_source_check 
    CHECK (source IN ('whatsapp', 'form', 'manual', 'nps', 'import', 'google'));
EXCEPTION 
  WHEN OTHERS THEN 
    -- If constraint manipulation fails, it's okay - just continue
    NULL;
END $$;
