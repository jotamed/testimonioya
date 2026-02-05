import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

const industries = [
  { id: 'coach', name: 'Coach / Consultor', emoji: '💼', description: 'Coaching, consultoría, mentoring' },
  { id: 'fitness', name: 'Fitness / Entrenador', emoji: '💪', description: 'Gimnasio, PT, yoga, pilates' },
  { id: 'belleza', name: 'Belleza / Estética', emoji: '💇', description: 'Peluquería, uñas, spa, estética' },
  { id: 'salud', name: 'Clínica / Salud', emoji: '🏥', description: 'Dental, fisio, psicología, médico' },
  { id: 'restaurante', name: 'Restaurante / Hostelería', emoji: '🍽️', description: 'Restaurante, bar, café, hotel' },
  { id: 'formacion', name: 'Formación / Cursos', emoji: '📚', description: 'Academia, cursos online, tutorías' },
  { id: 'inmobiliaria', name: 'Inmobiliaria', emoji: '🏠', description: 'Venta, alquiler, gestión' },
  { id: 'servicios', name: 'Servicios Profesionales', emoji: '🔧', description: 'Abogado, contable, técnico' },
  { id: 'ecommerce', name: 'E-commerce / Tienda', emoji: '🛒', description: 'Tienda online, retail' },
  { id: 'otro', name: 'Otro', emoji: '✨', description: 'Otro tipo de negocio' },
]

// Tips based on industry
const industryTips: Record<string, { welcomeMessage: string; firstLinkName: string }> = {
  coach: {
    welcomeMessage: '¡Gracias por compartir tu experiencia! Tu testimonio ayuda a otros a tomar la decisión de transformar sus vidas.',
    firstLinkName: 'Clientes Satisfechos',
  },
  fitness: {
    welcomeMessage: '¡Gracias por ser parte de nuestra comunidad! Cuéntanos cómo ha sido tu transformación.',
    firstLinkName: 'Transformaciones',
  },
  belleza: {
    welcomeMessage: '¡Gracias por confiar en nosotros! Tu opinión nos ayuda a seguir mejorando.',
    firstLinkName: 'Opiniones de Clientas',
  },
  salud: {
    welcomeMessage: 'Gracias por compartir tu experiencia. Tu testimonio ayuda a otros pacientes a encontrar la atención que necesitan.',
    firstLinkName: 'Experiencias de Pacientes',
  },
  restaurante: {
    welcomeMessage: '¡Gracias por visitarnos! Nos encantaría saber qué te pareció la experiencia.',
    firstLinkName: 'Opiniones de Comensales',
  },
  formacion: {
    welcomeMessage: '¡Gracias por aprender con nosotros! Cuéntanos cómo te ha ayudado el curso.',
    firstLinkName: 'Testimonios de Alumnos',
  },
  inmobiliaria: {
    welcomeMessage: 'Gracias por confiar en nosotros para encontrar tu hogar. ¿Cómo fue tu experiencia?',
    firstLinkName: 'Clientes Satisfechos',
  },
  servicios: {
    welcomeMessage: '¡Gracias por trabajar con nosotros! Tu opinión nos ayuda a mejorar.',
    firstLinkName: 'Testimonios de Clientes',
  },
  ecommerce: {
    welcomeMessage: '¡Gracias por tu compra! Cuéntanos qué te pareció el producto.',
    firstLinkName: 'Reseñas de Productos',
  },
  otro: {
    welcomeMessage: '¡Gracias por tu tiempo! Tu opinión es muy importante para nosotros.',
    firstLinkName: 'Testimonios',
  },
}

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    // Store industry selection for after OAuth
    if (industry) {
      localStorage.setItem('pending_industry', industry)
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard?onboarding=true`,
      },
    })
    if (error) setError(error.message)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Register user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Error al crear usuario')

      // Get industry-specific defaults
      const tips = industryTips[industry] || industryTips.otro
      
      // Create business with industry
      const slug = generateSlug(businessName) + '-' + Math.random().toString(36).substr(2, 4)
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: authData.user.id,
          business_name: businessName,
          slug,
          plan: 'free',
          industry,
          welcome_message: tips.welcomeMessage,
        })
        .select()
        .single()

      if (businessError) throw businessError

      // Create first collection link with industry-appropriate name
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
      setError(err.message || 'Error al crear cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <MessageSquare className="h-10 w-10 text-indigo-600" />
            <span className="text-3xl font-bold text-gray-900">TestimonioYa</span>
          </Link>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 1 ? '¿Qué tipo de negocio tienes?' : 'Crea tu cuenta'}
          </h1>
          <p className="text-gray-600">
            {step === 1 ? 'Personalizaremos tu experiencia' : 'Comienza a recolectar testimonios'}
          </p>
        </div>

        {/* Step 1: Industry Selection */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
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

        {/* Step 2: Account Creation */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Selected industry badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{industries.find(i => i.id === industry)?.emoji}</span>
                <span className="text-sm font-medium text-gray-600">
                  {industries.find(i => i.id === industry)?.name}
                </span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Cambiar
              </button>
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 border-2 border-gray-200 rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-6"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continuar con Google</span>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">o con email</span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de tu {industries.find(i => i.id === industry)?.name.toLowerCase() || 'negocio'}
                </label>
                <input
                  id="businessName"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="input-field"
                  placeholder={industry === 'coach' ? 'Ej: Coaching Ana García' : 
                              industry === 'fitness' ? 'Ej: CrossFit Barcelona' :
                              industry === 'restaurante' ? 'Ej: Restaurante El Fogón' :
                              'Mi Negocio'}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
              </button>
            </form>

            {/* Benefits reminder */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center mb-3">Incluido gratis:</p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                <span className="flex items-center"><Check className="h-3 w-3 text-green-500 mr-1" />10 testimonios/mes</span>
                <span className="flex items-center"><Check className="h-3 w-3 text-green-500 mr-1" />Muro público</span>
                <span className="flex items-center"><Check className="h-3 w-3 text-green-500 mr-1" />QR</span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Inicia sesión
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
