-- Add audio_url column to testimonials
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Make text_content nullable (can have audio only)
ALTER TABLE testimonials ALTER COLUMN text_content DROP NOT NULL;

-- Create storage bucket for audio testimonials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-testimonials',
  'audio-testimonials',
  true,
  10485760, -- 10MB limit
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Anyone can upload to audio-testimonials (public submission)
CREATE POLICY "Anyone can upload audio testimonials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio-testimonials');

-- Storage policy: Anyone can read audio testimonials (public playback)
CREATE POLICY "Anyone can read audio testimonials"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-testimonials');

-- Storage policy: Only authenticated users can delete their business's audio
CREATE POLICY "Users can delete their audio testimonials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'audio-testimonials' 
  AND auth.uid() IS NOT NULL
);
