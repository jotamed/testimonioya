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

type EmailType = 'welcome' | 'new_testimonial' | 'nps_received' | 'request_testimonial'

function emailFooter(settingsUrl: string): string {
  return `
    <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 24px; text-align: center;">
      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0;">
        <a href="${settingsUrl}" style="color: #6366f1; text-decoration: none;">Gestionar notificaciones</a>
        &nbsp;·&nbsp;
        <a href="${APP_URL}" style="color: #6366f1; text-decoration: none;">TestimonioYa</a>
      </p>
      <p style="color: #d1d5db; font-size: 11px; margin: 0;">
        Si no quieres recibir estos emails, <a href="${settingsUrl}" style="color: #9ca3af;">desactívalos aquí</a>.
      </p>
    </div>
  `
}

function emailWrapper(content: string, settingsUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">TestimonioYa</h1>
      </div>
      ${content}
      ${emailFooter(settingsUrl)}
    </div>
  `
}

const templates: Record<EmailType, (data: any) => { subject: string; html: string }> = {
  welcome: (data) => ({
    subject: `¡Bienvenido a TestimonioYa, ${data.business_name}! 🎉`,
    html: emailWrapper(`
      <h2 style="color: #111827; font-size: 24px;">¡Bienvenido, ${data.business_name}! 🎉</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Tu cuenta está lista. Ahora puedes empezar a recolectar testimonios de tus clientes.
      </p>
      <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #111827; margin-top: 0;">Próximos pasos:</h3>
        <ol style="color: #4b5563; line-height: 1.8;">
          <li>Crea tu primer enlace de recolección</li>
          <li>Compártelo con tus clientes (QR, WhatsApp, email)</li>
          <li>¡Mira cómo llegan los testimonios!</li>
        </ol>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.dashboard_url}" style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
          Ir al Dashboard →
        </a>
      </div>
    `, `${data.dashboard_url}/settings`),
  }),

  new_testimonial: (data) => ({
    subject: `🌟 Nuevo testimonio de ${data.customer_name} para ${data.business_name}`,
    html: emailWrapper(`
      <h2 style="color: #111827; font-size: 24px;">¡Nuevo testimonio recibido! 🌟</h2>
      <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <div style="margin-bottom: 12px;">
          <strong style="color: #111827;">${data.customer_name}</strong>
          <span style="color: #6b7280; margin-left: 8px;">${'⭐'.repeat(data.rating)}</span>
        </div>
        <p style="color: #374151; font-style: italic; margin: 0; line-height: 1.6;">
          "${data.text_content}"
        </p>
      </div>
      <p style="color: #4b5563; font-size: 14px;">
        Fuente: ${data.source} · ${new Date().toLocaleDateString('es-ES')}
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.dashboard_url}/testimonials" style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
          Revisar y Aprobar →
        </a>
      </div>
    `, `${data.dashboard_url}/settings`),
  }),

  request_testimonial: (data) => ({
    subject: data.is_unified
      ? `${data.business_name} quiere saber tu opinión`
      : `¿Qué tal tu experiencia con ${data.business_name}?`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          ${data.logo_url
            ? `<img src="${data.logo_url}" alt="${data.business_name}" style="max-height: 60px; max-width: 200px; margin-bottom: 12px;" />`
            : `<h1 style="color: #111827; font-size: 24px; margin: 0;">${data.business_name}</h1>`
          }
        </div>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
          ¡Hola${data.customer_name ? `, ${data.customer_name}` : ''}! 👋
        </p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          ${data.is_unified
            ? `En <strong>${data.business_name}</strong> queremos mejorar cada día. ¿Nos ayudas puntuando tu experiencia del 0 al 10? Solo toma 30 segundos.`
            : `Gracias por elegir <strong>${data.business_name}</strong>. Tu opinión nos importa mucho — ¿podrías dedicarnos un minuto para contarnos cómo fue tu experiencia?`
          }
        </p>
        ${data.is_unified ? `
        <div style="text-align: center; margin: 16px 0 8px;">
          <span style="font-size: 28px; letter-spacing: 4px; color: #9ca3af;">0 1 2 3 4 5 6 7 8 9 10</span>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 13px; margin: 0 0 24px;">
          Nada probable ← → Muy probable
        </p>
        ` : ''}
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.form_url}" style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            ${data.is_unified ? 'Puntuar mi experiencia →' : 'Dejar mi opinión →'}
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; text-align: center;">
          Solo toma un minuto. ¡Gracias! 🙏
        </p>
        <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 24px; text-align: center;">
          <p style="color: #d1d5db; font-size: 11px; margin: 0;">
            Enviado por ${data.business_name} a través de <a href="${APP_URL}" style="color: #9ca3af;">TestimonioYa</a>
          </p>
        </div>
      </div>
    `,
  }),

  nps_received: (data) => ({
    subject: `📊 Nueva respuesta NPS: ${data.score}/10 ${data.score >= 9 ? '🎉' : data.score >= 7 ? '👍' : '⚠️'}`,
    html: emailWrapper(`
      <h2 style="color: #111827; font-size: 24px;">Nueva respuesta NPS</h2>
      <div style="text-align: center; margin: 24px 0;">
        <div style="display: inline-block; background: ${data.score >= 9 ? '#dcfce7' : data.score >= 7 ? '#fef3c7' : '#fee2e2'}; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 32px; font-weight: bold; color: ${data.score >= 9 ? '#16a34a' : data.score >= 7 ? '#d97706' : '#dc2626'};">
          ${data.score}
        </div>
        <p style="color: #6b7280; margin-top: 8px;">
          ${data.category === 'promoter' ? '🟢 Promotor' : data.category === 'passive' ? '🟡 Pasivo' : '🔴 Detractor'}
        </p>
      </div>
      ${data.feedback ? `
        <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <p style="color: #374151; margin: 0; line-height: 1.6;">"${data.feedback}"</p>
          ${data.customer_name ? `<p style="color: #6b7280; margin-top: 8px; margin-bottom: 0;">— ${data.customer_name}</p>` : ''}
        </div>
      ` : ''}
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.dashboard_url}/nps" style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
          Ver Dashboard NPS →
        </a>
      </div>
    `, `${data.dashboard_url}/settings`),
  }),
}

// Check notification preferences before sending
async function shouldSendEmail(type: EmailType, userId: string): Promise<boolean> {
  if (type === 'welcome' || type === 'request_testimonial') return true // Always send these

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { data: business } = await supabase
    .from('businesses')
    .select('notify_new_testimonial, notify_nps_response')
    .eq('user_id', userId)
    .single()

  if (!business) return true // Default to sending if no business found

  if (type === 'new_testimonial') return business.notify_new_testimonial !== false
  if (type === 'nps_received') return business.notify_nps_response !== false
  return true
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
    let userId: string | null = null
    if (authHeader) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id || null
    }

    const { type, to, data } = await req.json() as {
      type: EmailType
      to: string
      data: Record<string, any>
    }

    if (!type || !to || !templates[type]) {
      throw new Error('Invalid email type or missing recipient')
    }

    // Validate form_url for request_testimonial — don't send with broken link
    if (type === 'request_testimonial' && (!data?.form_url || data.form_url.trim() === '')) {
      throw new Error('form_url is required for request_testimonial emails')
    }

    // Check notification preferences
    if (userId && !(await shouldSendEmail(type, userId))) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'notification_disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const template = templates[type](data)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: template.subject,
        html: template.html,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || 'Failed to send email')
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Send email error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
