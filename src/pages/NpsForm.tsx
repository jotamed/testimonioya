import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { MessageSquare, Send, AlertTriangle, ExternalLink } from 'lucide-react'
import { supabase, Business } from '../lib/supabase'
import { detectLanguage, t, SupportedLang } from '../lib/i18n'

type NpsScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
type NpsCategory = 'detractor' | 'passive' | 'promoter'

const getNpsCategory = (score: NpsScore): NpsCategory => {
  if (score <= 6) return 'detractor'
  if (score <= 8) return 'passive'
  return 'promoter'
}

export default function NpsForm() {
  const { slug } = useParams()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'score' | 'feedback' | 'thanks'>('score')
  const [score, setScore] = useState<NpsScore | null>(null)
  const [feedback, setFeedback] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lang, setLang] = useState<SupportedLang>('es')

  const _ = useMemo(() => (key: string, vars?: Record<string, string>) => t(lang, key, vars), [lang])

  useEffect(() => {
    loadBusiness()
  }, [slug])

  const loadBusiness = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        setBusiness(null)
        return
      }
      setBusiness(data)
      const defaultLang = (data.default_language || 'es') as SupportedLang
      setLang(detectLanguage(defaultLang))
    } catch (error) {
      console.error('Error loading business:', error)
      setBusiness(null)
    } finally {
      setLoading(false)
    }
  }

  const handleScoreSelect = (selectedScore: NpsScore) => {
    setScore(selectedScore)
    setStep('feedback')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (score === null || !business) return

    setSubmitting(true)
    const category = getNpsCategory(score)

    try {
      await supabase.from('nps_responses').insert({
        business_id: business.id,
        score,
        category,
        feedback: feedback || null,
        customer_name: customerName || null,
        customer_email: customerEmail || null,
      })

      if (category === 'promoter' && feedback.trim()) {
        await supabase.from('testimonials').insert({
          business_id: business.id,
          customer_name: customerName || 'Cliente',
          customer_email: customerEmail || null,
          text_content: feedback,
          rating: score >= 10 ? 5 : score >= 9 ? 5 : 4,
          source: 'nps',
          status: 'pending',
        })
      }

      setStep('thanks')
    } catch (error) {
      console.error('Error submitting NPS:', error)
      setError('Error al enviar. Inténtalo de nuevo.')
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

  if (!business) {
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

  const brandColor = business.brand_color || '#4f46e5'
  const category = score !== null ? getNpsCategory(score) : null
  const googleReviewsUrl = business.google_reviews_url

  const getCategoryConfig = (cat: NpsCategory) => ({
    title: _(`nps.${cat}.title`),
    subtitle: _(`nps.${cat}.subtitle`),
    placeholder: _(`nps.${cat}.placeholder`),
    buttonText: _(`nps.${cat}.button`),
    color: cat === 'detractor' ? '#ef4444' : cat === 'passive' ? '#f59e0b' : '#10b981',
    isPublic: cat === 'promoter',
  })

  const config = category ? getCategoryConfig(category) : null

  // Thanks screen
  if (step === 'thanks') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div 
              className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: (config?.color || '#10b981') + '20' }}
            >
              <span className="text-3xl">
                {category === 'promoter' ? '🎉' : category === 'passive' ? '🙏' : '💪'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {_('nps.thanks.title')}
            </h1>
            <p className="text-gray-600 mb-6">
              {category === 'promoter' 
                ? _('nps.thanks.promoter')
                : _('nps.thanks.other')}
            </p>

            {/* Google Reviews redirect for high NPS scores */}
            {score !== null && score >= (business.google_reviews_nps_threshold ?? 9) && googleReviewsUrl && (
              <a
                href={googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 px-6 mb-4 rounded-xl font-semibold text-white text-lg transition-all hover:opacity-90 hover:scale-[1.02] flex items-center justify-center space-x-3"
                style={{ backgroundColor: brandColor }}
              >
                <span>{_('nps.thanks.google')}</span>
                <ExternalLink className="h-5 w-5" />
              </a>
            )}

            <p className="text-sm text-gray-500">
              {_('nps.thanks.team', { business: business.business_name })}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Feedback form
  if (step === 'feedback' && score !== null && config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center justify-center h-20 w-20 rounded-full text-3xl font-bold text-white mb-4"
              style={{ backgroundColor: config.color }}
            >
              {score}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {config.title}
            </h1>
            <p className="text-gray-600">
              {config.subtitle}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {category === 'promoter' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {_('nps.name')}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="input-field"
                      placeholder={_('nps.name.placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {_('nps.email')} <span className="text-gray-400">{_('form.email.optional')}</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="input-field"
                      placeholder="tu@email.com"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {category === 'promoter' ? _('nps.experience') : _('nps.feedback')}
                  {category !== 'promoter' && <span className="text-gray-400"> {_('form.email.optional')}</span>}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder={config.placeholder}
                  required={category === 'promoter'}
                />
                {category === 'promoter' && (
                  <p className="mt-1 text-xs text-gray-500">{_('nps.public.hint')}</p>
                )}
                {category !== 'promoter' && (
                  <p className="mt-1 text-xs text-gray-500">{_('nps.private.hint')}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || (category === 'promoter' && !feedback.trim())}
                className="w-full py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center space-x-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: config.color }}
              >
                <Send className="h-5 w-5" />
                <span>{submitting ? _('form.submitting') : config.buttonText}</span>
              </button>

              {category !== 'promoter' && (
                <button
                  type="button"
                  onClick={() => {
                    setFeedback('')
                    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                  }}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  {_('nps.skip')}
                </button>
              )}
            </form>
          </div>

          <button
            onClick={() => {
              setScore(null)
              setStep('score')
            }}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            {_('nps.change')}
          </button>
        </div>
      </div>
    )
  }

  // Score selection
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
            {_('nps.title', { business: business.business_name })}
          </h1>
          <p className="text-gray-600">
            {_('nps.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
          <div className="grid grid-cols-11 gap-1 md:gap-2 mb-6">
            {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as NpsScore[]).map((num) => {
              let bgColor = '#ef4444'
              if (num >= 7 && num <= 8) bgColor = '#f59e0b'
              if (num >= 9) bgColor = '#10b981'
              
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
            <span>{_('nps.low')}</span>
            <span>{_('nps.high')}</span>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            {_('nps.anonymous')}
          </p>
        </div>

        {business.plan === 'free' && (
          <div className="text-center mt-6">
            <p className="text-xs text-gray-400">
              Powered by{' '}
              <a href="/" className="text-indigo-600 hover:text-indigo-700">
                TestimonioYa
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
