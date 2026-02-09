import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare, Star, ArrowRight, Check, ChevronDown,
  Send, Smartphone, Globe, BarChart3, Zap, Shield
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

export default function Landing() {
  useEffect(() => {
    updateSEO({
      title: 'TestimonioYa - Consigue más reseñas en Google sin esfuerzo',
      description: 'Pide testimonios por email o WhatsApp, redirige los mejores a Google Reviews y muestra un widget bonito en tu web. Gratis para empezar.',
      url: 'https://testimonioya.com',
      image: 'https://testimonioya.com/og-image.png',
    })
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
              <Link to="/register" className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                Empezar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <Star className="h-4 w-4 mr-1.5 fill-indigo-600 text-indigo-600" />
            La herramienta de testimonios para PYMEs españolas
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
            Consigue más reseñas
            <br />
            en Google{' '}
            <span className="text-indigo-600">sin esfuerzo</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Pide testimonios a tus clientes por email o WhatsApp, redirige los mejores a Google Reviews y muestra un widget bonito en tu web. Todo automático.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200"
            >
              Empieza gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <p className="text-sm text-gray-400">Sin tarjeta de crédito · Configurado en 2 minutos</p>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">
            Usado por negocios en toda España
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-3xl font-bold text-gray-900">500+</p>
              <p className="text-sm text-gray-500 mt-1">Testimonios recogidos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">4.9</p>
              <p className="text-sm text-gray-500 mt-1">Valoración media</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">85%</p>
              <p className="text-sm text-gray-500 mt-1">Tasa de respuesta</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">2 min</p>
              <p className="text-sm text-gray-500 mt-1">Para configurarlo</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Key Benefits */}
      <section id="beneficios" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para brillar en Google
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Tres funciones potentes que trabajan juntas para convertir clientes satisfechos en reseñas de 5 estrellas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
                <Send className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Pide testimonios en 1 click
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Envía solicitudes por email o WhatsApp directamente desde el dashboard. Tu cliente recibe un enlace bonito y responde en segundos.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-5">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Redirige a Google Reviews
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Los testimonios de 4-5 estrellas se redirigen automáticamente a Google. Los negativos se quedan como feedback privado para ti.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-5">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Widget bonito en tu web
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Muestra tus mejores testimonios con un widget elegante que se integra en cualquier web. Genera confianza y convierte visitantes en clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-20 bg-gradient-to-b from-indigo-50 to-white px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Así de fácil funciona
            </h2>
            <p className="text-gray-600">Tres pasos. Dos minutos. Cero complicaciones.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Configura</h3>
              <p className="text-gray-600">
                Crea tu cuenta, añade tu negocio y personaliza tu página de recogida de testimonios.
              </p>
            </div>

            {/* Arrow (hidden on mobile) */}
            <div className="hidden md:flex items-start justify-center pt-8">
              <div className="flex items-center text-indigo-300">
                <div className="h-0.5 w-full bg-indigo-200" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Envía</h3>
              <p className="text-gray-600">
                Manda solicitudes a tus clientes por email o WhatsApp. Ellos dejan su testimonio en 30 segundos.
              </p>
            </div>
          </div>

          {/* Step 3 centered below */}
          <div className="text-center mt-8 md:mt-12">
            <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Crece</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Los mejores testimonios van a Google automáticamente. Tu reputación online crece sin esfuerzo.
            </p>
          </div>
        </div>
      </section>

      {/* Extra Features Row */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Smartphone, label: 'WhatsApp nativo', desc: 'El canal #1 en España' },
              { icon: Zap, label: 'Automático', desc: 'Envía y olvídate' },
              { icon: Shield, label: 'Filtro inteligente', desc: 'Solo publicas lo bueno' },
              { icon: BarChart3, label: 'Analytics', desc: 'Métricas en tiempo real' },
            ].map((item, i) => (
              <div key={i} className="text-center p-5 rounded-xl bg-gray-50 border border-gray-100">
                <item.icon className="h-7 w-7 text-indigo-600 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
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
                    ? 'bg-indigo-600 shadow-xl ring-2 ring-indigo-600 relative'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                    MÁS POPULAR
                  </div>
                )}
                <h3 className={`text-lg font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="my-4">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    €{plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8 text-sm">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`flex items-center ${plan.highlighted ? 'text-white' : 'text-gray-700'}`}>
                      <Check className={`h-4 w-4 mr-2 flex-shrink-0 ${plan.highlighted ? 'text-indigo-200' : 'text-green-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block w-full text-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    plan.highlighted
                      ? 'bg-white text-indigo-600 hover:bg-gray-100'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
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
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white border border-gray-200 rounded-xl">
                <summary className="flex items-center justify-between cursor-pointer p-5 font-medium text-gray-900">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-indigo-600 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Empieza a recoger testimonios hoy
            <br />
            — es gratis
          </h2>
          <p className="text-lg text-indigo-200 mb-8">
            Configúralo en 2 minutos. Sin tarjeta. Sin compromiso.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all hover:shadow-lg"
          >
            Crear mi cuenta gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
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
