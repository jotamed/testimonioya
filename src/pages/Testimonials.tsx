import { useEffect, useState } from 'react'
import { Star, Check, X, Mic, Sparkles } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useToast } from '../components/Toast'
import { supabase, Business, Testimonial } from '../lib/supabase'
import AudioPlayer from '../components/AudioPlayer'
import { SkeletonTestimonial } from '../components/LoadingSkeleton'
import { EmptyTestimonials } from '../components/EmptyState'

type FilterType = 'all' | 'pending' | 'approved' | 'rejected'

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'approved', label: 'Aprobados' },
  { key: 'rejected', label: 'Rechazados' },
]

export default function Testimonials() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const toast = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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

      if (businessData) {
        setBusiness(businessData)

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
      toast.error('Error al actualizar el testimonio')
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
      toast.error('Error al actualizar el testimonio')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-9 w-20 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <SkeletonTestimonial />
            <SkeletonTestimonial />
            <SkeletonTestimonial />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Testimonios</h1>
            {business && testimonials.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">{testimonials.length} testimonio{testimonials.length !== 1 ? 's' : ''}</p>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl overflow-x-auto flex-nowrap">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  filter === f.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {testimonials.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {filter === 'all' ? (
              <EmptyTestimonials />
            ) : (
              <div className="p-12 text-center">
                <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-7 w-7 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  No hay testimonios
                </h3>
                <p className="text-gray-500 text-sm">
                  No hay testimonios con estado &ldquo;{filter === 'pending' ? 'pendiente' : filter === 'approved' ? 'aprobado' : 'rechazado'}&rdquo;.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md hover:border-gray-200 transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-semibold">
                            {testimonial.customer_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {testimonial.customer_name}
                          </h3>
                          {testimonial.customer_email && (
                            <p className="text-sm text-gray-500 truncate">{testimonial.customer_email}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Stars */}
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        {/* Status badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            testimonial.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : testimonial.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                              : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                          }`}
                        >
                          {testimonial.status === 'approved'
                            ? '✓ Aprobado'
                            : testimonial.status === 'pending'
                            ? '● Pendiente'
                            : '✗ Rechazado'}
                        </span>
                      </div>
                    </div>

                    {/* Text content */}
                    {testimonial.text_content && (
                      <p className="text-gray-700 leading-relaxed mb-3">{testimonial.text_content}</p>
                    )}

                    {/* Audio player */}
                    {testimonial.audio_url && (
                      <div className="mb-3">
                        <AudioPlayer src={testimonial.audio_url} compact />
                      </div>
                    )}

                    {/* Audio-only badge */}
                    {testimonial.audio_url && !testimonial.text_content && (
                      <div className="flex items-center space-x-1.5 text-indigo-600 mb-3">
                        <Mic className="h-4 w-4" />
                        <span className="text-sm font-medium">Testimonio en audio</span>
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="capitalize bg-gray-50 px-2 py-0.5 rounded">{testimonial.source}</span>
                      <span>•</span>
                      <span>{new Date(testimonial.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {testimonial.is_featured && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-indigo-600 font-medium">
                            <Sparkles className="h-3 w-3" />
                            Destacado
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 flex-shrink-0">
                    {testimonial.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateTestimonialStatus(testimonial.id, 'approved')}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all text-sm font-medium"
                        >
                          <Check className="h-4 w-4" />
                          <span>Aprobar</span>
                        </button>
                        <button
                          onClick={() => updateTestimonialStatus(testimonial.id, 'rejected')}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 active:scale-[0.98] transition-all text-sm font-medium"
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
                          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium active:scale-[0.98] transition-all ${
                            testimonial.is_featured
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          <Sparkles className="h-4 w-4" />
                          <span>{testimonial.is_featured ? 'Quitar' : 'Destacar'}</span>
                        </button>
                        <button
                          onClick={() => updateTestimonialStatus(testimonial.id, 'rejected')}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 active:scale-[0.98] transition-all text-sm font-medium"
                        >
                          <X className="h-4 w-4" />
                          <span>Rechazar</span>
                        </button>
                      </>
                    )}

                    {testimonial.status === 'rejected' && (
                      <button
                        onClick={() => updateTestimonialStatus(testimonial.id, 'approved')}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all text-sm font-medium"
                      >
                        <Check className="h-4 w-4" />
                        <span>Aprobar</span>
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
