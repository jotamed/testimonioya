import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Clock, ArrowRight, BookOpen, TrendingUp } from 'lucide-react'
import { updateSEO } from '../../lib/seo'
import { articles } from './blogData'

export default function BlogList() {
  useEffect(() => {
    updateSEO({
      title: 'Blog - TestimonioYa | Testimonios, NPS y Social Proof',
      description: 'Artículos sobre testimonios de clientes, NPS, social proof y cómo usar prueba social para hacer crecer tu negocio. Guías prácticas y consejos.',
      url: 'https://testimonioya.com/blog',
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <MessageSquare className="h-7 w-7 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-gray-900">TestimonioYa</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/blog" className="text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 pb-0.5">Blog</Link>
            <Link to="/register" className="text-sm bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-sm hover:shadow-md">
              Empieza gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <BookOpen className="h-4 w-4" /> 
            <span>Publicaciones</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            El blog de TestimonioYa
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Guías prácticas, estrategias probadas y consejos para convertir la opinión de tus clientes en tu mejor herramienta de venta.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <span>{articles.length} artículos</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-gray-300" />
            <span>Actualizado semanalmente</span>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, idx) => (
            <Link
              key={article.slug}
              to={`/blog/${article.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 hover:-translate-y-1"
            >
              {/* Gradient Hero */}
              <div className={`h-48 bg-gradient-to-br ${article.visual.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/5" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-7xl opacity-90 group-hover:scale-110 transition-transform duration-300">
                    {article.visual.icon}
                  </span>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-2 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <time dateTime={article.date} className="font-medium">
                    {new Date(article.date).toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </time>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {article.readTime}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition mb-3 leading-tight line-clamp-2">
                  {article.title}
                </h2>
                
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                  {article.description}
                </p>
                
                <span className="inline-flex items-center gap-1.5 text-indigo-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                  Leer artículo 
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white py-20">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            ¿Listo para recoger testimonios que venden?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Empieza gratis en 30 segundos. Sin tarjeta de crédito. Sin instalaciones complejas.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition shadow-xl hover:shadow-2xl hover:scale-105 transform duration-200"
          >
            Crear cuenta gratis 
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-sm text-indigo-200 mt-4">
            ✓ Plan gratuito para siempre · ✓ Sin límites de testimonios
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              <span className="font-bold text-gray-900">TestimonioYa</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} TestimonioYa. Todos los derechos reservados.
            </p>
            <div className="flex gap-4 text-sm">
              <Link to="/legal" className="text-gray-600 hover:text-indigo-600 transition">Legal</Link>
              <Link to="/privacy" className="text-gray-600 hover:text-indigo-600 transition">Privacidad</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
