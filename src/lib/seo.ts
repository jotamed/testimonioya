/**
 * Simple SEO helper - updates document head meta tags
 * Works without react-helmet dependency
 */

interface SEOProps {
  title: string
  description?: string
  url?: string
  image?: string
  type?: string
  noIndex?: boolean
}

export function updateSEO({ title, description, url, image, type = 'website', noIndex = false }: SEOProps) {
  // Title
  document.title = title.includes('TestimonioYa') ? title : `${title} | TestimonioYa`

  // Helper to set/create meta tags
  const setMeta = (attr: string, key: string, content: string) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, key)
      document.head.appendChild(el)
    }
    el.content = content
  }

  if (description) {
    setMeta('name', 'description', description)
    setMeta('property', 'og:description', description)
    setMeta('name', 'twitter:description', description)
  }

  setMeta('property', 'og:title', title)
  setMeta('name', 'twitter:title', title)
  setMeta('property', 'og:type', type)

  if (url) {
    setMeta('property', 'og:url', url)
    // Update canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }

  if (image) {
    setMeta('property', 'og:image', image)
    setMeta('name', 'twitter:image', image)
    setMeta('name', 'twitter:card', 'summary_large_image')
  }

  if (noIndex) {
    setMeta('name', 'robots', 'noindex, nofollow')
  } else {
    setMeta('name', 'robots', 'index, follow')
  }
}
