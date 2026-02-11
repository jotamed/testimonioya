import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM_EMAIL = 'TestimonioYa <hola@testimonioya.com>'
const APP_URL = 'https://testimonioya.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate HMAC token for customer recovery response
async function generateHmacToken(caseId: string, customerEmail: string): Promise<string> {
  const message = `${caseId}:${customerEmail}`
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const keyData = encoder.encode(SUPABASE_SERVICE_KEY)
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, data)
  const hashArray = Array.from(new Uint8Array(signature))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { case_id, message } = await req.json() as {
      case_id: string
      message: string
    }

    if (!case_id || !message?.trim()) {
      throw new Error('case_id and message are required')
    }

    // Get recovery case
    const { data: recoveryCase, error: caseError } = await supabase
      .from('recovery_cases')
      .select('*')
      .eq('id', case_id)
      .single()

    if (caseError || !recoveryCase) {
      throw new Error('Case not found')
    }

    // Verify ownership via business
    const { data: biz } = await supabase
      .from('businesses')
      .select('business_name, user_id')
      .eq('id', recoveryCase.business_id)
      .single()

    if (!biz || biz.user_id !== user.id) {
      throw new Error('Unauthorized - not your case')
    }

    // Check if case is closed
    if (recoveryCase.status === 'closed') {
      throw new Error('Cannot reply to closed case')
    }

    // Check message limit (max 5 total messages)
    if (recoveryCase.messages.length >= 5) {
      throw new Error('Maximum 5 messages reached for this case')
    }

    // Add business reply to messages
    const newMessage = {
      role: 'business',
      text: message.trim(),
      created_at: new Date().toISOString(),
    }

    const updatedMessages = [...recoveryCase.messages, newMessage]

    // Update case with new message and status
    const { error: updateError } = await supabase
      .from('recovery_cases')
      .update({
        messages: updatedMessages,
        status: 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', case_id)

    if (updateError) {
      throw new Error('Failed to update case')
    }

    // Send email to customer if they provided an email
    if (recoveryCase.customer_email) {
      const token = await generateHmacToken(case_id, recoveryCase.customer_email)
      const recoveryUrl = `${APP_URL}/recovery/${case_id}?token=${token}`
      
      const businessName = biz.business_name

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">TestimonioYa</h1>
          </div>
          
          <h2 style="color: #111827; font-size: 24px;">Respuesta de ${businessName}</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            ${businessName} ha respondido a tu feedback:
          </p>
          
          <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #4f46e5;">
            <p style="color: #374151; margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${recoveryUrl}" style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Responder →
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px; text-align: center;">
            Tu opinión nos ayuda a mejorar. Gracias por tu tiempo.
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 24px; text-align: center;">
            <p style="color: #d1d5db; font-size: 11px; margin: 0;">
              Enviado por ${businessName} a través de <a href="${APP_URL}" style="color: #9ca3af;">TestimonioYa</a>
            </p>
          </div>
        </div>
      `

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [recoveryCase.customer_email],
          subject: `Respuesta de ${businessName} a tu feedback`,
          html: emailHtml,
        }),
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Recovery reply error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
