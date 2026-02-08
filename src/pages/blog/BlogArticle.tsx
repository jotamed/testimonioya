import { useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { MessageSquare, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import { updateSEO } from '../../lib/seo'
import { articles, getRelatedArticles } from './blogData'

function renderMarkdown(content: string) {
  // Simple markdown-to-JSX renderer for blog content
  const lines = content.trim().split('\n')
  const elements: JSX.Element[] = []
  let listItems: string[] = []
  let inBlockquote = false
  let blockquoteText = ''

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-6 space-y-1 text-gray-700 my-4">
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
        <blockquote key={`bq-${elements.length}`} className="border-l-4 border-indigo-300 pl-4 py-2 my-6 text-lg text-gray-700 italic bg-indigo-50/50 rounded-r-lg">
          <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(blockquoteText.trim()) }} />
        </blockquote>
      )
      blockquoteText = ''
      inBlockquote = false
    }
  }

  const inlineMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-indigo-600 underline hover:text-indigo-800">$1</a>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
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
      elements.push(
        <h3 key={`h3-${i}`} className="text-xl font-bold text-gray-900 mt-8 mb-3">
          <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(line.slice(4)) }} />
        </h3>
      )
    } else if (line.startsWith('## ')) {
      flushList()
      elements.push(
        <h2 key={`h2-${i}`} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
          <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(line.slice(3)) }} />
        </h2>
      )
    } else if (line.startsWith('- ')) {
      listItems.push(line.slice(2))
    } else if (line.startsWith('---')) {
      flushList()
      elements.push(<hr key={`hr-${i}`} className="my-8 border-gray-200" />)
    } else if (line.trim() === '') {
      flushList()
    } else if (line.match(/^\|/)) {
      // Skip table rows for now (rendered as text)
      flushList()
      elements.push(
        <p key={`p-${i}`} className="text-gray-700 leading-relaxed my-2 font-mono text-sm">
          <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(line) }} />
        </p>
      )
    } else {
      flushList()
      elements.push(
        <p key={`p-${i}`} className="text-gray-700 leading-relaxed my-4">
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

  useEffect(() => {
    if (article) {
      updateSEO({
        title: article.title,
        description: article.description,
        url: `https://testimonioya.com/blog/${article.slug}`,
        type: 'article',
      })
    }
    window.scrollTo(0, 0)
  }, [article])

  if (!article) return <Navigate to="/blog" replace />

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <article className="flex-1 min-w-0">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition mb-6">
              <ArrowLeft className="h-4 w-4" /> Volver al blog
            </Link>

            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-10">
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <time dateTime={article.date}>
                  {new Date(article.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </time>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {article.readTime}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                {article.title}
              </h1>

              <div className="prose-custom">
                {renderMarkdown(article.content)}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Related articles */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Artículos relacionados</h3>
                <div className="space-y-4">
                  {related.map(r => (
                    <Link
                      key={r.slug}
                      to={`/blog/${r.slug}`}
                      className="block group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{r.image}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition line-clamp-2">
                            {r.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{r.readTime}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA box */}
              <div className="bg-indigo-600 text-white rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">¿Quieres más testimonios?</h3>
                <p className="text-indigo-100 text-sm mb-4">
                  TestimonioYa te ayuda a recoger, filtrar y mostrar testimonios. Gratis.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 bg-white text-indigo-600 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-indigo-50 transition"
                >
                  Crear cuenta gratis <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-8 text-center text-sm text-gray-500 mt-12">
        <p>© {new Date().getFullYear()} TestimonioYa. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
