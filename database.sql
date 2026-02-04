-- TestimonioYa Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  website TEXT,
  logo_url TEXT,
  brand_color TEXT DEFAULT '#4f46e5',
  welcome_message TEXT DEFAULT '¡Gracias por tu tiempo! Tu opinión es muy importante para nosotros.',
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  testimonials_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  text_content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured BOOLEAN DEFAULT FALSE,
  source TEXT NOT NULL DEFAULT 'form' CHECK (source IN ('whatsapp', 'form', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection links table
CREATE TABLE IF NOT EXISTS collection_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  campaign_type TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  submissions_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_testimonials_business_id ON testimonials(business_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_collection_links_business_id ON collection_links(business_id);
CREATE INDEX IF NOT EXISTS idx_collection_links_slug ON collection_links(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
CREATE POLICY "Users can view their own businesses"
  ON businesses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own businesses"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own businesses"
  ON businesses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own businesses"
  ON businesses FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for testimonials
CREATE POLICY "Business owners can view their testimonials"
  ON testimonials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = testimonials.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Business owners can update their testimonials"
  ON testimonials FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = testimonials.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can delete their testimonials"
  ON testimonials FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = testimonials.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- RLS Policies for collection_links
CREATE POLICY "Business owners can view their collection links"
  ON collection_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = collection_links.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can insert collection links"
  ON collection_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = collection_links.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update their collection links"
  ON collection_links FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = collection_links.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can delete their collection links"
  ON collection_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = collection_links.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Public policies for viewing approved testimonials
CREATE POLICY "Anyone can view approved testimonials"
  ON testimonials FOR SELECT
  USING (status = 'approved');

-- Function to update testimonials count
CREATE OR REPLACE FUNCTION update_testimonials_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE businesses
    SET testimonials_count = testimonials_count + 1
    WHERE id = NEW.business_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
    UPDATE businesses
    SET testimonials_count = testimonials_count + 1
    WHERE id = NEW.business_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE businesses
    SET testimonials_count = testimonials_count - 1
    WHERE id = NEW.business_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE businesses
    SET testimonials_count = testimonials_count - 1
    WHERE id = OLD.business_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update testimonials count
CREATE TRIGGER testimonials_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON testimonials
FOR EACH ROW
EXECUTE FUNCTION update_testimonials_count();
