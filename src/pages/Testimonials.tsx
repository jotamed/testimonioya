import { useEffect, useState } from 'react'
import { Star, Check, X, Filter } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business, Testimonial } from '../lib/supabase'

export default function Testimonials() {
  const [_business, setBusiness] = useState<Business | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [filter])

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

        // Load testimonials with filter
        let query = supabase
          .from('testimonials')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false })

        if (filter !== 'all') {
          query = query.eq('status', filter)
        }

        const { data: testimonialsData } = await query
        setTestimonials(testimonialsData || [])
      }
    } catch (error) {
      console.error('Error loading testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTestimonialStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      
      loadData()
    } catch (error) {
      console.error('Error updating testimonial:', error)
      alert('Error al actualizar el testimonio')
    }
  }

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_featured: !isFeatured })
        .eq('id', id)

      if (error) throw error
      
      loadData()
    } catch (error) {
      console.error('Error updating featured status:', error)
      alert('Error al actualizar el testimonio')
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

  return (
    <DashboardLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Testimonios</h1>
          
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input-field py-2"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>
        </div>

        {testimonials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No hay testimonios
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Aún no has recibido testimonios. Crea un enlace para comenzar.'
                : `No hay testimonios con estado "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {testimonial.customer_name}
                        </h3>
                        {testimonial.customer_email && (
                          <p className="text-sm text-gray-600">{testimonial.customer_email}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < testimonial.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{testimonial.text_content}</p>
                    
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span className="capitalize">Fuente: {testimonial.source}</span>
                      <span>•</span>
                      <span>{new Date(testimonial.created_at).toLocaleDateString('es-ES')}</span>
                      {testimonial.is_featured && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-medium">⭐ Destacado</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
                    {testimonial.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateTestimonialStatus(testimonial.id, 'approved')}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          <span>Aprobar</span>
                        </button>
                        <button
                          onClick={() => updateTestimonialStatus(testimonial.id, 'rejected')}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Rechazar</span>
                        </button>
                      </>
                    )}
                    
                    {testimonial.status === 'approved' && (
                      <>
                        <button
                          onClick={() => toggleFeatured(testimonial.id, testimonial.is_featured)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            testimonial.is_featured
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {testimonial.is_featured ? 'Quitar Destacado' : 'Destacar'}
                        </button>
                        <button
                          onClick={() => updateTestimonialStatus(testimonial.id, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    
                    {testimonial.status === 'rejected' && (
                      <button
                        onClick={() => updateTestimonialStatus(testimonial.id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Aprobar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
