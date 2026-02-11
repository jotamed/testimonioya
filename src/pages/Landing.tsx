import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare, Star, ArrowRight, Check, ChevronDown,
  Send, Smartphone, Globe, BarChart3, Zap, Shield,
  Mail, ExternalLink, Sparkles, Clock, TrendingUp, Users
} from 'lucide-react'
import { updateSEO } from '../lib/seo'

const pricingPlans = [
  {
    name: 'Básico',
    price: '0',
    period: 'gratis para siempre',
    description: 'Para empezar a recoger testimonios',
    features: [
      '25 solicitudes/mes',
      '10 testimonios publicados',
      '1 enlace de recogida',
      'Muro público básico',
      'Marca TestimonioYa',
    ],
    cta: 'Empezar gratis',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '19',
    period: '/mes',
    description: 'Todo ilimitado para crecer',
    features: [
      'Solicitudes ilimitadas',
      'Testimonios ilimitados',
      'Email + WhatsApp',
      'Redirección a Google Reviews',
      'Widget embebido sin marca',
      'Dashboard completo',
      'Soporte prioritario',
    ],
    cta: 'Empezar con Pro',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '49',
    period: '/mes',
    description: 'Analytics avanzados + API',
    features: [
      'Todo lo de Pro',
      'Analytics avanzados',
      'Hasta 5 negocios',
      'Soporte dedicado',
    ],
    cta: 'Contactar ventas',
    highlighted: false,
  },
]

const faqs = [
  {
    q: '¿Cómo funciona la redirección a Google Reviews?',
    a: 'Cuando un cliente deja un testimonio positivo (4-5 estrellas), le mostramos automáticamente un enlace para que copie su reseña en Google. Tú no tienes que hacer nada.',
  },
  {
    q: '¿Necesito conocimientos técnicos?',
    a: 'Para nada. Creas tu cuenta, configuras tu negocio y en 2 minutos ya puedes enviar solicitudes de testimonio por email o WhatsApp. El widget se añade con un simple código.',
  },
  {
    q: '¿Puedo usar TestimonioYa con WhatsApp?',
    a: 'Sí. Puedes enviar solicitudes de testimonio directamente por WhatsApp con un solo click. Es el canal con mayor tasa de respuesta en España.',
  },
  {
    q: '¿Qué pasa si un cliente deja una reseña negativa?',
    a: 'Los testimonios negativos se quedan como feedback privado para ti. Solo los testimonios de 4-5 estrellas se publican en tu muro y se redirigen a Google.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, sin permanencia ni letra pequeña. Puedes pasar al plan gratuito cuando quieras y conservas tus testimonios.',
  },
]

// Fade-in animation hook
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

