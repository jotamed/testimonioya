import { useEffect, useState, useRef } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { MessageSquare, Clock, ArrowLeft, ArrowRight, Home, ChevronRight, User } from 'lucide-react'
import { updateSEO } from '../../lib/seo'
import { articles, getRelatedArticles } from './blogData'

// Extract headings for TOC
function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = []
  const lines = content.split('\n')
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      const text = line.slice(3).replace(/\*\*/g, '')
      const id = text.toLowerCase().replace(/[^a-z0-9áéíóúñü]+/g, '-').replace(/^-|-$/g, '')
      headings.push({ id, text, level: 2 })
    } else if (line.startsWith('### ')) {
      const text = line.slice(4).replace(/\*\*/g, '')
      const id = text.toLowerCase().replace(/[^a-z0-9áéíóúñü]+/g, '-').replace(/^-|-$/g, '')
      headings.push({ id, text, level: 3 })
    }
  }
  return headings
}

// Markdown renderer with heading IDs
function renderMarkdown(content: string) {
  const lines = content.trim().split('\n')
  const elements: JSX.Element[] = []
  let listItems: string[] = []
  let inBlockquote = false
  let blockquoteText = ''

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-6 space-y-2 text-gray-700 my-6 leading-relaxed">
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inlineMarkdown(item) }} />
          ))}
        </ul>
      )
      listItems = []
    }
  }

  const flushBlockquote = () => {
    if (inBlockquote && blockquoteText) {
      elements.push(
        <blockquote key={`bq-${elements.length}`} className="border-l-4 border-indigo-400 pl-6 py-3 my-8 text-xl text-gray-800 italic bg-indigo-50/50 rounded-r-xl">
          <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(blockquoteText.trim()) }} />
        </blockquote>
      )
      blockquoteText = ''
      inBlockquote = false
    }
  }

  const inlineMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-indigo-600 font-medium underline hover:text-indigo-800 transition">$1</a>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono text-indigo-600">$1</code>')
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('> ')) {
      flushList()
      inBlockquote = true
      blockquoteText += line.slice(2) + ' '
      continue
    } else if (inBlockquote) {
      flushBlockquote()
    }

    if (line.startsWith('### ')) {
      flushList()
      const text = line.slice(4)
      const id = text.replace(/\*\*/g, '').toLowerCase().replace(/[^a-z0-9áéíóúñü]+/g, '-').replace(/^-|-$/g, '')
      elements.push(
        <h3 id={id} key={`h3-${i}`} className="text-2xl font-bold text-gray-900 mt-12 mb-4 scroll-mt-24">
          <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(text) }} />
        </h3>
      )
    } else if (line.startsWith('## ')) {
      flushList()
      const text = line.slice(3)
      const id = text.replace(/\*\*/g, '').toLowerCase().replace(/[^a-z0-9áéíóúñü]+/g, '-').replace(/^-|-$/g, '')
      elements.push(
        <h2 id={id} key={`h2-${i}`} className="text-3xl font-bold text-gray-900 mt-16 mb-5 scroll-mt-24">
          <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(text) }} />
        </h2>
      )
    } else if (line.startsWith('- ')) {
      listItems.push(line.slice(2))
    } else if (line.startsWith('---')) {
      flushList()
      elements.push(<hr key={`hr-${i}`} className="my-12 border-gray-200" />)
    } else if (line.trim() === '') {
      flushList()
    } else {
      flushList()
      elements.push(
        <p key={`p-${i}`} className="text-gray-700 text-lg leading-relaxed my-5">
          <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(line) }} />
        </p>
      )
    }
  }
  flushList()
  flushBlockquote()

  return <>{elements}</>
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>()
  const article = articles.find(a => a.slug === slug)
  const related = slug ? getRelatedArticles(slug) : []
  const [activeHeading, setActiveHeading] = useState<string>('')
  const [readProgress, setReadProgress] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const headings = article ? extractHeadings(article.content) : []

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrolled = window.scrollY
      const progress = (scrolled / documentHeight) * 100
      setReadProgress(Math.min(progress, 100))

      // Update active heading
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean)
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i]
        if (el && el.getBoundingClientRect().top < 150) {
          setActiveHeading(headings[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings])

  // SEO + JSON-LD Schema
  useEffect(() => {
    if (article) {
      updateSEO({
        title: article.title,
        description: article.description,
        url: `https://testimonioya.com/blog/${article.slug}`,
        type: 'article',
      })

      // Add JSON-LD Article Schema
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        datePublished: article.date,
        dateModified: article.date,
        author: {
          '@type': 'Organization',
          name: 'Equipo TestimonioYa'
        },
        publisher: {
          '@type': 'Organization',
          name: 'TestimonioYa',
          logo: {
            '@type': 'ImageObject',
            url: 'https://testimonioya.com/logo.png'
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://testimonioya.com/blog/${article.slug}`
        }
      })
      document.head.appendChild(script)

      // Add Breadcrumb Schema
      const breadcrumbScript = document.createElement('script')
      breadcrumbScript.type = 'application/ld+json'
      breadcrumbScript.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: 'https://testimonioya.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://testimonioya.com/blog'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: `https://testimonioya.com/blog/${article.slug}`
          }
        ]
      })
      document.head.appendChild(breadcrumbScript)

      return () => {
        document.head.removeChild(script)
        document.head.removeChild(breadcrumbScript)
      }
    }
    window.scrollTo(0, 0)
  }, [article])

  if (!article) return <Navigate to="/blog" replace />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-1 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <MessageSquare className="h-7 w-7 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-gray-900">TestimonioYa</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/blog" className="text-sm font-semibold text-indigo-600">Blog</Link>
            <Link to="/register" className="text-sm bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-sm">
              Empieza gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-indigo-600 transition flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link to="/blog" className="hover:text-indigo-600 transition">Blog</Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-xs sm:max-w-md">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Gradient Hero */}
      <div className={`bg-gradient-to-br ${article.visual.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        {/* Decorative elements */}
        <div className="absolute top-10 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center text-white">
          <span className="text-8xl mb-6 inline-block drop-shadow-lg">
            {article.visual.icon}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-md">
            {article.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-white/90 text-sm">
            <time dateTime={article.date} className="font-medium">
              {new Date(article.date).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </time>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {article.readTime} de lectura
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex gap-12">
        {/* Sidebar TOC (desktop only) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Contenido</h3>
              <nav className="space-y-2">
                {headings.map(h => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`block text-sm transition ${
                      h.level === 3 ? 'pl-4' : ''
                    } ${
                      activeHeading === h.id 
                        ? 'text-indigo-600 font-semibold' 
                        : 'text-gray-600 hover:text-indigo-600'
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <article className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12" ref={contentRef}>
            <div className="prose-custom max-w-none">
              {renderMarkdown(article.content)}
            </div>

            {/* Author Section */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex items-start gap-4 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                  <User className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Equipo TestimonioYa</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Ayudamos a negocios a recoger, gestionar y mostrar testimonios de clientes de forma inteligente. 
                    Publicamos guías prácticas sobre social proof, NPS y estrategias de conversión.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Artículos relacionados</h3>
              <div className="grid sm:grid-cols-3 gap-6">
                {related.map(r => (
                  <Link
                    key={r.slug}
                    to={`/blog/${r.slug}`}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                  >
                    <div className={`h-32 bg-gradient-to-br ${r.visual.gradient} flex items-center justify-center`}>
                      <span className="text-5xl opacity-90 group-hover:scale-110 transition-transform">
                        {r.visual.icon}
                      </span>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition line-clamp-2 mb-2 leading-snug">
                        {r.title}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {r.readTime}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white py-16 mt-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Quieres más testimonios para tu negocio?</h2>
          <p className="text-xl text-indigo-100 mb-6">
            TestimonioYa te ayuda a recoger, filtrar y mostrar testimonios. Gratis para empezar.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition shadow-xl"
          >
            Crear cuenta gratis <ArrowRight className="h-5 w-5" />
          </Link>
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
