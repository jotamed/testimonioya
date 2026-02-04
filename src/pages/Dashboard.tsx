import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Star, TrendingUp, Link as LinkIcon } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business, Testimonial } from '../lib/supabase'

export default function Dashboard() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [recentTestimonials, setRecentTestimonials] = useState<Testimonial[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
  })
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

        setStats({
          total: totalCount || 0,
          pending: pendingCount || 0,
          approved: approvedCount || 0,
        })
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
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!business) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">No se encontró el negocio</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Testimonios</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Aprobados</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

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
