import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Star, Send, MessageSquare, AlertTriangle, Type, Mic, Video, ExternalLink } from 'lucide-react'
import { supabase, CollectionLink, Business } from '../lib/supabase'
import { canReceiveTestimonial, PlanType } from '../lib/plans'
import { updateSEO } from '../lib/seo'
import { detectLanguage, t, SupportedLang } from '../lib/i18n'
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
  const [userPlan, setUserPlan] = useState<PlanType>('free')
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
  const [lang, setLang] = useState<SupportedLang>('es')

  // Helper for translations
  const _ = useMemo(() => (key: string, vars?: Record<string, string>) => t(lang, key, vars), [lang])

  useEffect(() => {
    loadLink()
  }, [slug])

  const loadLink = async () => {
    try {
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

      // Load user plan from profiles (plan is now at user level, not business level)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', businessData.user_id)
        .single()
      
      if (profileData) {
        setUserPlan(profileData.plan as PlanType || 'free')
      }

      // Detect language with business default as fallback
      const defaultLang = (businessData.default_language || 'es') as SupportedLang
      setLang(detectLanguage(defaultLang))

      updateSEO({
        title: `Deja tu testimonio para ${businessData.business_name}`,
        description: `Comparte tu experiencia con ${businessData.business_name}. Tu opinión es importante.`,
        url: `https://testimonioya.com/t/${slug}`,
        noIndex: true,
      })
      
      if (!businessData.allow_audio_testimonials) {
        setMode('text')
      }

      const limitCheck = await canReceiveTestimonial(businessData.id, businessData.plan as PlanType)
      if (!limitCheck.allowed) {
        setLimitReached(true)
      }

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
      const extension = 'webm'
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

      if (uploadError) throw uploadError

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

  const uploadAudio = (blob: Blob) => uploadMedia(blob, 'audio')
  const uploadVideo = (blob: Blob) => uploadMedia(blob, 'video')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!link || !business) return

    setError(null)
    
    if (mode === 'text' && !formData.text_content.trim()) {
      setError(_('form.error.text'))
      return
    }
    if (mode === 'audio' && !audioBlob) {
      setError(_('form.error.audio'))
      return
    }
    if (mode === 'video' && !videoBlob) {
      setError(_('form.error.video'))
      return
    }

    const limitCheck = await canReceiveTestimonial(business.id, business.user_id)
    if (!limitCheck.allowed) {
      setLimitReached(true)
      return
    }

    setSubmitting(true)
    try {
      let audioUrl: string | null = null
      let videoUrl: string | null = null
      
      if (audioBlob) {
        audioUrl = await uploadAudio(audioBlob)
        if (!audioUrl && mode === 'audio') {
          setError(_('form.error.upload.audio'))
          setSubmitting(false)
          return
        }
      }
      
      if (videoBlob) {
        videoUrl = await uploadVideo(videoBlob)
        if (!videoUrl && mode === 'video') {
          setError(_('form.error.upload.video'))
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

      await supabase
        .from('collection_links')
        .update({ submissions_count: link.submissions_count + 1 })
        .eq('id', link.id)

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting testimonial:', error)
      setError(_('form.error.submit'))
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-indigo-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">{_('loading')}</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{_('notfound.title')}</h1>
          <p className="text-gray-600">{_('notfound.message')}</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{_('inactive.title')}</h1>
          <p className="text-gray-600">{_('inactive.message')}</p>
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
              {_('limit.title')}
            </h1>
            <p className="text-gray-600 mb-6">
              {_('limit.message', { business: businessName })}
            </p>
            <p className="text-sm text-gray-500">
              {_('limit.owner')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Post-submission screen with Google Reviews redirect for promoters
  if (submitted) {
    const starThreshold = business?.google_reviews_star_threshold ?? 4
    const isPromoter = formData.rating >= starThreshold
    const googleReviewsUrl = business?.google_reviews_url

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {_('thanks.title')}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {isPromoter 
                ? (mode === 'audio' ? _('thanks.message.audio') : _('thanks.message'))
                : _('thanks.detractor')
              }
            </p>
            
            {/* Google Reviews redirect for promoters */}
            {isPromoter && googleReviewsUrl && (
              <a
                href={googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 px-6 mb-4 rounded-xl font-semibold text-white text-lg transition-all hover:opacity-90 hover:scale-[1.02] flex items-center justify-center space-x-3"
                style={{ backgroundColor: brandColor }}
              >
                <span>{_('thanks.google')}</span>
                <ExternalLink className="h-5 w-5" />
              </a>
            )}

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-900">
                {_('thanks.valuable', { business: businessName })}
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
            {_('form.title', { business: businessName })}
          </h1>
          <p className="text-lg text-gray-600">
            {welcomeMessage}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
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
                {_('form.name')} <span className="text-red-500">{_('form.required')}</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="input-field"
                placeholder={_('form.name.placeholder')}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {_('form.email')} <span className="text-gray-400">{_('form.email.optional')}</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="input-field"
                placeholder={_('form.email.placeholder')}
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {_('form.rating')} <span className="text-red-500">{_('form.required')}</span>
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

            {/* Mode Selector */}
            {business?.allow_audio_testimonials !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {_('form.mode.label')}
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
                    <span className="font-medium text-sm">{_('form.mode.text')}</span>
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
                    <span className="font-medium text-sm">{_('form.mode.audio')}</span>
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
                    <span className="font-medium text-sm">{_('form.mode.video')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Testimonial Content */}
            {mode === 'text' && (
              <div>
                <label htmlFor="testimonial" className="block text-sm font-medium text-gray-700 mb-2">
                  {_('form.testimonial')} <span className="text-red-500">{_('form.required')}</span>
                </label>
                <textarea
                  id="testimonial"
                  rows={6}
                  required={mode === 'text'}
                  value={formData.text_content}
                  onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                  className="input-field"
                  placeholder={_('form.testimonial.placeholder')}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {_('form.testimonial.hint')}
                </p>
              </div>
            )}
            
            {mode === 'audio' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {_('form.audio.label')} <span className="text-red-500">{_('form.required')}</span>
                </label>
                <AudioRecorder 
                  onAudioReady={setAudioBlob}
                  brandColor={brandColor}
                  maxDuration={120}
                />
                <p className="mt-2 text-xs text-gray-500">
                  {_('form.audio.hint')}
                </p>
              </div>
            )}
            
            {mode === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {_('form.video.label')} <span className="text-red-500">{_('form.required')}</span>
                </label>
                <VideoRecorder 
                  onVideoReady={setVideoBlob}
                  brandColor={brandColor}
                  maxDuration={60}
                />
                <p className="mt-2 text-xs text-gray-500">
                  {_('form.video.hint')}
                </p>
              </div>
            )}

            {/* Upload Progress */}
            {submitting && uploadProgress > 0 && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm text-indigo-700 mb-2">
                  <span>{_('form.uploading')}</span>
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
                <span>{submitting ? _('form.submitting') : _('form.submit')}</span>
              </button>

            </div>
          </form>
        </div>

        {/* Footer */}
        {userPlan === 'free' && (
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
