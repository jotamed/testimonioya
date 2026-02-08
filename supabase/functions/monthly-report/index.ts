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

    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, business_name, user_id, slug, testimonials_count')
      .eq('notify_monthly_report', true)

    if (!businesses || businesses.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const now = new Date()
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())
    let sent = 0

    for (const biz of businesses) {
      const { data: { user } } = await supabase.auth.admin.getUserById(biz.user_id)
      if (!user?.email) continue

      // This month's testimonials
      const { data: thisMonthTestimonials, count: thisMonthCount } = await supabase
        .from('testimonials')
        .select('rating', { count: 'exact' })
        .eq('business_id', biz.id)
        .gte('created_at', monthAgo.toISOString())

      // Last month's testimonials (for comparison)
      const { count: lastMonthCount } = await supabase
        .from('testimonials')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', biz.id)
        .gte('created_at', twoMonthsAgo.toISOString())
        .lt('created_at', monthAgo.toISOString())

      // NPS this month
      const { data: npsResponses } = await supabase
        .from('nps_responses')
        .select('score')
        .eq('business_id', biz.id)
        .gte('created_at', monthAgo.toISOString())

      const avgRating = thisMonthTestimonials && thisMonthTestimonials.length > 0
        ? (thisMonthTestimonials.reduce((s: number, t: any) => s + t.rating, 0) / thisMonthTestimonials.length).toFixed(1)
        : '—'

      const npsScore = npsResponses && npsResponses.length > 0
        ? Math.round(
            ((npsResponses.filter((r: any) => r.score >= 9).length - npsResponses.filter((r: any) => r.score <= 6).length)
            / npsResponses.length) * 100
          )
        : null

      const countDiff = (thisMonthCount || 0) - (lastMonthCount || 0)
      const diffSign = countDiff > 0 ? '+' : ''
      const diffColor = countDiff >= 0 ? '#16a34a' : '#dc2626'

      const settingsUrl = `${APP_URL}/dashboard/settings`
      const monthName = monthAgo.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">TestimonioYa</h1>
          </div>
          <h2 style="color: #111827; font-size: 24px;">Informe mensual 📊</h2>
          <p style="color: #6b7280; font-size: 14px; text-transform: capitalize;">${monthName}</p>
          
          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
            <tr>
              <td style="width: 50%; padding: 8px;">
                <div style="background: #eef2ff; border-radius: 12px; padding: 20px; text-align: center;">
                  <div style="font-size: 28px; font-weight: bold; color: #4f46e5;">${biz.testimonials_count || 0}</div>
                  <div style="color: #6b7280; font-size: 13px; margin-top: 4px;">Total testimonios</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px;">
                <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; text-align: center;">
                  <div style="font-size: 28px; font-weight: bold; color: #16a34a;">${thisMonthCount || 0}</div>
                  <div style="color: #6b7280; font-size: 13px; margin-top: 4px;">Nuevos este mes</div>
                  <div style="color: ${diffColor}; font-size: 12px; margin-top: 2px;">${diffSign}${countDiff} vs mes anterior</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="width: 50%; padding: 8px;">
                <div style="background: #fffbeb; border-radius: 12px; padding: 20px; text-align: center;">
                  <div style="font-size: 28px; font-weight: bold; color: #d97706;">${avgRating}</div>
                  <div style="color: #6b7280; font-size: 13px; margin-top: 4px;">Rating medio</div>
                </div>
              </td>
              <td style="width: 50%; padding: 8px;">
                <div style="background: ${npsScore !== null ? (npsScore >= 50 ? '#dcfce7' : npsScore >= 0 ? '#fef3c7' : '#fee2e2') : '#f3f4f6'}; border-radius: 12px; padding: 20px; text-align: center;">
                  <div style="font-size: 28px; font-weight: bold; color: ${npsScore !== null ? (npsScore >= 50 ? '#16a34a' : npsScore >= 0 ? '#d97706' : '#dc2626') : '#9ca3af'};">
                    ${npsScore !== null ? npsScore : '—'}
                  </div>
                  <div style="color: #6b7280; font-size: 13px; margin-top: 4px;">NPS Score</div>
                </div>
              </td>
            </tr>
          </table>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard" style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
              Ver Dashboard completo →
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 24px; text-align: center;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0;">
              <a href="${settingsUrl}" style="color: #6366f1; text-decoration: none;">Gestionar notificaciones</a>
              &nbsp;·&nbsp;
              <a href="${APP_URL}" style="color: #6366f1; text-decoration: none;">TestimonioYa</a>
            </p>
            <p style="color: #d1d5db; font-size: 11px; margin: 0;">
              Recibes este email porque activaste el informe mensual. <a href="${settingsUrl}" style="color: #9ca3af;">Desactivar</a>.
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
          subject: `📊 Informe mensual — ${biz.business_name}`,
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
