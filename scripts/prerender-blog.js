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
    articles.push({
      slug: get('slug') || block.match(/^[^']+'([^']+)'/)?.[1] || '',
      title: get('title'),
      description: get('description'),
      keyword: get('keyword'),
      date: get('date'),
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
  <script>
    // Redirect to SPA for full experience
    if (typeof window !== 'undefined' && window.location) {
      var defined = document.querySelector('meta[name="prerender"]');
      if (!navigator.userAgent.match(/bot|crawl|spider|slurp|googlebot/i)) {
        window.location.replace('${BASE_URL}/blog/${article.slug}');
      }
    }
  </script>
</head>
<body>
  <header>
    <h1><a href="${BASE_URL}">TestimonioYa</a></h1>
    <nav><a href="${BASE_URL}/blog">Blog</a></nav>
  </header>
  <main>
    <article>
      <h1>${article.title}</h1>
      <p><time datetime="${article.date}">${article.date}</time></p>
      ${md(article.content)}
    </article>
  </main>
  <footer>
    <p>&copy; 2026 TestimonioYa. <a href="${BASE_URL}/legal">Legal</a></p>
  </footer>
</body>
</html>`
}

// Main
const articles = parseArticles()
console.log(`Pre-rendering ${articles.length} blog articles...`)

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
  <title>Blog - TestimonioYa</title>
  <meta name="description" content="Artículos sobre testimonios, reseñas, NPS y social proof para hacer crecer tu negocio.">
  <link rel="canonical" href="${BASE_URL}/blog">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${BASE_URL}/blog">
  <meta property="og:title" content="Blog - TestimonioYa">
  <meta name="robots" content="index, follow">
</head>
<body>
  <header><h1><a href="${BASE_URL}">TestimonioYa</a></h1></header>
  <main>
    <h1>Blog</h1>
    <ul>
${articles.map(a => `      <li><a href="${BASE_URL}/blog/${a.slug}">${a.title}</a> - ${a.description}</li>`).join('\n')}
    </ul>
  </main>
</body>
</html>`
fs.writeFileSync(path.join(blogIndexDir, 'index.html'), blogIndexHTML)
console.log('  ✓ /blog/index.html')
console.log('Done!')
