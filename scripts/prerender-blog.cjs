#!/usr/bin/env node

/**
 * Pre-render blog articles as static HTML for SEO.
 * Reads blogData.ts, generates dist/blog/{slug}/index.html for each article.
 * Run as post-build step.
 */

const fs = require('fs')
const path = require('path')

const DIST = path.resolve(__dirname, '..', 'dist')
const BLOG_DATA = path.resolve(__dirname, '..', 'src', 'pages', 'blog', 'blogData.ts')
const BASE_URL = 'https://testimonioya.com'

// Parse blogData.ts to extract articles
function parseArticles() {
  const src = fs.readFileSync(BLOG_DATA, 'utf-8')
  const articles = []
  // Split by article object boundaries
  const blocks = src.split(/\{\s*\n\s*slug:/).slice(1)

  for (const block of blocks) {
    const get = (key) => {
      const m = block.match(new RegExp(`${key}:\\s*'([^']*)'`))
      return m ? m[1] : ''
    }
    const contentMatch = block.match(/content:\s*`([\s\S]*?)`/)
    const iconMatch = block.match(/icon:\s*'([^']*)'/)
    
    articles.push({
      slug: get('slug') || block.match(/^[^']+'([^']+)'/)?.[1] || '',
      title: get('title'),
      description: get('description'),
      keyword: get('keyword'),
      date: get('date'),
      readTime: get('readTime'),
      icon: iconMatch ? iconMatch[1] : '💬',
      content: contentMatch ? contentMatch[1].slice(0, 2000) : '',
    })
  }
  return articles.filter(a => a.slug)
}

// Convert basic markdown to HTML
function md(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
}

function generateHTML(article) {
  const url = `${BASE_URL}/blog/${article.slug}`
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} | TestimonioYa</title>
  <meta name="description" content="${article.description}">
  <meta name="keywords" content="${article.keyword}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${article.title}">
  <meta property="og:description" content="${article.description}">
  <meta property="og:image" content="${BASE_URL}/og-image.png">
  <meta property="og:locale" content="es_ES">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${article.title}">
  <meta name="twitter:description" content="${article.description}">
  <meta name="twitter:image" content="${BASE_URL}/og-image.png">
  <meta name="robots" content="index, follow">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${article.title}",
    "description": "${article.description}",
    "datePublished": "${article.date}",
    "dateModified": "${article.date}",
    "author": {
      "@type": "Organization",
      "name": "Equipo TestimonioYa"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TestimonioYa",
      "logo": {
        "@type": "ImageObject",
        "url": "${BASE_URL}/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "${url}"
    }
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "${BASE_URL}"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "${BASE_URL}/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${article.title}",
        "item": "${url}"
      }
    ]
  }
  </script>
  <script>
    // Redirect to SPA for full experience (non-bots)
    if (typeof window !== 'undefined' && window.location) {
      if (!navigator.userAgent.match(/bot|crawl|spider|slurp|googlebot/i)) {
        window.location.replace('${BASE_URL}/blog/${article.slug}');
      }
    }
  </script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
    h1 { font-size: 2.5em; margin-bottom: 0.5em; }
    h2 { font-size: 1.8em; margin-top: 1.5em; margin-bottom: 0.5em; }
    h3 { font-size: 1.4em; margin-top: 1.2em; margin-bottom: 0.5em; }
    p { margin: 1em 0; }
    a { color: #4f46e5; text-decoration: none; }
    a:hover { text-decoration: underline; }
    ul { margin: 1em 0; padding-left: 2em; }
    header { border-bottom: 2px solid #e5e7eb; padding-bottom: 1em; margin-bottom: 2em; }
    footer { border-top: 2px solid #e5e7eb; padding-top: 1em; margin-top: 3em; text-align: center; color: #6b7280; }
    .icon { font-size: 3em; margin: 0.5em 0; }
  </style>
</head>
<body>
  <header>
    <h1><a href="${BASE_URL}">TestimonioYa</a></h1>
    <nav>
      <a href="${BASE_URL}">Inicio</a> &gt; 
      <a href="${BASE_URL}/blog">Blog</a> &gt; 
      ${article.title}
    </nav>
  </header>
  <main>
    <article>
      <div class="icon">${article.icon}</div>
      <h1>${article.title}</h1>
      <p><time datetime="${article.date}">${new Date(article.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</time> · ${article.readTime} de lectura</p>
      ${md(article.content)}
    </article>
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} TestimonioYa. <a href="${BASE_URL}/legal">Legal</a> · <a href="${BASE_URL}/privacy">Privacidad</a></p>
  </footer>
</body>
</html>`
}

// Main
console.log('📝 Pre-rendering blog articles...')

if (!fs.existsSync(DIST)) {
  console.error('❌ Error: dist/ folder not found. Run npm run build first.')
  process.exit(1)
}

const articles = parseArticles()
console.log(`✓ Found ${articles.length} articles in blogData.ts`)

for (const article of articles) {
  const dir = path.join(DIST, 'blog', article.slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), generateHTML(article))
  console.log(`  ✓ /blog/${article.slug}/index.html`)
}

// Also create blog index
const blogIndexDir = path.join(DIST, 'blog')
fs.mkdirSync(blogIndexDir, { recursive: true })
const blogIndexHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog - TestimonioYa | Testimonios, NPS y Social Proof</title>
  <meta name="description" content="Artículos sobre testimonios de clientes, NPS, social proof y cómo usar prueba social para hacer crecer tu negocio. Guías prácticas y consejos.">
  <link rel="canonical" href="${BASE_URL}/blog">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${BASE_URL}/blog">
  <meta property="og:title" content="Blog - TestimonioYa">
  <meta property="og:description" content="Artículos sobre testimonios de clientes, NPS, social proof y cómo usar prueba social para hacer crecer tu negocio.">
  <meta name="robots" content="index, follow">
  <script>
    if (typeof window !== 'undefined' && window.location) {
      if (!navigator.userAgent.match(/bot|crawl|spider|slurp|googlebot/i)) {
        window.location.replace('${BASE_URL}/blog');
      }
    }
  </script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
    h1 { font-size: 2.5em; margin-bottom: 1em; }
    .article { border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
    .article h2 { margin-top: 0; }
    .article p { color: #6b7280; }
    a { color: #4f46e5; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .icon { font-size: 2em; margin-right: 10px; }
  </style>
</head>
<body>
  <header>
    <h1><a href="${BASE_URL}">TestimonioYa</a> - Blog</h1>
    <p>Guías prácticas sobre testimonios, NPS y social proof</p>
  </header>
  <main>
${articles.map(a => `    <div class="article">
      <h2><span class="icon">${a.icon}</span><a href="${BASE_URL}/blog/${a.slug}">${a.title}</a></h2>
      <p>${a.description}</p>
      <p><small>${new Date(a.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} · ${a.readTime}</small></p>
    </div>`).join('\n')}
  </main>
  <footer style="border-top: 2px solid #e5e7eb; padding-top: 1em; margin-top: 3em; text-align: center; color: #6b7280;">
    <p>&copy; ${new Date().getFullYear()} TestimonioYa.</p>
  </footer>
</body>
</html>`

fs.writeFileSync(path.join(blogIndexDir, 'index.html'), blogIndexHTML)
console.log('  ✓ /blog/index.html')
console.log('✅ Pre-rendering complete!')
