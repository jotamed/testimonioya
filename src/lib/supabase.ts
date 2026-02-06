import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wnmfanhejnrtfccemlai.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubWZhbmhlam5ydGZjY2VtbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY5NjMsImV4cCI6MjA4NTgwMjk2M30.bhTUh5Ks9nWjuMF4qK0og7gVuw7vlMZeaNGi5NJ0crc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Business = {
  id: string
  user_id: string
  business_name: string
  slug: string
  industry: string | null
  website: string | null
  logo_url: string | null
  brand_color: string
  welcome_message: string
  plan: 'free' | 'pro' | 'premium'
  testimonials_count: number
  allow_audio_testimonials: boolean
  created_at: string
}

export type Testimonial = {
  id: string
  business_id: string
  customer_name: string
  customer_email: string | null
  text_content: string | null
  audio_url: string | null
  video_url: string | null
  rating: number
  status: 'pending' | 'approved' | 'rejected'
  is_featured: boolean
  source: 'whatsapp' | 'form' | 'manual'
  created_at: string
}

export type CollectionLink = {
  id: string
  business_id: string
  slug: string
  name: string
  campaign_type: string | null
  is_active: boolean
  views_count: number
  submissions_count: number
  created_at: string
}
