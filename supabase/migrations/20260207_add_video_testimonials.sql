-- Add video_url column to testimonials table
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Create video testimonials storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'video-testimonials',
  'video-testimonials',
  true,
  52428800, -- 50MB limit
  ARRAY['video/webm', 'video/mp4', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for video-testimonials bucket
CREATE POLICY "Anyone can upload video testimonials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'video-testimonials');

CREATE POLICY "Anyone can view video testimonials"
ON storage.objects FOR SELECT
USING (bucket_id = 'video-testimonials');

CREATE POLICY "Users can delete their video testimonials"
ON storage.objects FOR DELETE
USING (bucket_id = 'video-testimonials' AND auth.uid()::text = (storage.foldername(name))[1]);
