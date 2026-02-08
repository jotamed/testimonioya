import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM_EMAIL = 'TestimonioYa <hola@testimonioya.com>'
const APP_URL = 'https://testimonioya.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

function reviewRequestEmail(businessName: string, customerName: string, formUrl: string, brandColor: string): { subject: string; html: string } {
  return {
    subject: `${businessName} - ¡Nos encantaría conocer tu opinión! ⭐`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: ${brandColor}; font-size: 28px; margin: 0;">${businessName}</h1>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">⭐</div>
          <h2 style="color: #111827; font-size: 24px; margin: 0 0 12px 0;">
            ¡Hola${customerName ? `, ${customerName}` : ''}!
          </h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            ¡Gracias por elegirnos! Tu opinión es muy importante para nosotros.
            ¿Nos dedicarías un minuto para contarnos tu experiencia?
          </p>
          
          <a href="${formUrl}" 
             style="display: inline-block; background: ${brandColor}; color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 18px; transition: opacity 0.2s;">
            Dejar mi opinión →
          </a>
          
          <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
            Solo te tomará un minuto. ¡Cada opinión cuenta!
          </p>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <p style="color: #d1d5db; font-size: 11px;">
            Enviado por ${businessName} a través de <a href="${APP_URL}" style="color: #6366f1; text-decoration: none;">TestimonioYa</a>
          </p>
        </div>
      </div>
    `,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Authenticate by API key
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing x-api-key header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Look up business by API key
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, business_name, slug, brand_color')
      .eq('api_key', apiKey)
      .single()

    if (bizError || !business) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { customer_email, customer_name, delay_hours } = await req.json()

    if (!customer_email) {
      return new Response(
        JSON.stringify({ error: 'customer_email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For now, delay_hours is accepted but ignored (future: scheduled sending)
    const _ = delay_hours

    // Build the form URL — use the first collection link or the NPS form
    const { data: links } = await supabase
      .from('collection_links')
      .select('slug')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .limit(1)

    const formUrl = links && links.length > 0
      ? `${APP_URL}/t/${links[0].slug}`
      : `${APP_URL}/nps/${business.slug}`

    // Send email
    if (!RESEND_API_KEY) {
      throw new Error('Email service not configured')
    }

    const email = reviewRequestEmail(
      business.business_name,
      customer_name || '',
      formUrl,
      business.brand_color || '#4f46e5'
    )

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [customer_email],
        subject: email.subject,
        html: email.html,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || 'Failed to send email')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: result.id,
        form_url: formUrl,
        message: `Review request sent to ${customer_email}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Trigger review error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
