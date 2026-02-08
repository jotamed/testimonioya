import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM_EMAIL = 'TestimonioYa <hola@testimonioya.com>'
const APP_URL = 'https://testimonioya.com'

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Get businesses with weekly digest enabled
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, business_name, user_id, slug')
      .eq('notify_weekly_digest', true)

    if (!businesses || businesses.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    let sent = 0

    for (const biz of businesses) {
      // Get user email
      const { data: { user } } = await supabase.auth.admin.getUserById(biz.user_id)
      if (!user?.email) continue

      // Testimonials this week
      const { data: testimonials, count: totalNew } = await supabase
        .from('testimonials')
        .select('rating', { count: 'exact' })
        .eq('business_id', biz.id)
        .gte('created_at', weekAgo.toISOString())

      // Pending approval
      const { count: pendingCount } = await supabase
        .from('testimonials')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', biz.id)
        .eq('status', 'pending')

      const avgRating = testimonials && testimonials.length > 0
        ? (testimonials.reduce((sum: number, t: any) => sum + t.rating, 0) / testimonials.length).toFixed(1)
        : '—'

      const settingsUrl = `${APP_URL}/dashboard/settings`
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">TestimonioYa</h1>
          </div>
          <h2 style="color: #111827; font-size: 24px;">Resumen semanal 📋</h2>
          <p style="color: #6b7280; font-size: 14px;">Semana del ${weekAgo.toLocaleDateString('es-ES')} al ${now.toLocaleDateString('es-ES')}</p>
          
          <div style="display: flex; gap: 12px; margin: 24px 0;">
            <div style="flex: 1; background: #eef2ff; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #4f46e5;">${totalNew || 0}</div>
              <div style="color: #6b7280; font-size: 13px; margin-top: 4px;">Nuevos testimonios</div>
            </div>
            <div style="flex: 1; background: #fef3c7; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #d97706;">${pendingCount || 0}</div>
              <div style="color: #6b7280; font-size: 13px; margin-top: 4px;">Pendientes</div>
            </div>
            <div style="flex: 1; background: #dcfce7; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #16a34a;">${avgRating}</div>
              <div style="color: #6b7280; font-size: 13px; margin-top: 4px;">Rating medio</div>
            </div>
          </div>

          ${(pendingCount || 0) > 0 ? `
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                ⚠️ Tienes <strong>${pendingCount}</strong> testimonios pendientes de aprobar.
              </p>
            </div>
          ` : ''}

          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard" style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
              Ver Dashboard →
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 24px; text-align: center;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0;">
              <a href="${settingsUrl}" style="color: #6366f1; text-decoration: none;">Gestionar notificaciones</a>
              &nbsp;·&nbsp;
              <a href="${APP_URL}" style="color: #6366f1; text-decoration: none;">TestimonioYa</a>
            </p>
            <p style="color: #d1d5db; font-size: 11px; margin: 0;">
              Recibes este email porque activaste el resumen semanal. <a href="${settingsUrl}" style="color: #9ca3af;">Desactivar</a>.
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
          to: [user.email],
          subject: `📋 Resumen semanal — ${biz.business_name}`,
          html,
        }),
      })
      sent++
    }

    return new Response(JSON.stringify({ success: true, sent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
