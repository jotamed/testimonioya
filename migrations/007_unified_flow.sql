-- Migration 007: Unified NPS→Testimonial Flow + Recovery Flow
-- Date: 2026-02-11
-- Description: Adds unified_links and recovery_cases tables for Pro+ plans

-- Table: unified_links
-- Stores configuration for unified NPS→Testimonial flow links
CREATE TABLE IF NOT EXISTS unified_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Enlace principal',
  is_active BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  
  -- Config
  nps_threshold_promoter INTEGER DEFAULT 9, -- 9-10 = promotor
  nps_threshold_passive INTEGER DEFAULT 7,  -- 7-8 = pasivo
  ask_google_review BOOLEAN DEFAULT TRUE,
  google_reviews_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unified_links_business ON unified_links(business_id);
CREATE INDEX IF NOT EXISTS idx_unified_links_slug ON unified_links(slug);

ALTER TABLE unified_links ENABLE ROW LEVEL SECURITY;

-- RLS: Business owners manage unified links
CREATE POLICY "Business owners manage unified links"
  ON unified_links FOR ALL
  USING (EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = unified_links.business_id 
    AND businesses.user_id = auth.uid()
  ));

-- RLS: Public can view active unified links (for form)
CREATE POLICY "Anyone can view active unified links"
  ON unified_links FOR SELECT
  USING (is_active = TRUE);

-- Table: recovery_cases
-- Stores customer recovery cases for detractors (Business plan only)
CREATE TABLE IF NOT EXISTS recovery_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  nps_response_id UUID NOT NULL REFERENCES nps_responses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' 
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  customer_name TEXT,
  customer_email TEXT,
  
  -- Conversation: array of messages (simple, no table extra)
  -- Format: [{ role: 'customer'|'business', text: string, created_at: ISO }]
  messages JSONB NOT NULL DEFAULT '[]',
  
  -- If customer updates their score after resolution
  resolved_score INTEGER CHECK (resolved_score >= 0 AND resolved_score <= 10),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recovery_cases_business ON recovery_cases(business_id);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_status ON recovery_cases(business_id, status);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_nps ON recovery_cases(nps_response_id);

ALTER TABLE recovery_cases ENABLE ROW LEVEL SECURITY;

-- RLS: Only business owners can manage their recovery cases
CREATE POLICY "Business owners manage recovery cases"
  ON recovery_cases FOR ALL
  USING (EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = recovery_cases.business_id 
    AND businesses.user_id = auth.uid()
  ));

-- Function: Update recovery_cases.updated_at on changes
CREATE OR REPLACE FUNCTION update_recovery_cases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recovery_cases_updated_at
  BEFORE UPDATE ON recovery_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_recovery_cases_updated_at();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 007 completed: unified_links and recovery_cases tables created';
END $$;
