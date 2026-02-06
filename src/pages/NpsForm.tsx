import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MessageSquare, Send, AlertTriangle } from 'lucide-react'
import { supabase, Business } from '../lib/supabase'

type NpsScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
type NpsCategory = 'detractor' | 'passive' | 'promoter'

const getNpsCategory = (score: NpsScore): NpsCategory => {
  if (score <= 6) return 'detractor'
  if (score <= 8) return 'passive'
  return 'promoter'
}

const getCategoryConfig = (category: NpsCategory) => {
  switch (category) {
    case 'detractor':
      return {
        title: 'Sentimos que tu experiencia no fue ideal',
        subtitle: '¿Qué podríamos haber hecho mejor?',
        placeholder: 'Cuéntanos qué pasó para poder mejorar...',
        buttonText: 'Enviar Feedback',
        color: '#ef4444',
        isPublic: false,
      }
    case 'passive':
      return {
        title: 'Gracias por tu opinión',
        subtitle: '¿Qué podríamos mejorar para darte un 10?',
        placeholder: 'Cuéntanos cómo podríamos mejorar...',
        buttonText: 'Enviar Sugerencia',
        color: '#f59e0b',
        isPublic: false,
      }
    case 'promoter':
      return {
        title: '¡Genial! Nos alegra mucho 🎉',
        subtitle: '¿Te importaría compartir tu experiencia?',
        placeholder: 'Cuéntanos qué te gustó más...',
        buttonText: 'Enviar Testimonio',
        color: '#10b981',
        isPublic: true,
      }
  }
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

      if (error) throw error
      setBusiness(data)
    } catch (error) {
      console.error('Error loading business:', error)
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
      // Save NPS response
      await supabase.from('nps_responses').insert({
        business_id: business.id,
        score,
        category,
        feedback: feedback || null,
        customer_name: customerName || null,
        customer_email: customerEmail || null,
      })

      // If promoter with feedback, also create a testimonial
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
      alert('Error al enviar. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
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
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No encontrado</h1>
          <p className="text-gray-600">Este enlace no existe o ha sido desactivado</p>
        </div>
      </div>
    )
  }

  const brandColor = business.brand_color || '#4f46e5'
  const category = score !== null ? getNpsCategory(score) : null
  const config = category ? getCategoryConfig(category) : null

  // Thanks screen
  if (step === 'thanks') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div 
              className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: config?.color + '20' }}
            >
              <span className="text-3xl">
                {category === 'promoter' ? '🎉' : category === 'passive' ? '🙏' : '💪'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Gracias por tu feedback!
            </h1>
            <p className="text-gray-600 mb-6">
              {category === 'promoter' 
                ? 'Tu testimonio será revisado y publicado pronto.' 
                : 'Tu opinión nos ayuda a mejorar cada día.'}
            </p>
            <p className="text-sm text-gray-500">
              — El equipo de {business.business_name}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Feedback form (after score selection)
  if (step === 'feedback' && score !== null && config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          {/* Score indicator */}
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

          {/* Feedback form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-5">
              {category === 'promoter' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tu nombre
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="input-field"
                      placeholder="¿Cómo te llamas?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-gray-400">(opcional)</span>
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
                  {category === 'promoter' ? 'Tu experiencia' : 'Tu feedback'}
                  {category !== 'promoter' && <span className="text-gray-400"> (opcional)</span>}
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
                  <p className="mt-1 text-xs text-gray-500">
                    Tu testimonio puede ser publicado en nuestra web
                  </p>
                )}
                {category !== 'promoter' && (
                  <p className="mt-1 text-xs text-gray-500">
                    Este feedback es privado y solo lo verá el equipo
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || (category === 'promoter' && !feedback.trim())}
                className="w-full py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center space-x-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: config.color }}
              >
                <Send className="h-5 w-5" />
                <span>{submitting ? 'Enviando...' : config.buttonText}</span>
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
                  Omitir y enviar solo puntuación
                </button>
              )}
            </form>
          </div>

          {/* Change score */}
          <button
            onClick={() => {
              setScore(null)
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

  // Score selection (initial screen)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div 
            className="inline-flex items-center justify-center h-16 w-16 rounded-full mb-4"
            style={{ backgroundColor: brandColor + '20' }}
          >
            <MessageSquare className="h-8 w-8" style={{ color: brandColor }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            ¿Cuánto recomendarías {business.business_name}?
          </h1>
          <p className="text-gray-600">
            Del 0 al 10, ¿qué probabilidad hay de que nos recomiendes a un amigo o colega?
          </p>
        </div>

        {/* NPS Scale */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
          {/* Score buttons */}
          <div className="grid grid-cols-11 gap-1 md:gap-2 mb-6">
            {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as NpsScore[]).map((num) => {
              let bgColor = '#ef4444' // red for 0-6
              if (num >= 7 && num <= 8) bgColor = '#f59e0b' // amber for 7-8
              if (num >= 9) bgColor = '#10b981' // green for 9-10
              
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

          {/* Scale labels */}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Nada probable</span>
            <span>Muy probable</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            Tu respuesta es anónima y nos ayuda a mejorar
          </p>
        </div>

        {/* Branding for free plan */}
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
