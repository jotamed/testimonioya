import { supabase } from './supabase'

type EmailType = 'welcome' | 'new_testimonial' | 'nps_received'

const SUPABASE_URL = 'https://wnmfanhejnrtfccemlai.supabase.co'
const DASHBOARD_URL = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : ''

export async function sendEmail(type: EmailType, to: string, data: Record<string, any>) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
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
    // Email sending should never block the main flow
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
