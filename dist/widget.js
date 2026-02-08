/**
 * TestimonioYa Embeddable Widget v2.0
 * Usage:
 *   <div id="testimonioya-widget" 
 *        data-slug="your-business-slug"
 *        data-layout="grid|carousel|list|masonry"
 *        data-theme="light|dark"
 *        data-max="6"
 *        data-show-header="true"
 *        data-brand-color="#6366f1">
 *   </div>
 *   <script src="https://testimonioya.com/widget.js"></script>
 */

(function() {
  'use strict';

  const SUPABASE_URL = 'https://wnmfanhejnrtfccemlai.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubWZhbmhlam5ydGZjY2VtbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY5NjMsImV4cCI6MjA4NTgwMjk2M30.bhTUh5Ks9nWjuMF4qK0og7gVuw7vlMZeaNGi5NJ0crc';

  const styles = `
    .ty-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; --ty-brand: #6366f1; }
    .ty-widget * { box-sizing: border-box; margin: 0; padding: 0; }
    
    /* Header */
    .ty-header { text-align: center; margin-bottom: 1.5rem; }
    .ty-header-rating { font-size: 2rem; font-weight: 700; color: #111827; }
    .ty-header.dark .ty-header-rating { color: #f9fafb; }
    .ty-header-stars { display: flex; justify-content: center; gap: 4px; margin: 0.5rem 0; }
    .ty-header-count { font-size: 0.875rem; color: #6b7280; }
    
    /* Layouts */
    .ty-widget-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .ty-widget-masonry { columns: 2; column-gap: 1rem; }
    @media (max-width: 640px) { .ty-widget-masonry { columns: 1; } }
    .ty-widget-masonry .ty-card { break-inside: avoid; margin-bottom: 1rem; }
    .ty-widget-carousel { position: relative; }
    .ty-carousel-track { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 1rem; padding-bottom: 0.5rem; scrollbar-width: none; -ms-overflow-style: none; }
    .ty-carousel-track::-webkit-scrollbar { display: none; }
    .ty-carousel-track .ty-card { scroll-snap-align: start; min-width: 300px; max-width: 350px; flex-shrink: 0; }
    .ty-carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e5e7eb; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 2; transition: all 0.2s; }
    .ty-carousel-btn:hover { background: #f9fafb; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .ty-carousel-btn.left { left: -12px; }
    .ty-carousel-btn.right { right: -12px; }
    .ty-widget-list { display: flex; flex-direction: column; gap: 1rem; }
    
    /* Card */
    .ty-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; transition: box-shadow 0.2s, transform 0.2s; }
    .ty-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-1px); }
    .ty-card.dark { background: #1f2937; border-color: #374151; color: #f9fafb; }
    .ty-card.dark:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .ty-card-header { display: flex; align-items: center; margin-bottom: 1rem; }
    .ty-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--ty-brand), #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 1.1rem; margin-right: 0.75rem; flex-shrink: 0; }
    .ty-name { font-weight: 600; color: #111827; font-size: 0.95rem; }
    .ty-card.dark .ty-name { color: #f9fafb; }
    .ty-date { font-size: 0.8rem; color: #9ca3af; }
    .ty-stars { display: flex; gap: 2px; margin-bottom: 0.75rem; }
    .ty-star { width: 16px; height: 16px; }
    .ty-star-filled { fill: #fbbf24; color: #fbbf24; }
    .ty-star-empty { fill: none; stroke: #d1d5db; }
    .ty-text { color: #374151; line-height: 1.65; font-size: 0.925rem; }
    .ty-card.dark .ty-text { color: #d1d5db; }
    .ty-featured { border-color: var(--ty-brand); border-width: 2px; }
    .ty-badge { display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #78350f; font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.025em; }
    .ty-audio { margin-top: 0.75rem; }
    .ty-audio audio { width: 100%; height: 36px; border-radius: 8px; }
    .ty-video { margin-top: 0.75rem; border-radius: 8px; overflow: hidden; }
    .ty-video video { width: 100%; display: block; border-radius: 8px; }
    .ty-powered { text-align: center; margin-top: 1.25rem; font-size: 0.75rem; color: #9ca3af; }
    .ty-powered a { color: var(--ty-brand); text-decoration: none; font-weight: 500; }
    .ty-powered a:hover { text-decoration: underline; }
    .ty-empty { text-align: center; padding: 3rem 1rem; color: #6b7280; }
    .ty-loading { text-align: center; padding: 2rem; }
    .ty-loading-spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: var(--ty-brand); border-radius: 50%; animation: ty-spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes ty-spin { to { transform: rotate(360deg); } }
    
    /* Fade-in animation */
    .ty-fade-in { animation: ty-fadeIn 0.4s ease-out forwards; opacity: 0; }
    @keyframes ty-fadeIn { to { opacity: 1; transform: translateY(0); } from { opacity: 0; transform: translateY(8px); } }
  `;

  const starSvg = (filled) => `
    <svg class="ty-star ${filled ? 'ty-star-filled' : 'ty-star-empty'}" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
    </svg>
  `;

  const bigStarSvg = (filled) => `
    <svg style="width:24px;height:24px" class="ty-star ${filled ? 'ty-star-filled' : 'ty-star-empty'}" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
    </svg>
  `;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const renderHeader = (testimonials, theme) => {
    if (!testimonials.length) return '';
    const avg = testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length;
    const stars = Array(5).fill(0).map((_, i) => bigStarSvg(i < Math.round(avg))).join('');
    return `
      <div class="ty-header ${theme === 'dark' ? 'dark' : ''}">
        <div class="ty-header-rating">${avg.toFixed(1)}</div>
        <div class="ty-header-stars">${stars}</div>
        <div class="ty-header-count">Basado en ${testimonials.length} testimonio${testimonials.length !== 1 ? 's' : ''}</div>
      </div>
    `;
  };

  const renderCard = (testimonial, theme, index) => {
    const stars = Array(5).fill(0).map((_, i) => starSvg(i < testimonial.rating)).join('');
    const delay = Math.min(index * 0.08, 0.5);
    
    return `
      <div class="ty-card ty-fade-in ${theme === 'dark' ? 'dark' : ''} ${testimonial.is_featured ? 'ty-featured' : ''}" style="animation-delay: ${delay}s">
        ${testimonial.is_featured ? '<span class="ty-badge">⭐ Destacado</span>' : ''}
        <div class="ty-card-header">
          <div class="ty-avatar">${getInitials(testimonial.customer_name)}</div>
          <div>
            <div class="ty-name">${escapeHtml(testimonial.customer_name)}</div>
            <div class="ty-date">${formatDate(testimonial.created_at)}</div>
          </div>
        </div>
        <div class="ty-stars">${stars}</div>
        ${testimonial.text_content ? `<p class="ty-text">"${escapeHtml(testimonial.text_content)}"</p>` : ''}
        ${testimonial.video_url ? `
          <div class="ty-video">
            <video controls preload="metadata" playsinline src="${testimonial.video_url}"></video>
          </div>
        ` : ''}
        ${testimonial.audio_url ? `
          <div class="ty-audio">
            <audio controls preload="metadata" src="${testimonial.audio_url}"></audio>
          </div>
        ` : ''}
      </div>
    `;
  };

  const fetchTestimonials = async (slug) => {
    const businessRes = await fetch(
      `${SUPABASE_URL}/rest/v1/businesses?slug=eq.${encodeURIComponent(slug)}&select=id,plan,brand_color`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const businesses = await businessRes.json();
    if (!businesses.length) return { testimonials: [], plan: 'free', brandColor: '#6366f1' };
    
    const business = businesses[0];
    
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/testimonials?business_id=eq.${business.id}&status=eq.approved&select=*&order=is_featured.desc,created_at.desc`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const testimonials = await res.json();
    
    return { testimonials, plan: business.plan, brandColor: business.brand_color || '#6366f1' };
  };

  const setupCarousel = (container) => {
    const track = container.querySelector('.ty-carousel-track');
    if (!track) return;

    const leftBtn = container.querySelector('.ty-carousel-btn.left');
    const rightBtn = container.querySelector('.ty-carousel-btn.right');
    
    const scroll = (dir) => {
      const card = track.querySelector('.ty-card');
      if (!card) return;
      const scrollAmount = card.offsetWidth + 16; // card width + gap
      track.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    };

    if (leftBtn) leftBtn.addEventListener('click', () => scroll(-1));
    if (rightBtn) rightBtn.addEventListener('click', () => scroll(1));
  };

  const init = async () => {
    const containers = document.querySelectorAll('[id="testimonioya-widget"]');
    if (!containers.length) return;

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
      const showHeader = container.dataset.showHeader !== 'false';
      const customColor = container.dataset.brandColor;

      if (!slug) {
        container.innerHTML = '<div class="ty-widget"><p class="ty-empty">Error: falta data-slug</p></div>';
        return;
      }

      container.innerHTML = `
        <div class="ty-widget">
          <div class="ty-loading">
            <div class="ty-loading-spinner"></div>
          </div>
        </div>
      `;

      try {
        const { testimonials, plan, brandColor } = await fetchTestimonials(slug);
        const displayTestimonials = testimonials.slice(0, max);
        const color = customColor || brandColor;

        if (!displayTestimonials.length) {
          container.innerHTML = `
            <div class="ty-widget" style="--ty-brand: ${color}">
              <div class="ty-empty">
                <p>Aún no hay testimonios</p>
              </div>
            </div>
          `;
          return;
        }

        const header = showHeader ? renderHeader(displayTestimonials, theme) : '';
        const cards = displayTestimonials.map((t, i) => renderCard(t, theme, i)).join('');
        const poweredBy = plan === 'free' 
          ? '<div class="ty-powered">Powered by <a href="https://testimonioya.com" target="_blank" rel="noopener">TestimonioYa</a></div>'
          : '';

        let content;
        if (layout === 'carousel') {
          content = `
            <div class="ty-widget-carousel">
              <button class="ty-carousel-btn left" aria-label="Anterior">‹</button>
              <div class="ty-carousel-track">${cards}</div>
              <button class="ty-carousel-btn right" aria-label="Siguiente">›</button>
            </div>
          `;
        } else {
          const layoutClass = `ty-widget-${layout}`;
          content = `<div class="${layoutClass}">${cards}</div>`;
        }

        container.innerHTML = `
          <div class="ty-widget" style="--ty-brand: ${color}">
            ${header}
            ${content}
            ${poweredBy}
          </div>
        `;

        if (layout === 'carousel') {
          setupCarousel(container);
        }
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TestimonioYa = { init };
})();
