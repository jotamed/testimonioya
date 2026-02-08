import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Clock, ArrowRight, BookOpen } from 'lucide-react'
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
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <MessageSquare className="h-7 w-7 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">TestimonioYa</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/blog" className="text-sm font-medium text-indigo-600">Blog</Link>
            <Link to="/register" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              Empieza gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" /> Blog
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Todo sobre testimonios y social proof
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Guías prácticas para recoger testimonios, medir satisfacción con NPS y usar la prueba social para vender más.
          </p>
        </div>
      </div>

      {/* Articles grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-8">
          {articles.map((article) => (
            <Link
              key={article.slug}
              to={`/blog/${article.slug}`}
              className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 hover:shadow-lg hover:border-indigo-200 transition group"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl flex-shrink-0">{article.image}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                    <time dateTime={article.date}>
                      {new Date(article.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </time>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {article.readTime}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition mb-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 line-clamp-2 mb-3">{article.description}</p>
                  <span className="inline-flex items-center gap-1 text-indigo-600 text-sm font-medium group-hover:gap-2 transition-all">
                    Leer artículo <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-indigo-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold mb-3">¿Listo para recoger testimonios que venden?</h2>
          <p className="text-indigo-100 mb-6">Empieza gratis. Sin tarjeta de crédito.</p>
          <Link to="/register" className="inline-block bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-50 transition">
            Crear cuenta gratis →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} TestimonioYa. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
