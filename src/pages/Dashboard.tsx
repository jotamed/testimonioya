import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Star, TrendingUp, Link as LinkIcon, Zap, BarChart3, Clock, Send, ArrowUpRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business, Testimonial } from '../lib/supabase'
import { getUsageStats, PlanType } from '../lib/plans'
import { PLANS } from '../lib/stripe'
import { SkeletonDashboard } from '../components/LoadingSkeleton'

export default function Dashboard() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [recentTestimonials, setRecentTestimonials] = useState<Testimonial[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    avgRating: 0,
    thisMonth: 0,
  })
  const [usage, setUsage] = useState<{
    testimonials: { current: number; limit: number };
    links: { current: number; limit: number };
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (businessData) {
        setBusiness(businessData)

        const { data: testimonialsData } = await supabase
          .from('testimonials')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setRecentTestimonials(testimonialsData || [])

        const { count: totalCount } = await supabase
          .from('testimonials')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessData.id)

        const { count: pendingCount } = await supabase
          .from('testimonials')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessData.id)
          .eq('status', 'pending')

        const { count: approvedCount } = await supabase
          .from('testimonials')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessData.id)
          .eq('status', 'approved')

        const { data: ratingData } = await supabase
          .from('testimonials')
          .select('rating')
          .eq('business_id', businessData.id)
          .eq('status', 'approved')

        const avgRating = ratingData && ratingData.length > 0
          ? ratingData.reduce((sum, t) => sum + t.rating, 0) / ratingData.length
          : 0

        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        const { count: monthCount } = await supabase
          .from('testimonials')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessData.id)
          .gte('created_at', startOfMonth.toISOString())

        setStats({
          total: totalCount || 0,
          pending: pendingCount || 0,
          approved: approvedCount || 0,
          avgRating,
          thisMonth: monthCount || 0,
        })

        const usageStats = await getUsageStats(businessData.id, businessData.plan as PlanType)
        setUsage(usageStats)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonDashboard />
      </DashboardLayout>
    )
  }

  if (!business) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">No se encontró el negocio</p>
          <Link to="/onboarding" className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
            <span>Crear negocio</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const statCards = [
    {
      label: 'Total',
      value: stats.total,
      icon: MessageCircle,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      subtitle: null,
    },
    {
      label: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      subtitle: stats.pending > 0 ? '⚡ Requieren revisión' : null,
      subtitleColor: 'text-amber-600',
    },
    {
      label: 'Aprobados',
      value: stats.approved,
      icon: Star,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      subtitle: stats.total > 0 ? `${Math.round((stats.approved / stats.total) * 100)}% tasa aprobación` : null,
      subtitleColor: 'text-gray-500',
    },
    {
      label: 'Rating',
      value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—',
      icon: BarChart3,
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      subtitle: null,
      stars: stats.avgRating > 0 ? stats.avgRating : 0,
    },
    {
      label: 'Este Mes',
      value: stats.thisMonth,
      icon: TrendingUp,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      subtitle: null,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Hola, {business.business_name} 👋
          </h1>
          <p className="text-gray-500 mt-1">Aquí tienes un resumen de tu cuenta</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
                  <div className={`h-8 w-8 rounded-lg ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-4 w-4 ${card.iconColor}`} />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{card.value}</p>
                {'stars' in card && (card.stars ?? 0) > 0 && (
                  <div className="flex items-center mt-1.5 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.round(card.stars as number) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                )}
                {card.subtitle && (
                  <p className={`text-xs mt-1.5 ${'subtitleColor' in card ? card.subtitleColor : 'text-gray-500'}`}>
                    {card.subtitle}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Plan Usage */}
        {usage && business.plan === 'free' && (
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-lg">Plan {PLANS[business.plan].name}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-indigo-200">Testimonios este mes</span>
                    <div className="flex-1 max-w-[120px] h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{
                          width: usage.testimonials.limit === Infinity
                            ? '10%'
                            : `${Math.min((usage.testimonials.current / usage.testimonials.limit) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <span className="font-medium tabular-nums">
                      {usage.testimonials.current} / {usage.testimonials.limit === Infinity ? '∞' : usage.testimonials.limit}
                    </span>
                    {usage.testimonials.limit !== Infinity && usage.testimonials.current >= usage.testimonials.limit * 0.8 && (
                      <span className="text-yellow-300 text-xs">⚠️ Cerca del límite</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-indigo-200">Enlaces creados</span>
                    <div className="flex-1 max-w-[120px] h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{
                          width: usage.links.limit === Infinity
                            ? '10%'
                            : `${Math.min((usage.links.current / usage.links.limit) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <span className="font-medium tabular-nums">
                      {usage.links.current} / {usage.links.limit === Infinity ? '∞' : usage.links.limit}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                to="/dashboard/settings"
                className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-sm"
              >
                <span>Upgrade a Pro</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { to: '/dashboard/request', icon: Send, label: 'Pedir Testimonio', desc: 'Email, WhatsApp o enlace', primary: true },
              { to: '/dashboard/links', icon: LinkIcon, label: 'Crear Enlace', desc: 'Genera un link único' },
              { to: '/dashboard/testimonials', icon: MessageCircle, label: 'Ver Testimonios', desc: 'Gestiona tus reseñas' },
              { to: `/wall/${business.slug}`, icon: Star, label: 'Ver Muro', desc: 'Tu muro público', external: true },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  target={action.external ? '_blank' : undefined}
                  className={`group relative flex flex-col p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 ${
                    action.primary
                      ? 'border-indigo-200 bg-indigo-50/50 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md'
                      : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-md'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110 ${
                    action.primary ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-indigo-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${action.primary ? 'text-indigo-600' : 'text-gray-600 group-hover:text-indigo-600'} transition-colors`} />
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{action.label}</span>
                  <span className="text-xs text-gray-500 mt-0.5 hidden sm:block">{action.desc}</span>
                  {action.external && (
                    <ArrowUpRight className="absolute top-3 right-3 h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Testimonials */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
            <h2 className="text-lg font-semibold text-gray-900">Testimonios Recientes</h2>
            <Link to="/dashboard/testimonials" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              Ver todos →
            </Link>
          </div>

          {recentTestimonials.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-7 w-7 text-gray-300" />
              </div>
              <p className="text-gray-500 mb-4 text-sm">Aún no tienes testimonios. ¡Empieza pidiendo uno!</p>
              <Link to="/dashboard/links" className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                <span>Crear Primer Enlace</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 mt-4">
              {recentTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="px-5 sm:px-6 py-4 hover:bg-gray-50/50 transition-colors duration-150"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {testimonial.customer_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{testimonial.customer_name}</p>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < testimonial.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
                        testimonial.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : testimonial.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {testimonial.status === 'approved'
                        ? 'Aprobado'
                        : testimonial.status === 'pending'
                        ? 'Pendiente'
                        : 'Rechazado'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 ml-12">{testimonial.text_content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
