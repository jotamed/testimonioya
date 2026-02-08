-- Notification preferences for businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notify_new_testimonial BOOLEAN DEFAULT true;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notify_nps_response BOOLEAN DEFAULT true;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notify_weekly_digest BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notify_monthly_report BOOLEAN DEFAULT false;
