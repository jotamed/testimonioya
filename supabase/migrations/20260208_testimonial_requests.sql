-- Testimonial requests tracking
CREATE TABLE IF NOT EXISTS testimonial_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'link')),
  recipient TEXT, -- email or phone, null for link
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_testimonial_requests_business ON testimonial_requests(business_id);

-- RLS
ALTER TABLE testimonial_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own business requests"
  ON testimonial_requests FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own business requests"
  ON testimonial_requests FOR INSERT
  WITH CHECK (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));
