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
  description: string | null
  welcome_message: string
  /** @deprecated Plan is now stored at user level in profiles table. Use useUserPlan() hook instead. */
  plan?: 'free' | 'pro' | 'business'
  testimonials_count: number
  allow_audio_testimonials: boolean
  allow_video_testimonials?: boolean
  // NPS Settings
  nps_delay_hours?: number
  nps_reminder_days?: number
  nps_auto_send?: boolean
  // Email Settings
  email_from_name?: string
  email_reply_to?: string
  // Branding
  custom_domain?: string
  // Google Reviews & i18n
  google_reviews_url?: string
  google_reviews_nps_threshold?: number
  google_reviews_star_threshold?: number
  default_language?: string
  // API
  api_key?: string
  // Flow toggles
  use_unified_flow?: boolean
  use_recovery_flow?: boolean
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
  source: 'whatsapp' | 'form' | 'manual' | 'nps'
  created_at: string
}

export type NpsResponse = {
  id: string
  business_id: string
  score: number
  category: 'detractor' | 'passive' | 'promoter'
  feedback: string | null
  customer_name: string | null
  customer_email: string | null
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

export type UnifiedLink = {
  id: string
  business_id: string
  slug: string
  name: string
  is_active: boolean
  views_count: number
  nps_threshold_promoter: number
  nps_threshold_passive: number
  ask_google_review: boolean
  google_reviews_url: string | null
  created_at: string
}

export type RecoveryMessage = {
  role: 'customer' | 'business'
  text: string
  created_at: string
}

export type RecoveryCase = {
  id: string
  business_id: string
  nps_response_id: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  customer_name: string | null
  customer_email: string | null
  messages: RecoveryMessage[]
  resolved_score: number | null
  created_at: string
  updated_at: string
}
