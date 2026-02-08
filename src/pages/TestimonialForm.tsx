import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Star, Send, MessageSquare, AlertTriangle, Type, Mic, Video } from 'lucide-react'
import { supabase, CollectionLink, Business } from '../lib/supabase'
import { canReceiveTestimonial, PlanType } from '../lib/plans'
import { updateSEO } from '../lib/seo'
import AudioRecorder from '../components/AudioRecorder'
import VideoRecorder from '../components/VideoRecorder'

type TestimonialMode = 'text' | 'audio' | 'video'

export default function TestimonialForm() {
  const { slug } = useParams()
  const [link, setLink] = useState<CollectionLink | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [brandColor, setBrandColor] = useState('#4f46e5')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [limitReached, setLimitReached] = useState(false)
  const [mode, setMode] = useState<TestimonialMode>('text')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    text_content: '',
    rating: 5,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [inactive, setInactive] = useState(false)

  useEffect(() => {
    loadLink()
  }, [slug])

  const loadLink = async () => {
    try {
      // Load collection link
      const { data: linkData, error: linkError } = await supabase
        .from('collection_links')
        .select('*, businesses(*)')
        .eq('slug', slug)
        .single()

      if (linkError || !linkData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      if (!linkData.is_active) {
        setInactive(true)
        setLoading(false)
        return
      }

      setLink(linkData)
      
      // @ts-ignore
      const businessData = linkData.businesses as Business
      setBusiness(businessData)
      setBusinessName(businessData.business_name)
      setBrandColor(businessData.brand_color)
      setWelcomeMessage(businessData.welcome_message)

      updateSEO({
        title: `Deja tu testimonio para ${businessData.business_name}`,
        description: `Comparte tu experiencia con ${businessData.business_name}. Tu opinión es importante.`,
        url: `https://testimonioya.com/t/${slug}`,
        noIndex: true, // Don't index form pages
      })
      
      // If business doesn't allow audio, force text mode
      if (!businessData.allow_audio_testimonials) {
        setMode('text')
      }

      // Check if business has reached testimonial limit
      const limitCheck = await canReceiveTestimonial(businessData.id, businessData.plan as PlanType)
      if (!limitCheck.allowed) {
        setLimitReached(true)
      }

      // Increment views
      await supabase
        .from('collection_links')
        .update({ views_count: linkData.views_count + 1 })
        .eq('id', linkData.id)
    } catch (error) {
      console.error('Error loading link:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const uploadMedia = async (blob: Blob, type: 'audio' | 'video'): Promise<string | null> => {
    try {
      const extension = type === 'video' ? 'webm' : 'webm'
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
      const filePath = `testimonials/${link?.business_id}/${fileName}`
      const bucket = type === 'video' ? 'video-testimonials' : 'audio-testimonials'
      
      setUploadProgress(30)
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, {
          contentType: blob.type,
          cacheControl: '3600',
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      setUploadProgress(80)

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      setUploadProgress(100)
      return publicUrl
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      return null
    }
  }

  // Backwards compatibility
  const uploadAudio = (blob: Blob) => uploadMedia(blob, 'audio')
  const uploadVideo = (blob: Blob) => uploadMedia(blob, 'video')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!link || !business) return

    setError(null)
    
    // Validate based on mode
    if (mode === 'text' && !formData.text_content.trim()) {
      setError('Por favor, escribe tu testimonio')
      return
    }
    if (mode === 'audio' && !audioBlob) {
      setError('Por favor, graba tu testimonio en audio')
      return
    }
    if (mode === 'video' && !videoBlob) {
      setError('Por favor, graba tu testimonio en video')
      return
    }

    // Double-check limit before submitting
    const limitCheck = await canReceiveTestimonial(business.id, business.plan as PlanType)
    if (!limitCheck.allowed) {
      setLimitReached(true)
      return
    }

    setSubmitting(true)
    try {
      let audioUrl: string | null = null
      let videoUrl: string | null = null
      
      // Upload audio if present
      if (audioBlob) {
        audioUrl = await uploadAudio(audioBlob)
        if (!audioUrl && mode === 'audio') {
          setError('Error al subir el audio. Inténtalo de nuevo.')
          setSubmitting(false)
          return
        }
      }
      
      // Upload video if present
      if (videoBlob) {
        videoUrl = await uploadVideo(videoBlob)
        if (!videoUrl && mode === 'video') {
          setError('Error al subir el video. Inténtalo de nuevo.')
          setSubmitting(false)
          return
        }
      }

      const { error } = await supabase
        .from('testimonials')
        .insert({
          business_id: link.business_id,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email || null,
          text_content: formData.text_content || null,
          audio_url: audioUrl,
          video_url: videoUrl,
          rating: formData.rating,
          source: 'form',
          status: 'pending',
        })

      if (error) throw error

      // Increment submissions count
      await supabase
        .from('collection_links')
        .update({ submissions_count: link.submissions_count + 1 })
        .eq('id', link.id)

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting testimonial:', error)
      setError('Error al enviar el testimonio. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
    }
  }

  const generateWhatsAppLink = () => {
    const message = encodeURIComponent(
      `¡Hola! Quiero dejar un testimonio sobre ${businessName}\n\n` +
      `Mi nombre: ${formData.customer_name}\n` +
      `Calificación: ${'⭐'.repeat(formData.rating)}\n\n` +
      `Testimonio:\n${formData.text_content}`
    )
    return `https://wa.me/?text=${message}`
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

  if (notFound || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace no encontrado</h1>
          <p className="text-gray-600">Este enlace no existe o ha sido eliminado</p>
        </div>
      </div>
    )
  }

  if (inactive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace desactivado</h1>
          <p className="text-gray-600">Este enlace ya no está aceptando testimonios</p>
        </div>
      </div>
    )
  }

  if (limitReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Límite alcanzado
            </h1>
            <p className="text-gray-600 mb-6">
              {businessName} ha alcanzado el límite de testimonios de su plan este mes. 
              Por favor, inténtalo más tarde.
            </p>
            <p className="text-sm text-gray-500">
              ¿Eres el dueño? Actualiza tu plan para recibir más testimonios.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Gracias!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Tu testimonio {mode === 'audio' ? 'en audio ' : ''}ha sido recibido y será revisado pronto.
            </p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-900">
                Tu opinión es muy valiosa para {businessName} ❤️
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full mb-4"
               style={{ backgroundColor: brandColor + '20' }}>
            <MessageSquare className="h-8 w-8" style={{ color: brandColor }} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Comparte tu experiencia con {businessName}
          </h1>
          <p className="text-lg text-gray-600">
            {welcomeMessage}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Tu Nombre <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="input-field"
                placeholder="Juan Pérez"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Tu Email <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="input-field"
                placeholder="juan@email.com"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Calificación <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        rating <= formData.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Selector - Only show if business allows audio/video */}
            {business?.allow_audio_testimonials !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ¿Cómo quieres compartir tu testimonio?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('text')}
                    className={`flex flex-col items-center justify-center space-y-1 px-3 py-3 rounded-xl border-2 transition-all ${
                      mode === 'text'
                        ? 'border-transparent text-white'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                    }`}
                    style={mode === 'text' ? { backgroundColor: brandColor } : {}}
                  >
                    <Type className="h-5 w-5" />
                    <span className="font-medium text-sm">Texto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('audio')}
                    className={`flex flex-col items-center justify-center space-y-1 px-3 py-3 rounded-xl border-2 transition-all ${
                      mode === 'audio'
                        ? 'border-transparent text-white'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                    }`}
                    style={mode === 'audio' ? { backgroundColor: brandColor } : {}}
                  >
                    <Mic className="h-5 w-5" />
                    <span className="font-medium text-sm">Audio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('video')}
                    className={`flex flex-col items-center justify-center space-y-1 px-3 py-3 rounded-xl border-2 transition-all ${
                      mode === 'video'
                        ? 'border-transparent text-white'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                    }`}
                    style={mode === 'video' ? { backgroundColor: brandColor } : {}}
                  >
                    <Video className="h-5 w-5" />
                    <span className="font-medium text-sm">Video</span>
                  </button>
                </div>
              </div>
            )}

            {/* Testimonial Content - Text, Audio, or Video */}
            {mode === 'text' && (
              <div>
                <label htmlFor="testimonial" className="block text-sm font-medium text-gray-700 mb-2">
                  Tu Testimonio <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="testimonial"
                  rows={6}
                  required={mode === 'text'}
                  value={formData.text_content}
                  onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                  className="input-field"
                  placeholder="Cuéntanos sobre tu experiencia..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Comparte detalles específicos que te gustaron
                </p>
              </div>
            )}
            
            {mode === 'audio' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tu Testimonio en Audio <span className="text-red-500">*</span>
                </label>
                <AudioRecorder 
                  onAudioReady={setAudioBlob}
                  brandColor={brandColor}
                  maxDuration={120}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Graba hasta 2 minutos contando tu experiencia
                </p>
              </div>
            )}
            
            {mode === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tu Testimonio en Video <span className="text-red-500">*</span>
                </label>
                <VideoRecorder 
                  onVideoReady={setVideoBlob}
                  brandColor={brandColor}
                  maxDuration={60}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Graba hasta 1 minuto contando tu experiencia
                </p>
              </div>
            )}

            {/* Upload Progress */}
            {submitting && uploadProgress > 0 && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm text-indigo-700 mb-2">
                  <span>Subiendo audio...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-3 pt-4">
              <button
                type="submit"
                disabled={submitting || (mode === 'audio' && !audioBlob) || (mode === 'video' && !videoBlob)}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: brandColor }}
              >
                <Send className="h-5 w-5" />
                <span>{submitting ? 'Enviando...' : 'Enviar Testimonio'}</span>
              </button>

              {mode === 'text' && (
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>Enviar por WhatsApp</span>
                </a>
              )}
            </div>
          </form>
        </div>

        {/* Footer - Only show branding for free plan */}
        {business?.plan === 'free' && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Powered by{' '}
              <a href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
                TestimonioYa
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
