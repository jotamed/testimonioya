import { supabase } from './supabase'

type EmailType = 'welcome' | 'new_testimonial' | 'nps_received'

const SUPABASE_URL = 'https://wnmfanhejnrtfccemlai.supabase.co'
const DASHBOARD_URL = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : ''

// Check notification preferences before sending
async function isNotificationEnabled(type: EmailType): Promise<boolean> {
  if (type === 'welcome') return true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return true

    const { data: business } = await supabase
      .from('businesses')
      .select('notify_new_testimonial, notify_nps_response')
      .eq('user_id', user.id)
      .single()

    if (!business) return true

    if (type === 'new_testimonial') return business.notify_new_testimonial !== false
    if (type === 'nps_received') return business.notify_nps_response !== false
  } catch {
    // Default to sending if check fails
  }
  return true
}

export async function sendEmail(type: EmailType, to: string, data: Record<string, any>) {
  try {
    // Check preference before sending
    if (!(await isNotificationEnabled(type))) {
      console.log(`Email ${type} skipped: notification disabled`)
      return { skipped: true }
    }

    const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubWZhbmhlam5ydGZjY2VtbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY5NjMsImV4cCI6MjA4NTgwMjk2M30.bhTUh5Ks9nWjuMF4qK0og7gVuw7vlMZeaNGi5NJ0crc'

    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        type,
        to,
        data: { ...data, dashboard_url: DASHBOARD_URL },
      }),
    })

    const result = await response.json()
    if (result.error) {
      console.warn('Email send failed (non-blocking):', result.error)
    }
    return result
  } catch (error) {
    console.warn('Email send error (non-blocking):', error)
  }
}

export async function sendWelcomeEmail(email: string, businessName: string) {
  return sendEmail('welcome', email, { business_name: businessName })
}

export async function sendNewTestimonialEmail(
  ownerEmail: string,
  businessName: string,
  testimonial: {
    customer_name: string
    rating: number
    text_content: string
    source: string
  }
) {
  return sendEmail('new_testimonial', ownerEmail, {
    business_name: businessName,
    ...testimonial,
  })
}

export async function sendNpsReceivedEmail(
  ownerEmail: string,
  data: {
    score: number
    category: string
    feedback?: string
    customer_name?: string
  }
) {
  return sendEmail('nps_received', ownerEmail, data)
}
