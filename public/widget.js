/**
 * TestimonioYa Embeddable Widget
 * Usage:
 *   <div id="testimonioya-widget" 
 *        data-slug="your-business-slug"
 *        data-layout="grid|carousel|list"
 *        data-theme="light|dark"
 *        data-max="6">
 *   </div>
 *   <script src="https://testimonioya.com/widget.js"></script>
 */

(function() {
  'use strict';

  const SUPABASE_URL = 'https://wnmfanhejnrtfccemlai.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubWZhbmhlam5ydGZjY2VtbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY5NjMsImV4cCI6MjA4NTgwMjk2M30.bhTUh5Ks9nWjuMF4qK0og7gVuw7vlMZeaNGi5NJ0crc';

  // Styles
  const styles = `
    .ty-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .ty-widget * { box-sizing: border-box; margin: 0; padding: 0; }
    .ty-widget-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    .ty-widget-carousel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 1rem; padding-bottom: 1rem; }
    .ty-widget-carousel::-webkit-scrollbar { height: 6px; }
    .ty-widget-carousel::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
    .ty-widget-carousel::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
    .ty-widget-carousel .ty-card { scroll-snap-align: start; min-width: 300px; flex-shrink: 0; }
    .ty-widget-list { display: flex; flex-direction: column; gap: 1rem; }
    .ty-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
    .ty-card.dark { background: #1f2937; border-color: #374151; color: #f9fafb; }
    .ty-card-header { display: flex; align-items: center; margin-bottom: 1rem; }
    .ty-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 1.25rem; margin-right: 0.75rem; }
    .ty-name { font-weight: 600; color: #111827; }
    .ty-card.dark .ty-name { color: #f9fafb; }
    .ty-date { font-size: 0.875rem; color: #6b7280; }
    .ty-stars { display: flex; gap: 2px; margin-bottom: 0.75rem; }
    .ty-star { width: 18px; height: 18px; }
    .ty-star-filled { fill: #fbbf24; color: #fbbf24; }
    .ty-star-empty { fill: none; stroke: #d1d5db; }
    .ty-text { color: #374151; line-height: 1.6; }
    .ty-card.dark .ty-text { color: #d1d5db; }
    .ty-featured { border-color: #6366f1; border-width: 2px; }
    .ty-badge { display: inline-block; background: #6366f1; color: white; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 9999px; margin-bottom: 0.75rem; }
    .ty-audio { margin-top: 0.75rem; }
    .ty-audio audio { width: 100%; height: 40px; }
    .ty-powered { text-align: center; margin-top: 1rem; font-size: 0.75rem; color: #9ca3af; }
    .ty-powered a { color: #6366f1; text-decoration: none; }
    .ty-powered a:hover { text-decoration: underline; }
    .ty-empty { text-align: center; padding: 3rem 1rem; color: #6b7280; }
    .ty-loading { text-align: center; padding: 2rem; }
    .ty-loading-spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #6366f1; border-radius: 50%; animation: ty-spin 1s linear infinite; margin: 0 auto; }
    @keyframes ty-spin { to { transform: rotate(360deg); } }
  `;

  // Star SVG
  const starSvg = (filled) => `
    <svg class="ty-star ${filled ? 'ty-star-filled' : 'ty-star-empty'}" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
    </svg>
  `;

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get initials
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Render testimonial card
  const renderCard = (testimonial, theme) => {
    const stars = Array(5).fill(0).map((_, i) => starSvg(i < testimonial.rating)).join('');
    
    return `
      <div class="ty-card ${theme === 'dark' ? 'dark' : ''} ${testimonial.is_featured ? 'ty-featured' : ''}">
        ${testimonial.is_featured ? '<span class="ty-badge">⭐ Destacado</span>' : ''}
        <div class="ty-card-header">
          <div class="ty-avatar">${getInitials(testimonial.customer_name)}</div>
          <div>
            <div class="ty-name">${testimonial.customer_name}</div>
            <div class="ty-date">${formatDate(testimonial.created_at)}</div>
          </div>
        </div>
        <div class="ty-stars">${stars}</div>
        ${testimonial.text_content ? `<p class="ty-text">${testimonial.text_content}</p>` : ''}
        ${testimonial.audio_url ? `
          <div class="ty-audio">
            <audio controls src="${testimonial.audio_url}"></audio>
          </div>
        ` : ''}
      </div>
    `;
  };

  // Fetch testimonials
  const fetchTestimonials = async (slug) => {
    // First get business
    const businessRes = await fetch(
      `${SUPABASE_URL}/rest/v1/businesses?slug=eq.${slug}&select=id,plan`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const businesses = await businessRes.json();
    if (!businesses.length) return { testimonials: [], plan: 'free' };
    
    const business = businesses[0];
    
    // Then get testimonials
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/testimonials?business_id=eq.${business.id}&status=eq.approved&select=*&order=is_featured.desc,created_at.desc`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const testimonials = await res.json();
    
    return { testimonials, plan: business.plan };
  };

  // Initialize widget
  const init = async () => {
    const containers = document.querySelectorAll('[id="testimonioya-widget"]');
    if (!containers.length) return;

    // Inject styles
    if (!document.getElementById('ty-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'ty-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }

    containers.forEach(async (container) => {
      const slug = container.dataset.slug;
      const layout = container.dataset.layout || 'grid';
      const theme = container.dataset.theme || 'light';
      const max = parseInt(container.dataset.max) || 100;

      if (!slug) {
        container.innerHTML = '<div class="ty-widget"><p class="ty-empty">Error: falta data-slug</p></div>';
        return;
      }

      // Show loading
      container.innerHTML = `
        <div class="ty-widget">
          <div class="ty-loading">
            <div class="ty-loading-spinner"></div>
          </div>
        </div>
      `;

      try {
        const { testimonials, plan } = await fetchTestimonials(slug);
        const displayTestimonials = testimonials.slice(0, max);

        if (!displayTestimonials.length) {
          container.innerHTML = `
            <div class="ty-widget">
              <div class="ty-empty">
                <p>Aún no hay testimonios</p>
              </div>
            </div>
          `;
          return;
        }

        const cards = displayTestimonials.map(t => renderCard(t, theme)).join('');
        const layoutClass = `ty-widget-${layout}`;
        const poweredBy = plan === 'free' 
          ? '<div class="ty-powered">Powered by <a href="https://testimonioya.com" target="_blank">TestimonioYa</a></div>'
          : '';

        container.innerHTML = `
          <div class="ty-widget">
            <div class="${layoutClass}">
              ${cards}
            </div>
            ${poweredBy}
          </div>
        `;
      } catch (error) {
        console.error('TestimonioYa Widget Error:', error);
        container.innerHTML = `
          <div class="ty-widget">
            <div class="ty-empty">
              <p>Error al cargar testimonios</p>
            </div>
          </div>
        `;
      }
    });
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual init
  window.TestimonioYa = { init };
})();