export default function Landing() {
  const heroVisual = useFadeIn()
  const benefitsSection = useFadeIn()
  const howItWorks = useFadeIn()
  const widgetSection = useFadeIn()

  useEffect(() => {
    updateSEO({
      title: 'TestimonioYa - Consigue más reseñas en Google sin esfuerzo',
      description: 'Pide testimonios por email o WhatsApp, redirige los mejores a Google Reviews y muestra un widget bonito en tu web. Gratis para empezar.',
      url: 'https://testimonioya.com',
      image: 'https://testimonioya.com/og-image.png',
    })

    // Load TestimonioYa widget
    const script = document.createElement('script')
    script.src = 'https://testimonioya.com/widget.js'
    script.setAttribute('data-business', 'cafe-el-aroma-yt4s')
    script.setAttribute('data-layout', 'grid')
    script.setAttribute('data-theme', 'light')
    script.setAttribute('data-max', '6')
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white scroll-smooth">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-7 w-7 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">TestimonioYa</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#beneficios" className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900 font-medium">
                Beneficios
              </a>
              <a href="#como-funciona" className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900 font-medium">
                Cómo funciona
              </a>
              <a href="#precios" className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900 font-medium">
                Precios
              </a>
              <Link to="/login" className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900 font-medium">
                Entrar
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md">
                Empezar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero with Visual Mockup */}
      <section className="pt-12 sm:pt-16 pb-12 sm:pb-20 px-4 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-lg shadow-indigo-200">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Recién lanzado — Sé de los primeros
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              Convierte clientes felices en
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                reseñas de Google
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Pide testimonios por email o WhatsApp. Los mejores van directo a Google. Los negativos se quedan como feedback privado.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5"
              >
                Empezar gratis ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors"
              >
                Ver cómo funciona
              </a>
            </div>
            <p className="text-sm text-gray-500">
              <Check className="h-4 w-4 inline text-green-600 mr-1" />
              Plan gratuito para siempre · Sin tarjeta · 2 minutos de configuración
            </p>
          </div>

          {/* Hero Visual: Dashboard Mockup */}
          <div
            ref={heroVisual.ref}
            className={`transition-all duration-1000 ${
              heroVisual.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="max-w-5xl mx-auto">
              {/* Floating testimonial cards mockup */}
              <div className="relative">
                {/* Main dashboard card */}
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8">
                  {/* Dashboard header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        CA
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Café El Aroma</div>
                        <div className="text-xs text-gray-500">testimonioya.com/cafe-el-aroma</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="hidden sm:flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                        Activo
                      </div>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <div className="text-2xl sm:text-3xl font-bold text-indigo-600">12</div>
                      <div className="text-xs text-gray-600 mt-1">Testimonios</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                      <div className="text-2xl sm:text-3xl font-bold text-green-600">4.8</div>
                      <div className="text-xs text-gray-600 mt-1">Media</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                      <div className="text-2xl sm:text-3xl font-bold text-purple-600">78%</div>
                      <div className="text-xs text-gray-600 mt-1">Respuestas</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                      <div className="text-2xl sm:text-3xl font-bold text-orange-600">8</div>
                      <div className="text-xs text-gray-600 mt-1">En Google</div>
                    </div>
                  </div>

                  {/* Recent testimonials preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-700">Últimos testimonios</div>
                      <button className="text-xs text-indigo-600 font-medium hover:underline">Ver todos</button>
                    </div>
                    
                    {/* Testimonial item 1 */}
                    <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-100 hover:border-indigo-200 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            MC
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">María C.</div>
                            <div className="flex text-yellow-400">
                              {'★★★★★'.split('').map((s, i) => <span key={i} className="text-xs">{s}</span>)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-green-600 font-medium">
                          <ExternalLink className="h-3 w-3" />
                          <span className="hidden sm:inline">Google</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">"El mejor café de la zona. Ambiente acogedor..."</p>
                    </div>

                    {/* Testimonial item 2 */}
                    <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-100 hover:border-indigo-200 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                            JP
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">Juan P.</div>
                            <div className="flex text-yellow-400">
                              {'★★★★★'.split('').map((s, i) => <span key={i} className="text-xs">{s}</span>)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-green-600 font-medium">
                          <ExternalLink className="h-3 w-3" />
                          <span className="hidden sm:inline">Google</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">"Personal súper amable y café de calidad..."</p>
                    </div>
                  </div>
                </div>

                {/* Floating action button */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 hidden sm:block">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-xl font-semibold text-sm flex items-center space-x-2 hover:shadow-2xl transition-shadow">
                    <Send className="h-4 w-4" />
                    <span>Pedir testimonio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits with Visual Elements */}
      <section
        id="beneficios"
        ref={benefitsSection.ref}
        className={`py-20 px-4 transition-all duration-1000 ${
          benefitsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para brillar en Google
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Tres funciones potentes. Un solo objetivo: más reseñas de 5 estrellas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1: Request */}
            <div className="group bg-gradient-to-b from-white to-blue-50/30 rounded-2xl border-2 border-gray-200 p-8 hover:border-indigo-300 hover:shadow-xl transition-all">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Send className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Pide en 1 click
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Envía solicitudes por email o WhatsApp. Tu cliente recibe un enlace bonito y responde en 30 segundos.
              </p>
              
              {/* Visual: Email/WhatsApp buttons */}
              <div className="space-y-2 bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">Enviar por Email</span>
                </div>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Enviar por WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Benefit 2: Filter */}
            <div className="group bg-gradient-to-b from-white to-green-50/30 rounded-2xl border-2 border-gray-200 p-8 hover:border-green-300 hover:shadow-xl transition-all">
              <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Star className="h-8 w-8 text-white fill-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Filtro inteligente
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                4-5 estrellas → Google Reviews automáticamente. 1-3 estrellas → Feedback privado solo para ti.
              </p>
              
              {/* Visual: Rating flow */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-yellow-400 text-sm">★★★★★</div>
                  <div className="flex items-center space-x-1">
                    <div className="text-xs text-green-600 font-medium">→ Google</div>
                    <ExternalLink className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex text-gray-300 text-sm">★★★<span className="text-yellow-400">★★</span></div>
                  <div className="flex items-center space-x-1">
                    <div className="text-xs text-green-600 font-medium">→ Google</div>
                    <ExternalLink className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex text-gray-300 text-sm">★★<span className="text-red-400">★★★</span></div>
                  <div className="text-xs text-gray-500 font-medium">→ Privado</div>
                </div>
              </div>
            </div>

            {/* Benefit 3: Widget */}
            <div className="group bg-gradient-to-b from-white to-purple-50/30 rounded-2xl border-2 border-gray-200 p-8 hover:border-purple-300 hover:shadow-xl transition-all">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Widget en tu web
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Muestra tus mejores testimonios con un widget elegante. Genera confianza y convierte visitantes en clientes.
              </p>
              
              {/* Visual: Mini widget mockup */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                <div className="bg-gradient-to-r from-gray-50 to-white rounded p-2 border border-gray-100 text-[10px] leading-tight">
                  <div className="flex items-center space-x-1 mb-1">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500" />
                    <div className="font-semibold text-gray-800">Ana M.</div>
                  </div>
                  <div className="flex text-yellow-400 text-[8px] mb-1">★★★★★</div>
                  <div className="text-gray-600">"Excelente servicio..."</div>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-white rounded p-2 border border-gray-100 text-[10px] leading-tight">
                  <div className="flex items-center space-x-1 mb-1">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500" />
                    <div className="font-semibold text-gray-800">Luis R.</div>
                  </div>
                  <div className="flex text-yellow-400 text-[8px] mb-1">★★★★★</div>
                  <div className="text-gray-600">"Muy recomendable..."</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works with Visual Flow */}
      <section
        id="como-funciona"
        ref={howItWorks.ref}
        className={`py-20 bg-gradient-to-b from-indigo-50 via-purple-50/30 to-white px-4 transition-all duration-1000 ${
          howItWorks.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Así de fácil funciona
            </h2>
            <p className="text-gray-600">Tres pasos. Dos minutos. Cero complicaciones.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="text-center">
                <div className="h-20 w-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-xl">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Configura tu negocio</h3>
                <p className="text-gray-600 mb-6">
                  Crea tu cuenta y personaliza tu página de testimonios en menos de 2 minutos.
                </p>
                
                {/* Visual: Config mockup */}
                <div className="bg-white rounded-xl p-4 border-2 border-indigo-200 shadow-lg">
                  <div className="space-y-2 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500" />
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded w-3/4 mb-1" />
                        <div className="h-1.5 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded border border-indigo-100" />
                    <div className="h-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded border border-indigo-100" />
                    <div className="h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded flex items-center justify-center text-white text-xs font-semibold">
                      Guardar
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Arrow */}
              <div className="hidden md:block absolute top-10 -right-8 text-indigo-300">
                <ArrowRight className="h-8 w-8" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="text-center">
                <div className="h-20 w-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-xl">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Pide testimonios</h3>
                <p className="text-gray-600 mb-6">
                  Envía solicitudes por email o WhatsApp. Tus clientes responden en 30 segundos desde su móvil.
                </p>
                
                {/* Visual: Phone mockup */}
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-3 border-4 border-gray-700 shadow-2xl max-w-[200px] mx-auto">
                  <div className="bg-white rounded-2xl p-3 space-y-2">
                    <div className="text-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mx-auto mb-2" />
                      <div className="text-[10px] font-bold text-gray-900">Café El Aroma</div>
                      <div className="text-[8px] text-gray-500">te pide tu opinión</div>
                    </div>
                    <div className="flex justify-center space-x-1 my-3">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                          ★
                        </div>
                      ))}
                    </div>
                    <div className="h-12 bg-gray-50 border border-gray-200 rounded-lg" />
                    <div className="h-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Send className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Arrow */}
              <div className="hidden md:block absolute top-10 -right-8 text-indigo-300">
                <ArrowRight className="h-8 w-8" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="text-center">
                <div className="h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-xl">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Crece en Google</h3>
                <p className="text-gray-600 mb-6">
                  Los testimonios de 4-5 estrellas se redirigen automáticamente a Google Reviews. Sin hacer nada.
                </p>
                
                {/* Visual: Google redirect */}
                <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-lg">
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex text-yellow-400 text-sm">★★★★★</div>
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-[10px] text-gray-600">→</span>
                        <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded border border-gray-200">
                          <div className="h-3 w-3 rounded-sm bg-gradient-to-br from-blue-500 to-green-500" />
                          <span className="text-[9px] font-semibold text-gray-700">Google</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-700 font-medium">+8 reseñas este mes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Testimonials Widget */}
      <section
        ref={widgetSection.ref}
        className={`py-20 px-4 bg-gradient-to-b from-gray-50 to-white transition-all duration-1000 ${
          widgetSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              <Check className="h-4 w-4 mr-1.5" />
              Testimonios reales de nuestro producto
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Mira cómo funciona el widget
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Esto es lo que ven tus visitantes cuando añades TestimonioYa a tu web. Testimonios reales de Café El Aroma (nuestro negocio de prueba).
            </p>
          </div>

          {/* Widget container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-10">
            <div id="testimonioya-widget" className="min-h-[300px] flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-sm">Cargando testimonios...</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 mb-4">
              💡 Así de fácil: un script, tu web brilla con prueba social real
            </p>
            <Link
              to="/register"
              className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Añadir este widget a mi web
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Extra Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Y además...</h3>
            <p className="text-gray-600">Todo lo que necesitas incluido</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Smartphone, label: 'WhatsApp nativo', desc: 'El canal #1 en España', color: 'from-green-500 to-emerald-600' },
              { icon: Zap, label: 'Automático', desc: 'Envía y olvídate', color: 'from-yellow-500 to-orange-600' },
              { icon: Shield, label: 'Filtro inteligente', desc: 'Solo publicas lo bueno', color: 'from-blue-500 to-indigo-600' },
              { icon: BarChart3, label: 'Analytics', desc: 'Métricas en tiempo real', color: 'from-purple-500 to-pink-600' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all group">
                <div className={`h-14 w-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Adopter CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 sm:p-12 text-center shadow-2xl border-4 border-white">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Clock className="h-4 w-4 mr-2" />
              Oferta de lanzamiento
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Sé de los primeros en TestimonioYa
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Acabamos de lanzar. El plan gratuito es <strong>gratis para siempre</strong>. Sin trucos. Sin letra pequeña. 
              Empieza hoy y crece con nosotros.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
              >
                <Users className="mr-2 h-5 w-5" />
                Unirme ahora
              </Link>
              <a
                href="#precios"
                className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Ver planes
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-20 bg-gray-50 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Precios simples y transparentes
            </h2>
            <p className="text-gray-600">Empieza gratis. Crece cuando lo necesites.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-indigo-600 to-purple-600 shadow-2xl ring-4 ring-indigo-300 relative transform scale-105'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    ⭐ MÁS POPULAR
                  </div>
                )}
                <h3 className={`text-lg font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="my-4">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    €{plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8 text-sm">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`flex items-center ${plan.highlighted ? 'text-white' : 'text-gray-700'}`}>
                      <Check className={`h-5 w-5 mr-2 flex-shrink-0 ${plan.highlighted ? 'text-green-300' : 'text-green-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block w-full text-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    plan.highlighted
                      ? 'bg-white text-indigo-600 hover:bg-gray-100 shadow-lg'
                      : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-gray-600">Todo lo que necesitas saber</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:border-indigo-200 transition-colors">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Empieza a recoger testimonios hoy
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Configúralo en 2 minutos. Gratis para siempre. Sin tarjeta. Sin compromiso.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-white text-indigo-600 px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1"
          >
            <Sparkles className="mr-2 h-6 w-6" />
            Crear mi cuenta gratis
            <ArrowRight className="ml-2 h-6 w-6" />
          </Link>
          <p className="mt-6 text-sm text-indigo-200">
            ✓ Plan gratuito para siempre &nbsp;•&nbsp; ✓ Sin tarjeta de crédito &nbsp;•&nbsp; ✓ Cancelable cuando quieras
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-6 w-6 text-indigo-600" />
                <span className="text-lg font-bold text-gray-900">TestimonioYa</span>
              </div>
              <p className="text-sm text-gray-600 max-w-xs">
                La forma más fácil de conseguir reseñas en Google para tu negocio. Pide, filtra y publica testimonios de tus mejores clientes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#beneficios" className="text-gray-600 hover:text-gray-900">Beneficios</a></li>
                <li><a href="#como-funciona" className="text-gray-600 hover:text-gray-900">Cómo funciona</a></li>
                <li><a href="#precios" className="text-gray-600 hover:text-gray-900">Precios</a></li>
                <li><a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/legal/terms" className="text-gray-600 hover:text-gray-900">Términos de Servicio</Link></li>
                <li><Link to="/legal/privacy" className="text-gray-600 hover:text-gray-900">Política de Privacidad</Link></li>
                <li><Link to="/legal/cookies" className="text-gray-600 hover:text-gray-900">Política de Cookies</Link></li>
                <li><a href="mailto:hola@testimonioya.com" className="text-gray-600 hover:text-gray-900">Contacto</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 sm:mb-0">
              © {new Date().getFullYear()} TestimonioYa. Hecho con ❤️ en España.
            </p>
            <a href="mailto:hola@testimonioya.com" className="text-sm text-gray-500 hover:text-gray-700">
              hola@testimonioya.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
