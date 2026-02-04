import { Link } from 'react-router-dom'
import { MessageSquare, Sparkles, Link as LinkIcon, Award, Check } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">TestimonioYa</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn-primary">
                Comenzar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Recolecta testimonios por <span className="text-indigo-600">WhatsApp</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
              La forma más fácil de recopilar y mostrar reseñas de tus clientes. 
              Aumenta tu credibilidad y convierte más visitantes en clientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Comenzar Gratis
              </Link>
              <a href="#features" className="btn-secondary text-lg px-8 py-4">
                Ver Características
              </a>
            </div>
            <p className="mt-6 text-gray-500">
              ✨ No necesitas tarjeta de crédito
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para brillar
            </h2>
            <p className="text-xl text-gray-600">
              Herramientas poderosas para recolectar y mostrar testimonios
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Enlace por WhatsApp
              </h3>
              <p className="text-gray-600">
                Envía un enlace personalizado y recibe testimonios directamente por WhatsApp
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <LinkIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Enlaces Personalizados
              </h3>
              <p className="text-gray-600">
                Crea enlaces únicos para diferentes campañas y haz seguimiento de resultados
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-pink-600 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Muro de Testimonios
              </h3>
              <p className="text-gray-600">
                Muestra tus mejores reseñas en un muro hermoso y personalizable
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-amber-600 rounded-xl flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Widget Embebido
              </h3>
              <p className="text-gray-600">
                Integra testimonios en tu web con un simple código de inserción
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Precios simples y transparentes
            </h2>
            <p className="text-xl text-gray-600">
              Elige el plan perfecto para tu negocio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-indigo-300 transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratis</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">€0</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Hasta 10 testimonios/mes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">1 enlace de recolección</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Muro público básico</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Marca TestimonioYa</span>
                </li>
              </ul>
              <Link to="/register" className="block w-full text-center btn-secondary">
                Comenzar Gratis
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-indigo-600 rounded-2xl p-8 border-2 border-indigo-600 shadow-xl transform scale-105">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold text-white">Pro</h3>
                <span className="bg-white text-indigo-600 text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </span>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">€19</span>
                <span className="text-indigo-200">/mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span className="text-white">Testimonios ilimitados</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span className="text-white">Enlaces ilimitados</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span className="text-white">Personalización completa</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span className="text-white">Sin marca TestimonioYa</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span className="text-white">Widget embebido</span>
                </li>
              </ul>
              <Link to="/register" className="block w-full text-center bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Comenzar Ahora
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-indigo-300 transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">€49</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Todo lo de Pro</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">5 negocios</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Análiticas avanzadas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Soporte prioritario</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">API access</span>
                </li>
              </ul>
              <Link to="/register" className="block w-full text-center btn-secondary">
                Comenzar Ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Únete a cientos de negocios que ya están recolectando testimonios
          </p>
          <Link to="/register" className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageSquare className="h-6 w-6 text-indigo-400" />
            <span className="text-xl font-bold text-white">TestimonioYa</span>
          </div>
          <p className="text-sm">
            © 2024 TestimonioYa. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
