import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Star, MessageSquare, Mic } from 'lucide-react'
import { supabase, Business, Testimonial } from '../lib/supabase'
import AudioPlayer from '../components/AudioPlayer'
import { updateSEO } from '../lib/seo'

export default function WallOfLove() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const isEmbed = searchParams.get('embed') === 'true'
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [slug])

  const loadData = async () => {
    try {
      // Load business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .single()

      if (businessError || !businessData) {
        setBusiness(null)
        return
      }

      setBusiness(businessData)
      
      updateSEO({
        title: `Testimonios de ${businessData.business_name}`,
        description: `Lee los testimonios reales de clientes de ${businessData.business_name}. Opiniones verificadas.`,
        url: `https://testimonioya.com/wall/${slug}`,
      })

      // Load approved testimonials
      const { data: testimonialsData } = await supabase
        .from('testimonials')
        .select('*')
        .eq('business_id', businessData.id)
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      setTestimonials(testimonialsData || [])
    } catch (error) {
      console.error('Error loading wall:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-indigo-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Negocio no encontrado</h1>
          <p className="text-gray-600">Este muro de testimonios no existe</p>
        </div>
      </div>
    )
  }

  const avgRating = testimonials.length > 0
    ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      {!isEmbed && (
        <header className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full mb-4"
                   style={{ backgroundColor: business.brand_color + '20' }}>
                <MessageSquare className="h-8 w-8" style={{ color: business.brand_color }} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                {business.business_name}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                Testimonios de nuestros clientes
              </p>
              
              {testimonials.length > 0 && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < Math.round(avgRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium text-gray-700">
                    {avgRating.toFixed(1)} ({testimonials.length} {testimonials.length === 1 ? 'testimonio' : 'testimonios'})
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Testimonials Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {testimonials.length === 0 ? (
          <div className="text-center py-16">
            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Aún no hay testimonios
            </h3>
            <p className="text-gray-600">
              Sé el primero en compartir tu experiencia
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-all ${
                  testimonial.is_featured
                    ? 'border-yellow-400 ring-2 ring-yellow-100'
                    : 'border-gray-200'
                }`}
              >
                {testimonial.is_featured && (
                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-yellow-600 uppercase">
                      Destacado
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1 mb-3">
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

                {/* Text content */}
                {testimonial.text_content && (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    "{testimonial.text_content}"
                  </p>
                )}

                {/* Audio player */}
                {testimonial.audio_url && (
                  <div className="mb-4">
                    <AudioPlayer 
                      src={testimonial.audio_url} 
                      compact 
                      brandColor={business.brand_color}
                    />
                  </div>
                )}

                {/* Audio-only badge */}
                {testimonial.audio_url && !testimonial.text_content && (
                  <div className="flex items-center space-x-1 text-indigo-600 mb-4">
                    <Mic className="h-4 w-4" />
                    <span className="text-sm font-medium">Testimonio en audio</span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="font-bold text-gray-900">
                    {testimonial.customer_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(testimonial.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Only show branding for free plan */}
      {plan === 'free' && (
        <div className="py-6 text-center">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              TestimonioYa
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
