import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Eye, MessageCircle, Star, Percent } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business } from '../lib/supabase'
import { hasFeature, PlanType } from '../lib/plans'
import { Link } from 'react-router-dom'

interface AnalyticsData {
  totalViews: number
  totalSubmissions: number
  conversionRate: number
  avgRating: number
  testimonialsThisMonth: number
  testimonialsByDay: { date: string; count: number }[]
  topLinks: { name: string; views: number; submissions: number }[]
}

export default function Analytics() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [data, setData] = useState<AnalyticsData | null>(null)
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
        .then(({ data: allBiz, error: bizErr }) => {
          if (bizErr || !allBiz?.length) return { data: null, error: bizErr }
          const savedId = localStorage.getItem('testimonioya_current_business')
          const biz = allBiz.find((b: any) => b.id === savedId) || allBiz[0]
          return { data: biz, error: null }
        })

      if (!businessData) return
      setBusiness(businessData)

      // Check if user has analytics access
      if (!hasFeature(businessData.plan as PlanType, 'hasAnalytics')) {
        setLoading(false)
        return
      }

      // Load collection links stats
      const { data: linksData } = await supabase
        .from('collection_links')
        .select('name, views_count, submissions_count')
        .eq('business_id', businessData.id)
        .order('views_count', { ascending: false })

      const totalViews = linksData?.reduce((sum, l) => sum + l.views_count, 0) || 0
      const totalSubmissions = linksData?.reduce((sum, l) => sum + l.submissions_count, 0) || 0
      const conversionRate = totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0

      // Load testimonials for avg rating
      const { data: testimonialsData } = await supabase
        .from('testimonials')
        .select('rating, created_at')
        .eq('business_id', businessData.id)

      const avgRating = testimonialsData && testimonialsData.length > 0
        ? testimonialsData.reduce((sum, t) => sum + t.rating, 0) / testimonialsData.length
        : 0

      // Count testimonials this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const testimonialsThisMonth = testimonialsData?.filter(
        t => new Date(t.created_at) >= startOfMonth
      ).length || 0

      // Group testimonials by day (last 30 days)
      const last30Days = new Date()
      last30Days.setDate(last30Days.getDate() - 30)
      
      const byDay: { [key: string]: number } = {}
      testimonialsData?.forEach(t => {
        const date = new Date(t.created_at)
        if (date >= last30Days) {
          const key = date.toISOString().split('T')[0]
          byDay[key] = (byDay[key] || 0) + 1
        }
      })

      const testimonialsByDay = Object.entries(byDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      setData({
        totalViews,
        totalSubmissions,
        conversionRate,
        avgRating,
        testimonialsThisMonth,
        testimonialsByDay,
        topLinks: linksData?.slice(0, 5).map(l => ({
          name: l.name,
          views: l.views_count,
          submissions: l.submissions_count,
        })) || [],
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Show upgrade prompt for non-premium users
  if (business && !hasFeature(business.plan as PlanType, 'hasAnalytics')) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl font-bold mb-4">Analíticas Avanzadas</h1>
            <p className="text-lg text-purple-100 mb-6">
              Accede a métricas detalladas de tus testimonios, tasas de conversión y más.
              Disponible en el plan Premium.
            </p>
            <ul className="text-left text-purple-100 mb-8 space-y-2 max-w-md mx-auto">
              <li className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Vistas y conversiones en tiempo real</span>
              </li>
              <li className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Tendencias de testimonios por día</span>
              </li>
              <li className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Rating promedio y evolución</span>
              </li>
            </ul>
            <Link
              to="/dashboard/settings"
              className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              <span>Upgrade a Premium</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Error al cargar analíticas</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analíticas</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Vistas Totales</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalViews.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Testimonios Recibidos</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalSubmissions}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tasa de Conversión</p>
                <p className="text-3xl font-bold text-gray-900">{data.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Percent className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Rating Promedio</p>
                <p className="text-3xl font-bold text-gray-900">{data.avgRating.toFixed(1)} ⭐</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Rendimiento por Enlace</h2>
          {data.topLinks.length === 0 ? (
            <p className="text-gray-600">No hay datos de enlaces aún</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 font-medium">Enlace</th>
                    <th className="pb-3 font-medium text-right">Vistas</th>
                    <th className="pb-3 font-medium text-right">Envíos</th>
                    <th className="pb-3 font-medium text-right">Conversión</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topLinks.map((link, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 font-medium text-gray-900">{link.name}</td>
                      <td className="py-3 text-right text-gray-600">{link.views.toLocaleString()}</td>
                      <td className="py-3 text-right text-gray-600">{link.submissions}</td>
                      <td className="py-3 text-right text-gray-600">
                        {link.views > 0 ? ((link.submissions / link.views) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Testimonials This Month */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Este Mes</h2>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{data.testimonialsThisMonth}</p>
              <p className="text-gray-600">testimonios recibidos</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
