-- Admin RLS policies for TestimonioYa
-- Run this in Supabase SQL Editor to allow admin users to see all data

-- Admin emails list (must match src/lib/admin.ts)
-- We'll use a function to check admin status

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT email IN ('jotamedina@gmail.com', 'admin@testimonioya.com')
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow admins to view ALL businesses
CREATE POLICY "Admins can view all businesses"
  ON businesses FOR SELECT
  USING (is_admin());

-- Allow admins to update ALL businesses (for plan changes)
CREATE POLICY "Admins can update all businesses"
  ON businesses FOR UPDATE
  USING (is_admin());

-- Allow admins to view ALL testimonials
CREATE POLICY "Admins can view all testimonials"
  ON testimonials FOR SELECT
  USING (is_admin());

-- Allow admins to view ALL collection_links
CREATE POLICY "Admins can view all collection_links"
  ON collection_links FOR SELECT
  USING (is_admin());
