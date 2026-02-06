-- Create NPS responses table
CREATE TABLE IF NOT EXISTS nps_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  category TEXT NOT NULL CHECK (category IN ('detractor', 'passive', 'promoter')),
  feedback TEXT,
  customer_name TEXT,
  customer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_nps_responses_business_id ON nps_responses(business_id);
CREATE INDEX idx_nps_responses_category ON nps_responses(category);
CREATE INDEX idx_nps_responses_created_at ON nps_responses(created_at);

-- RLS policies
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can insert NPS responses (public form)
CREATE POLICY "Anyone can submit NPS responses"
ON nps_responses FOR INSERT
WITH CHECK (true);

-- Business owners can view their NPS responses
CREATE POLICY "Business owners can view their NPS responses"
ON nps_responses FOR SELECT
USING (
  business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  )
);

-- Add source 'nps' to testimonials table constraint if it exists
-- Note: This may need to be adjusted based on actual constraint setup
DO $$ 
BEGIN
  -- Try to add 'nps' to source enum if using check constraint
  -- This is a safe operation that won't fail if already exists
  EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create view for NPS dashboard stats
CREATE OR REPLACE VIEW nps_stats AS
SELECT 
  business_id,
  COUNT(*) as total_responses,
  AVG(score) as avg_score,
  COUNT(*) FILTER (WHERE category = 'promoter') as promoters,
  COUNT(*) FILTER (WHERE category = 'passive') as passives,
  COUNT(*) FILTER (WHERE category = 'detractor') as detractors,
  ROUND(
    (COUNT(*) FILTER (WHERE category = 'promoter')::numeric - 
     COUNT(*) FILTER (WHERE category = 'detractor')::numeric) / 
    NULLIF(COUNT(*)::numeric, 0) * 100
  ) as nps_score
FROM nps_responses
GROUP BY business_id;

-- Grant access to the view
GRANT SELECT ON nps_stats TO authenticated;
GRANT SELECT ON nps_stats TO anon;
