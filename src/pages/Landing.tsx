import { Link } from 'react-router-dom'
import { MessageSquare, Star, Globe, ArrowRight, Check, ChevronRight, BarChart3, Mail, Sparkles } from 'lucide-react'

const testimonials = [
  { name: 'María García', biz: 'Clínica Dental Sonríe', text: 'El sistema NPS nos salvó de 3 reseñas negativas. Atendimos a clientes insatisfechos ANTES de que fueran a Google.', rating: 5 },
  { name: 'Carlos Ruiz', biz: 'CrossFit Barna', text: 'NPS de +72. Solo pedimos testimonio a los promotores y tenemos un Wall of Love brutal.', rating: 5 },
  { name: 'Ana Torres', biz: 'Consultoría AT', text: 'Pasé de pedir testimonios a ciegas a saber exactamente quién me ama. Conversión del 80% en promotores.', rating: 5 },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-7 w-7 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">TestimonioYa</span>
            </div>
            <div className="flex items-center space-x-3">
              <a href="#pricing" className="hidden sm:inline text-gray-600 hover:text-gray-900 text-sm font-medium">
                Precios
              </a>
              <a href="#como-funciona" className="hidden sm:inline text-gray-600 hover:text-gray-900 text-sm font-medium">
                Cómo funciona
              </a>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Entrar
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                Empezar gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-green-50 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <Sparkles className="h-4 w-4 mr-1.5" />
            Solo testimonios de clientes que te aman
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
            Testimonios de 5 estrellas.
            <br />
            <span className="text-indigo-600">Garantizado.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Primero pregunta NPS. Solo los promotores (9-10) dan testimonio público.
            <br />
            Los detractores te dan feedback privado antes de ir a Google.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link to="/register" className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200">
              Empezar gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <p className="text-sm text-gray-400">Sin tarjeta · 25 encuestas NPS gratis/mes</p>
        </div>
      </section>

      {/* NPS Flow Visual */}
      <section id="como-funciona" className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              El sistema inteligente
            </h2>
            <p className="text-gray-600">Filtra antes de pedir. Solo publicas lo bueno.</p>
          </div>

          {/* Flow Diagram */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            {/* Step 1 */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4 bg-indigo-50 rounded-xl px-6 py-4">
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Cliente compra o usa tu servicio</p>
                  <p className="text-sm text-gray-500">Envías encuesta NPS automática</p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-8">
              <div className="h-8 w-0.5 bg-gray-300"></div>
            </div>

            {/* Step 2 - NPS Question */}
            <div className="text-center mb-8">
              <p className="text-lg font-medium text-gray-700 mb-4">
                "¿Del 0 al 10, cuánto nos recomendarías?"
              </p>
              <div className="flex justify-center gap-1">
                {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                  <div 
                    key={n}
                    className={`h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm
                      ${n <= 6 ? 'bg-red-500' : n <= 8 ? 'bg-amber-500' : 'bg-green-500'}`}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-8">
              <div className="h-8 w-0.5 bg-gray-300"></div>
            </div>

            {/* Step 3 - Segmentation */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Detractors */}
              <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">🔴</span>
                  <span className="font-bold text-red-700">0-6 Detractores</span>
                </div>
                <p className="text-sm text-red-800 mb-3">
                  "¿Qué salió mal?"
                </p>
                <div className="bg-red-100 rounded-lg p-3 text-xs text-red-700">
                  → Feedback PRIVADO<br/>
                  → Alerta a tu equipo<br/>
                  → Salvas la relación
                </div>
              </div>

              {/* Passives */}
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">🟡</span>
                  <span className="font-bold text-amber-700">7-8 Pasivos</span>
                </div>
                <p className="text-sm text-amber-800 mb-3">
                  "¿Cómo podemos mejorar?"
                </p>
                <div className="bg-amber-100 rounded-lg p-3 text-xs text-amber-700">
                  → Sugerencias internas<br/>
                  → Mejora continua<br/>
                  → No se publica
                </div>
              </div>

              {/* Promoters */}
              <div className="bg-green-50 rounded-xl p-5 border border-green-100 ring-2 ring-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">🟢</span>
                  <span className="font-bold text-green-700">9-10 Promotores</span>
                </div>
                <p className="text-sm text-green-800 mb-3">
                  "¡Genial! ¿Nos dejas testimonio?"
                </p>
                <div className="bg-green-100 rounded-lg p-3 text-xs text-green-700">
                  → Testimonio público<br/>
                  → Wall of Love<br/>
                  → Widget en tu web
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                El problema de pedir testimonios a ciegas
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl mt-0.5">✗</span>
                  <p className="text-gray-700">Pides a un cliente insatisfecho → <span className="text-red-500 font-medium">reseña negativa en Google</span></p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl mt-0.5">✗</span>
                  <p className="text-gray-700">No sabes quién está contento → <span className="text-gray-400 italic">disparas a ciegas</span></p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl mt-0.5">✗</span>
                  <p className="text-gray-700">Email genérico de feedback → <span className="text-gray-400 italic">2% respuesta</span></p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl mt-0.5">✗</span>
                  <p className="text-gray-700">Feedback negativo público → <span className="text-red-500 font-medium">daño de reputación</span></p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Con el sistema NPS-First
              </h3>
              <div className="space-y-5">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Filtras antes de pedir</p>
                    <p className="text-sm text-gray-500">Solo promotores reciben solicitud de testimonio</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Capturas lo negativo en privado</p>
                    <p className="text-sm text-gray-500">Arreglas problemas antes de que sean públicos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Métricas NPS reales</p>
                    <p className="text-sm text-gray-500">Sabes tu score y cómo mejorar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-indigo-600">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <p className="text-4xl font-bold">80%</p>
              <p className="text-indigo-200 text-sm mt-1">de promotores dejan testimonio</p>
            </div>
            <div>
              <p className="text-4xl font-bold">5x</p>
              <p className="text-indigo-200 text-sm mt-1">más conversión que pedir a ciegas</p>
            </div>
            <div>
              <p className="text-4xl font-bold">0</p>
              <p className="text-indigo-200 text-sm mt-1">reseñas negativas públicas</p>
            </div>
            <div>
              <p className="text-4xl font-bold">+67</p>
              <p className="text-indigo-200 text-sm mt-1">NPS promedio de usuarios</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Lo que dicen los que lo usan
            </h2>
            <p className="text-gray-600">Negocios reales, resultados reales</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">"{t.text}"</p>
                <div className="pt-3 border-t border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.biz}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Funciona para cualquier negocio
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '💼', name: 'Coaches' },
              { emoji: '💪', name: 'Fitness' },
              { emoji: '🏥', name: 'Clínicas' },
              { emoji: '🍽️', name: 'Restaurantes' },
              { emoji: '💇', name: 'Belleza' },
              { emoji: '🏠', name: 'Inmobiliarias' },
              { emoji: '📚', name: 'Formación' },
              { emoji: '🛒', name: 'E-commerce' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-indigo-300 transition-colors">
                <span className="text-3xl">{item.emoji}</span>
                <p className="text-sm font-medium text-gray-700 mt-2">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Todo lo que necesitas
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-indigo-50 border border-indigo-100">
              <BarChart3 className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Dashboard NPS</h3>
              <p className="text-sm text-gray-600">Tu score NPS en tiempo real. Evolución, breakdown por categoría, alertas.</p>
            </div>
            <div className="p-6 rounded-xl bg-purple-50 border border-purple-100">
              <Globe className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Wall of Love</h3>
              <p className="text-sm text-gray-600">Página pública con tus mejores testimonios. Embébela en tu web.</p>
            </div>
            <div className="p-6 rounded-xl bg-green-50 border border-green-100">
              <Mail className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Email Automático</h3>
              <p className="text-sm text-gray-600">Envía NPS post-compra automáticamente. Sin esfuerzo manual.</p>
            </div>
          </div>
          
          {/* More features */}
          <div className="mt-6 grid md:grid-cols-4 gap-4">
            {[
              { icon: '🎬', title: 'Video testimonios', desc: 'Graban desde el móvil' },
              { icon: '🎙️', title: 'Audio testimonios', desc: 'Notas de voz' },
              { icon: '📱', title: 'QR físico', desc: 'Para mesas o tarjetas' },
              { icon: '🔗', title: 'Widget embed', desc: 'En cualquier web' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <span className="text-2xl">{f.icon}</span>
                <p className="font-medium text-gray-900 text-sm mt-2">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Precios claros</h2>
            <p className="text-gray-600">Empieza gratis. Crece cuando lo necesites.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-white rounded-2xl p-7 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Gratis</h3>
              <div className="my-4">
                <span className="text-4xl font-bold text-gray-900">€0</span>
                <span className="text-gray-500 text-sm">/mes</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">Para probar el sistema</p>
              <ul className="space-y-3 mb-8 text-sm">
                {[
                  '25 encuestas NPS/mes',
                  '10 testimonios/mes',
                  '1 enlace',
                  'Muro público',
                  'NPS Score básico',
                ].map((f, i) => (
                  <li key={i} className="flex items-center text-gray-700">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-gray-400 mb-4">
                Solo texto · Marca TestimonioYa
              </div>
              <Link to="/register" className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                Empezar gratis
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-indigo-600 rounded-2xl p-7 shadow-xl ring-2 ring-indigo-600 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="text-lg font-bold text-white">Pro</h3>
              <div className="my-4">
                <span className="text-4xl font-bold text-white">€19</span>
                <span className="text-indigo-200 text-sm">/mes</span>
              </div>
              <p className="text-sm text-indigo-200 mb-6">Para negocios que quieren crecer</p>
              <ul className="space-y-3 mb-8 text-sm">
                {[
                  'NPS ilimitados',
                  'Testimonios ilimitados',
                  'Audio + Video',
                  'Email automático',
                  'Dashboard NPS completo',
                  'Widget embebido',
                  'Sin marca',
                ].map((f, i) => (
                  <li key={i} className="flex items-center text-white">
                    <Check className="h-4 w-4 text-indigo-200 mr-2 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full text-center bg-white text-indigo-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm">
                Empezar ahora
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-white rounded-2xl p-7 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Premium</h3>
              <div className="my-4">
                <span className="text-4xl font-bold text-gray-900">€49</span>
                <span className="text-gray-500 text-sm">/mes</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">Para agencias y multi-negocio</p>
              <ul className="space-y-3 mb-8 text-sm">
                {[
                  'Todo lo de Pro',
                  'Hasta 5 negocios',
                  'Analytics avanzados',
                  'API / Webhooks',
                  'Integraciones (Zapier)',
                  'White-label',
                  'Soporte prioritario',
                ].map((f, i) => (
                  <li key={i} className="flex items-center text-gray-700">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                Empezar ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Deja de pedir testimonios a ciegas.
            <br />
            Pregunta NPS primero.
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Configúralo en 2 minutos. 25 encuestas gratis cada mes.
          </p>
          <Link to="/register" className="inline-flex items-center bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200">
            Crear mi cuenta gratis
            <ChevronRight className="ml-1 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-gray-900">TestimonioYa</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} TestimonioYa. Hecho en Barcelona 🇪🇸
          </p>
        </div>
      </footer>
    </div>
  )
}
