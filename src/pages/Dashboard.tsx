import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Star, TrendingUp, Link as LinkIcon, Zap, BarChart3, Clock } from 'lucide-react'
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

      // Load business
      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (businessData) {
        setBusiness(businessData)

        // Load recent testimonials
        const { data: testimonialsData } = await supabase
          .from('testimonials')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setRecentTestimonials(testimonialsData || [])

        // Calculate stats
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

        // Average rating
        const { data: ratingData } = await supabase
          .from('testimonials')
          .select('rating')
          .eq('business_id', businessData.id)
          .eq('status', 'approved')

        const avgRating = ratingData && ratingData.length > 0
          ? ratingData.reduce((sum, t) => sum + t.rating, 0) / ratingData.length
          : 0

        // This month count
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

        // Load usage stats
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
        <div className="text-center py-12">
          <p className="text-gray-600">No se encontró el negocio</p>
          <Link to="/onboarding" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Crear negocio →
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Hola, {business.business_name} 👋
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
              <MessageCircle className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pendientes</p>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            {stats.pending > 0 && (
              <p className="text-xs text-amber-600 mt-1">⚡ Requieren revisión</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aprobados</p>
              <Star className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            {stats.total > 0 && (
              <p className="text-xs text-gray-500 mt-1">{Math.round((stats.approved / stats.total) * 100)}% tasa aprobación</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</p>
              <BarChart3 className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
            </p>
            {stats.avgRating > 0 && (
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < Math.round(stats.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Este Mes</p>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
          </div>
        </div>

        {/* Plan Usage */}
        {usage && business.plan === 'free' && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-sm p-6 mb-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5" />
                  <h3 className="font-bold">Plan {PLANS[business.plan].name}</h3>
                </div>
                <div className="space-y-1 text-sm text-indigo-100">
                  <p>
                    📝 Testimonios este mes: {usage.testimonials.current} / {usage.testimonials.limit === Infinity ? '∞' : usage.testimonials.limit}
                    {usage.testimonials.limit !== Infinity && usage.testimonials.current >= usage.testimonials.limit * 0.8 && (
                      <span className="ml-2 text-yellow-300">⚠️ Cerca del límite</span>
                    )}
                  </p>
                  <p>
                    🔗 Enlaces: {usage.links.current} / {usage.links.limit === Infinity ? '∞' : usage.links.limit}
                  </p>
                </div>
              </div>
              <Link
                to="/dashboard/settings"
                className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
              >
                <span>Upgrade a Pro</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/dashboard/links"
              className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              <LinkIcon className="h-6 w-6 text-indigo-600" />
              <span className="font-medium text-gray-900">Crear Enlace</span>
            </Link>
            <Link
              to="/dashboard/testimonials"
              className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              <MessageCircle className="h-6 w-6 text-indigo-600" />
              <span className="font-medium text-gray-900">Ver Testimonios</span>
            </Link>
            <Link
              to={`/wall/${business.slug}`}
              target="_blank"
              className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              <Star className="h-6 w-6 text-indigo-600" />
              <span className="font-medium text-gray-900">Ver Muro</span>
            </Link>
          </div>
        </div>

        {/* Recent Testimonials */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Testimonios Recientes</h2>
            <Link to="/dashboard/testimonials" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              Ver todos
            </Link>
          </div>

          {recentTestimonials.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Aún no tienes testimonios</p>
              <Link to="/dashboard/links" className="btn-primary">
                Crear Primer Enlace
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{testimonial.customer_name}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        testimonial.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : testimonial.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {testimonial.status === 'approved'
                        ? 'Aprobado'
                        : testimonial.status === 'pending'
                        ? 'Pendiente'
                        : 'Rechazado'}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{testimonial.text_content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
