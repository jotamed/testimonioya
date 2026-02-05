import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, ArrowRight, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'

const industries = [
  { id: 'coach', name: 'Coach / Consultor', emoji: '💼' },
  { id: 'fitness', name: 'Fitness / Entrenador', emoji: '💪' },
  { id: 'belleza', name: 'Belleza / Estética', emoji: '💇' },
  { id: 'salud', name: 'Clínica / Salud', emoji: '🏥' },
  { id: 'restaurante', name: 'Restaurante / Hostelería', emoji: '🍽️' },
  { id: 'formacion', name: 'Formación / Cursos', emoji: '📚' },
  { id: 'inmobiliaria', name: 'Inmobiliaria', emoji: '🏠' },
  { id: 'servicios', name: 'Servicios Profesionales', emoji: '🔧' },
  { id: 'ecommerce', name: 'E-commerce / Tienda', emoji: '🛒' },
  { id: 'otro', name: 'Otro', emoji: '✨' },
]

const industryTips: Record<string, { welcomeMessage: string; firstLinkName: string; placeholder: string }> = {
  coach: {
    welcomeMessage: '¡Gracias por compartir tu experiencia! Tu testimonio ayuda a otros a tomar la decisión de transformar sus vidas.',
    firstLinkName: 'Clientes Satisfechos',
    placeholder: 'Ej: Coaching Ana García',
  },
  fitness: {
    welcomeMessage: '¡Gracias por ser parte de nuestra comunidad! Cuéntanos cómo ha sido tu transformación.',
    firstLinkName: 'Transformaciones',
    placeholder: 'Ej: CrossFit Barcelona',
  },
  belleza: {
    welcomeMessage: '¡Gracias por confiar en nosotros! Tu opinión nos ayuda a seguir mejorando.',
    firstLinkName: 'Opiniones de Clientas',
    placeholder: 'Ej: Salón María',
  },
  salud: {
    welcomeMessage: 'Gracias por compartir tu experiencia. Tu testimonio ayuda a otros pacientes.',
    firstLinkName: 'Experiencias de Pacientes',
    placeholder: 'Ej: Clínica Dental Sonrisa',
  },
  restaurante: {
    welcomeMessage: '¡Gracias por visitarnos! Nos encantaría saber qué te pareció.',
    firstLinkName: 'Opiniones de Comensales',
    placeholder: 'Ej: Restaurante El Fogón',
  },
  formacion: {
    welcomeMessage: '¡Gracias por aprender con nosotros! Cuéntanos cómo te ha ayudado.',
    firstLinkName: 'Testimonios de Alumnos',
    placeholder: 'Ej: Academia de Inglés',
  },
  inmobiliaria: {
    welcomeMessage: 'Gracias por confiar en nosotros. ¿Cómo fue tu experiencia?',
    firstLinkName: 'Clientes Satisfechos',
    placeholder: 'Ej: Inmobiliaria Costa',
  },
  servicios: {
    welcomeMessage: '¡Gracias por trabajar con nosotros! Tu opinión nos ayuda a mejorar.',
    firstLinkName: 'Testimonios de Clientes',
    placeholder: 'Ej: Abogados López',
  },
  ecommerce: {
    welcomeMessage: '¡Gracias por tu compra! Cuéntanos qué te pareció.',
    firstLinkName: 'Reseñas de Productos',
    placeholder: 'Ej: Mi Tienda Online',
  },
  otro: {
    welcomeMessage: '¡Gracias por tu tiempo! Tu opinión es muy importante para nosotros.',
    firstLinkName: 'Testimonios',
    placeholder: 'Ej: Mi Negocio',
  },
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [industry, setIndustry] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/register')
      return
    }

    // Check if user already has a business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (business) {
      // Already onboarded, go to dashboard
      navigate('/dashboard')
      return
    }

    setCheckingAuth(false)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay sesión activa')

      const tips = industryTips[industry] || industryTips.otro
      const slug = generateSlug(businessName) + '-' + Math.random().toString(36).substr(2, 4)

      // Create business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          business_name: businessName,
          slug,
          plan: 'free',
          industry,
          welcome_message: tips.welcomeMessage,
        })
        .select()
        .single()

      if (businessError) throw businessError

      // Create first collection link
      if (businessData) {
        const linkSlug = generateSlug(tips.firstLinkName) + '-' + Math.random().toString(36).substr(2, 6)
        await supabase
          .from('collection_links')
          .insert({
            business_id: businessData.id,
            name: tips.firstLinkName,
            slug: linkSlug,
          })
      }

      navigate('/dashboard?welcome=true')
    } catch (err: any) {
      setError(err.message || 'Error al configurar tu negocio')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <MessageSquare className="h-12 w-12 text-indigo-600 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
            <Sparkles className="h-8 w-8 text-indigo-600" />
          </div>
          
          {/* Progress */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className={`h-2 w-20 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`h-2 w-20 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 1 ? '¡Casi listo!' : 'Último paso'}
          </h1>
          <p className="text-gray-600">
            {step === 1 
              ? 'Cuéntanos sobre tu negocio para personalizar tu experiencia' 
              : 'Dale un nombre a tu negocio'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Step 1: Industry */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-4">¿Qué tipo de negocio tienes?</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {industries.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => setIndustry(ind.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    industry === ind.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <span className="text-2xl mb-1 block">{ind.emoji}</span>
                  <p className="font-medium text-gray-900 text-sm">{ind.name}</p>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setStep(2)}
              disabled={!industry}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continuar</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Step 2: Business Name */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-2 mb-6 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">{industries.find(i => i.id === industry)?.emoji}</span>
              <span className="text-sm font-medium text-gray-600">
                {industries.find(i => i.id === industry)?.name}
              </span>
              <button
                onClick={() => setStep(1)}
                className="ml-auto text-xs text-indigo-600 hover:text-indigo-700"
              >
                Cambiar
              </button>
            </div>

            <div className="mb-6">
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de tu negocio
              </label>
              <input
                id="businessName"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="input-field text-lg"
                placeholder={industryTips[industry]?.placeholder || 'Mi Negocio'}
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                Este nombre aparecerá en tu muro de testimonios y formularios
              </p>
            </div>
            
            <button
              onClick={handleComplete}
              disabled={loading || !businessName.trim()}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Configurando...</span>
              ) : (
                <>
                  <span>Empezar a recolectar testimonios</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
