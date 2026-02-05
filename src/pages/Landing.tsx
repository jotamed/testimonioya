import { Link } from 'react-router-dom'
import { MessageSquare, Star, Zap, Globe, Shield, ArrowRight, Check, ChevronRight, Share2, QrCode, Mic } from 'lucide-react'

const testimonials = [
  { name: 'María García', biz: 'Clínica Dental Sonríe', text: 'Pasamos de tener 3 reseñas a más de 50 en dos meses. El muro de testimonios en nuestra web genera confianza desde el primer momento.', rating: 5 },
  { name: 'Carlos Ruiz', biz: 'CrossFit Barna', text: 'Comparto el enlace después de cada clase y los alumnos lo rellenan en 30 segundos. Simple y efectivo.', rating: 5 },
  { name: 'Ana Torres', biz: 'Consultoría AT', text: 'Mis casos de estudio ahora se escriben solos. Pido el testimonio, lo apruebo y ya tengo contenido para LinkedIn.', rating: 5 },
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
          <div className="inline-flex items-center bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <Zap className="h-4 w-4 mr-1.5" />
            Testimonios reales en minutos
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
            Convierte clientes felices
            <br />
            <span className="text-indigo-600">en tu mejor marketing</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Un enlace simple. Testimonios reales. Un muro que vende por ti.
            <br />
            Sin complicaciones, sin apps, sin fricción.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link to="/register" className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200">
              Crear cuenta gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <p className="text-sm text-gray-400">Sin tarjeta · Gratis para siempre · 2 min de setup</p>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                El problema que todos tienen
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl mt-0.5">✗</span>
                  <p className="text-gray-700">"¿Podrías dejarnos una reseña en Google?" → <span className="text-gray-400 italic">silencio</span></p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl mt-0.5">✗</span>
                  <p className="text-gray-700">Email pidiendo feedback → <span className="text-gray-400 italic">0.3% respuesta</span></p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl mt-0.5">✗</span>
                  <p className="text-gray-700">Formulario en la web → <span className="text-gray-400 italic">nadie lo encuentra</span></p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl mt-0.5">✗</span>
                  <p className="text-gray-700">Capturas de WhatsApp → <span className="text-gray-400 italic">poco profesional</span></p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Con TestimonioYa
              </h3>
              <div className="space-y-5">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Creas tu enlace personalizado</p>
                    <p className="text-sm text-gray-500">Con tu marca, tu mensaje, tu estilo</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Lo compartes donde quieras</p>
                    <p className="text-sm text-gray-500">WhatsApp, email, QR, redes sociales...</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Recibes testimonios reales</p>
                    <p className="text-sm text-gray-500">Apruébalos y muéstralos al mundo</p>
                  </div>
                </div>
              </div>
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
              Simple pero poderoso
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-indigo-50 border border-indigo-100">
              <Share2 className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Comparte donde quieras</h3>
              <p className="text-sm text-gray-600">WhatsApp, email, redes, SMS... Un enlace que funciona en todas partes.</p>
            </div>
            <div className="p-6 rounded-xl bg-purple-50 border border-purple-100">
              <Globe className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Tu muro de testimonios</h3>
              <p className="text-sm text-gray-600">Una página pública con tus mejores reseñas. Embébela en tu web o compártela.</p>
            </div>
            <div className="p-6 rounded-xl bg-green-50 border border-green-100">
              <Shield className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Tú tienes el control</h3>
              <p className="text-sm text-gray-600">Aprueba, rechaza o destaca. Solo publicas lo que quieras.</p>
            </div>
          </div>
          
          {/* Coming Soon Features */}
          <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <p className="text-sm font-medium text-amber-800 mb-3">🚀 Próximamente</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <QrCode className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-gray-700"><strong>QR físico</strong> - Imprime para mesas, mostrador, tarjetas</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mic className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-gray-700"><strong>Audio testimonios</strong> - Notas de voz de tus clientes</span>
              </div>
            </div>
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
              <p className="text-sm text-gray-500 mb-6">Para probar y empezar</p>
              <ul className="space-y-3 mb-8 text-sm">
                {['10 testimonios/mes', '1 enlace', 'Muro público', 'Marca TestimonioYa'].map((f, i) => (
                  <li key={i} className="flex items-center text-gray-700">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
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
                {['Testimonios ilimitados', 'Enlaces ilimitados', 'Sin marca', 'Widget embebido', 'Personalización total'].map((f, i) => (
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
                {['Todo lo de Pro', 'Hasta 5 negocios', 'Analíticas avanzadas', 'Soporte prioritario'].map((f, i) => (
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
            Tus clientes ya te recomiendan.
            <br />
            Solo falta que el mundo lo vea.
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Configúralo en 2 minutos. Gratis para siempre.
          </p>
          <Link to="/register" className="inline-flex items-center bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200">
            Crear mi cuenta
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
