import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { MessageSquare, Send, AlertTriangle, ExternalLink, Star } from 'lucide-react'
import { supabase, Business, UnifiedLink } from '../lib/supabase'
import { getPlanLimits } from '../lib/plans'
import { detectLanguage, t, SupportedLang } from '../lib/i18n'

type NpsScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
type FlowStep = 'score' | 'feedback' | 'thanks'
type Category = 'detractor' | 'passive' | 'promoter'

export default function UnifiedForm() {
  const { slug } = useParams()
  const [link, setLink] = useState<UnifiedLink | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'business'>('free')
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<FlowStep>('score')
  const [score, setScore] = useState<NpsScore | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  
  // Form fields
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(5)
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [upgradeRequired, setUpgradeRequired] = useState(false)
  const [lang, setLang] = useState<SupportedLang>('es')

  const _ = useMemo(() => (key: string, vars?: Record<string, string>) => t(lang, key, vars), [lang])

  useEffect(() => {
    loadLink()
  }, [slug])

  const loadLink = async () => {
    try {
      // Load unified link
      const { data: linkData, error: linkError } = await supabase
        .from('unified_links')
        .select('*')
        .eq('slug', slug)
        .single()

      if (linkError || !linkData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      if (!linkData.is_active) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setLink(linkData)

      // Load business
      const { data: bizData } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', linkData.business_id)
        .single()

      if (!bizData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setBusiness(bizData)

      // Get user plan from profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', bizData.user_id)
        .single()

      const plan = (profileData?.plan as 'free' | 'pro' | 'business') || 'free'
      setUserPlan(plan)

      // Check if plan has NPS/unified flow
      const limits = getPlanLimits(plan)
      if (!limits.hasNps || !limits.hasUnifiedFlow) {
        setUpgradeRequired(true)
        setLoading(false)
        return
      }

      // Set language
      const defaultLang = (bizData.default_language || 'es') as SupportedLang
      setLang(detectLanguage(defaultLang))

      // Increment view count
      await supabase
        .from('unified_links')
        .update({ views_count: linkData.views_count + 1 })
        .eq('id', linkData.id)

    } catch (error) {
      console.error('Error loading link:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const getCategory = (npsScore: NpsScore): Category => {
    if (!link) return 'passive'
    if (npsScore >= link.nps_threshold_promoter) return 'promoter'
    if (npsScore >= link.nps_threshold_passive) return 'passive'
    return 'detractor'
  }

  const handleScoreSelect = (selectedScore: NpsScore) => {
    setScore(selectedScore)
    const cat = getCategory(selectedScore)
    setCategory(cat)
    setStep('feedback')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (score === null || !business || !link || !category) return

    // Validation
    if (category === 'promoter' && (!customerName.trim() || !feedback.trim())) {
      setError('Por favor completa todos los campos requeridos')
      return
    }

    if (category === 'detractor' && !feedback.trim()) {
      setError('Por favor cuéntanos qué podemos mejorar')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Always insert NPS response
      const { data: npsData, error: npsError } = await supabase
        .from('nps_responses')
        .insert({
          business_id: business.id,
          score,
          category,
          feedback: feedback || null,
          customer_name: customerName || null,
          customer_email: customerEmail || null,
        })
        .select()
        .single()

      if (npsError) throw npsError

      // For promoters: also create testimonial
      if (category === 'promoter' && feedback.trim()) {
        await supabase
          .from('testimonials')
          .insert({
            business_id: business.id,
            customer_name: customerName,
            customer_email: customerEmail || null,
            text_content: feedback,
            rating,
            source: 'nps',
            status: 'pending',
          })
      }

      // For detractors with Business plan: create recovery case
      if (category === 'detractor' && userPlan === 'business' && npsData) {
        const initialMessage = {
          role: 'customer' as const,
          text: feedback,
          created_at: new Date().toISOString(),
        }

        await supabase
          .from('recovery_cases')
          .insert({
            business_id: business.id,
            nps_response_id: npsData.id,
            status: 'open',
            customer_name: customerName || null,
            customer_email: customerEmail || null,
            messages: [initialMessage],
          })
      }

      setStep('thanks')
    } catch (err) {
      console.error('Error submitting:', err)
      setError('Error al enviar. Por favor intenta de nuevo.')
    } finally {
      setSubmitting(false)
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

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{_('notfound.title')}</h1>
          <p className="text-gray-600">{_('notfound.message')}</p>
        </div>
      </div>
    )
  }

  if (upgradeRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
          <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Funcionalidad Premium</h1>
          <p className="text-gray-600 mb-6">
            El flujo unificado NPS→Testimonio está disponible en planes Pro y Business.
          </p>
          <a
            href="https://testimonioya.com"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Ver planes →
          </a>
        </div>
      </div>
    )
  }

  if (!business || !link) return null

  const brandColor = business.brand_color || '#4f46e5'

  // Thanks screen
  if (step === 'thanks') {
    const isPromoter = category === 'promoter'
    const googleReviewsUrl = link.ask_google_review ? (link.google_reviews_url || business.google_reviews_url) : null
    const showGoogleButton = isPromoter && googleReviewsUrl

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: brandColor + '20' }}
            >
              <span className="text-3xl">
                {category === 'promoter' ? '🎉' : category === 'passive' ? '🙏' : '💪'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Muchas gracias!</h1>
            <p className="text-gray-600 mb-6">
              {category === 'promoter'
                ? 'Tu testimonio es muy valioso para nosotros.'
                : category === 'passive'
                ? 'Agradecemos tu feedback.'
                : 'Trabajaremos para mejorar tu experiencia.'}
            </p>

            {showGoogleButton && (
              <a
                href={googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 px-6 mb-4 rounded-xl font-semibold text-white text-lg transition-all hover:opacity-90 hover:scale-[1.02] flex items-center justify-center space-x-3"
                style={{ backgroundColor: brandColor }}
              >
                <span>⭐ Dejar reseña en Google</span>
                <ExternalLink className="h-5 w-5" />
              </a>
            )}

            <p className="text-sm text-gray-500">
              Equipo de {business.business_name}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Feedback form
  if (step === 'feedback' && score !== null && category) {
    const isPromoter = category === 'promoter'
    const isDetractor = category === 'detractor'
    const isPassive = category === 'passive'

    let title = ''
    let subtitle = ''
    let color = brandColor

    if (isPromoter) {
      title = '🎉 ¡Genial!'
      subtitle = '¿Nos cuentas más sobre tu experiencia?'
      color = '#10b981'
    } else if (isPassive) {
      title = '🙏 Gracias por tu opinión'
      subtitle = '¿Algo que podríamos mejorar? (opcional)'
      color = '#f59e0b'
    } else {
      title = '💪 Queremos mejorar'
      subtitle = '¿Qué podríamos hacer mejor?'
      color = '#ef4444'
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center h-20 w-20 rounded-full text-3xl font-bold text-white mb-4"
              style={{ backgroundColor: color }}
            >
              {score}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name - required for promoters */}
              {isPromoter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input-field"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              )}

              {/* Email - optional */}
              {(isPromoter || isDetractor) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email {isDetractor && <span className="text-gray-400">(opcional)</span>}
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="input-field"
                    placeholder="tu@email.com"
                  />
                </div>
              )}

              {/* Star rating - only for promoters */}
              {isPromoter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Calificación
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRating(r)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            r <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isPromoter
                    ? 'Tu experiencia'
                    : isDetractor
                    ? '¿Qué podemos mejorar?'
                    : 'Comentarios'}
                  {(isPromoter || isDetractor) && <span className="text-red-500"> *</span>}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder={
                    isPromoter
                      ? 'Cuéntanos qué te gustó...'
                      : isDetractor
                      ? 'Cuéntanos qué podemos mejorar...'
                      : 'Tu opinión (opcional)'
                  }
                  required={isPromoter || isDetractor}
                />
                {isPromoter && (
                  <p className="mt-1 text-xs text-gray-500">
                    Tu testimonio será público (tras revisión)
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center space-x-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: color }}
              >
                <Send className="h-5 w-5" />
                <span>{submitting ? 'Enviando...' : 'Enviar'}</span>
              </button>

              {isPassive && (
                <button
                  type="button"
                  onClick={() => {
                    setFeedback('')
                    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                  }}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Omitir
                </button>
              )}
            </form>
          </div>

          <button
            onClick={() => {
              setScore(null)
              setCategory(null)
              setStep('score')
            }}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Cambiar puntuación
          </button>
        </div>
      </div>
    )
  }

  // Score selection screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center h-16 w-16 rounded-full mb-4"
            style={{ backgroundColor: brandColor + '20' }}
          >
            <MessageSquare className="h-8 w-8" style={{ color: brandColor }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            ¿Qué probabilidad hay de que recomiendes {business.business_name}?
          </h1>
          <p className="text-gray-600">Tu opinión es muy importante para nosotros</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
          <div className="grid grid-cols-11 gap-1 md:gap-2 mb-6">
            {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as NpsScore[]).map((num) => {
              let bgColor = '#ef4444' // detractor
              if (link) {
                if (num >= link.nps_threshold_promoter) bgColor = '#10b981' // promoter
                else if (num >= link.nps_threshold_passive) bgColor = '#f59e0b' // passive
              }

              return (
                <button
                  key={num}
                  onClick={() => handleScoreSelect(num)}
                  className="aspect-square rounded-lg md:rounded-xl font-bold text-white text-sm md:text-lg transition-all hover:scale-110 hover:shadow-lg"
                  style={{ backgroundColor: bgColor }}
                >
                  {num}
                </button>
              )
            })}
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>Nada probable</span>
            <span>Muy probable</span>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">Tus respuestas son anónimas</p>
        </div>

        {userPlan === 'free' && (
          <div className="text-center mt-6">
            <p className="text-xs text-gray-400">
              Powered by{' '}
              <a href="https://testimonioya.com" className="text-indigo-600 hover:text-indigo-700">
                TestimonioYa
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
