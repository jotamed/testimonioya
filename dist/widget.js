(function() {
  var el = document.getElementById('testimonioya-widget');
  if (!el) return;

  var slug = el.getAttribute('data-slug');
  var layout = el.getAttribute('data-layout') || 'grid';
  var theme = el.getAttribute('data-theme') || 'light';
  var max = parseInt(el.getAttribute('data-max') || '6', 10);
  if (!slug) { el.innerHTML = '<p>Error: data-slug required</p>'; return; }

  var API = 'https://wnmfanhejnrtfccemlai.supabase.co/rest/v1';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubWZhbmhlam5ydGZjY2VtbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY5NjMsImV4cCI6MjA4NTgwMjk2M30.bhTUh5Ks9nWjuMF4qK0og7gVuw7vlMZeaNGi5NJ0crc';
  var headers = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY };

  function stars(n) {
    var s = '';
    for (var i = 0; i < 5; i++) s += '<span style="color:' + (i < n ? '#facc15' : '#d1d5db') + ';font-size:14px;">★</span>';
    return s;
  }

  function card(t, isDark) {
    var bg = isDark ? '#1f2937' : '#ffffff';
    var text = isDark ? '#f3f4f6' : '#111827';
    var sub = isDark ? '#9ca3af' : '#6b7280';
    var border = isDark ? '#374151' : '#e5e7eb';
    var initials = (t.customer_name || '?').charAt(0).toUpperCase();
    var date = new Date(t.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    var sourceBadge = t._source ? '<span style="font-size:10px;background:' + (isDark ? '#374151' : '#f3f4f6') + ';color:' + sub + ';padding:2px 6px;border-radius:4px;margin-left:6px;">' + t._source + '</span>' : '';
    return '<div style="background:' + bg + ';border:1px solid ' + border + ';border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:12px;">' +
      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;">' + initials + '</div>' +
        '<div><div style="font-weight:600;color:' + text + ';font-size:14px;">' + (t.customer_name || 'Anónimo') + sourceBadge + '</div>' +
        '<div style="font-size:12px;color:' + sub + ';">' + date + '</div></div>' +
      '</div>' +
      '<div>' + stars(t.rating) + '</div>' +
      '<p style="color:' + text + ';font-size:14px;line-height:1.6;margin:0;">' + (t.text_content || '') + '</p>' +
    '</div>';
  }

  function render(testimonials, biz) {
    var isDark = theme === 'dark';
    var containerBg = isDark ? '#111827' : '#f9fafb';
    var items = testimonials.slice(0, max);
    var html = '';

    if (layout === 'grid') {
      html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">';
      items.forEach(function(t) { html += card(t, isDark); });
      html += '</div>';
    } else if (layout === 'list') {
      html = '<div style="display:flex;flex-direction:column;gap:12px;">';
      items.forEach(function(t) { html += card(t, isDark); });
      html += '</div>';
    } else if (layout === 'carousel') {
      html = '<div id="ty-carousel" style="position:relative;overflow:hidden;">' +
        '<div id="ty-slides" style="display:flex;transition:transform 0.4s ease;">';
      items.forEach(function(t) { html += '<div style="min-width:100%;padding:0 4px;box-sizing:border-box;">' + card(t, isDark) + '</div>'; });
      html += '</div>' +
        '<button onclick="tyPrev()" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);background:rgba(99,102,241,0.9);color:#fff;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:18px;">‹</button>' +
        '<button onclick="tyNext()" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:rgba(99,102,241,0.9);color:#fff;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:18px;">›</button>' +
      '</div>';
    }

    var powered = biz.plan === 'free' ? '<div style="text-align:center;margin-top:16px;"><a href="https://testimonioya.com" target="_blank" rel="noopener" style="color:#9ca3af;font-size:12px;text-decoration:none;">Powered by TestimonioYa</a></div>' : '';

    el.innerHTML = '<div style="background:' + containerBg + ';border-radius:16px;padding:20px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;">' + html + powered + '</div>';

    if (layout === 'carousel' && items.length > 1) {
      var idx = 0;
      var total = items.length;
      function go(i) { idx = i; document.getElementById('ty-slides').style.transform = 'translateX(-' + (idx * 100) + '%)'; }
      window.tyNext = function() { go((idx + 1) % total); };
      window.tyPrev = function() { go((idx - 1 + total) % total); };
      setInterval(function() { go((idx + 1) % total); }, 5000);
    }
  }

  fetch(API + '/businesses?slug=eq.' + slug + '&select=id,business_name,brand_color,user_id', { headers: headers })
    .then(function(r) { return r.json(); })
    .then(function(biz) {
      if (!biz.length) { el.innerHTML = '<p>Negocio no encontrado</p>'; return; }
      var bizData = biz[0];
      // Fetch user plan from profiles table
      return fetch(API + '/profiles?id=eq.' + bizData.user_id + '&select=plan', { headers: headers })
        .then(function(r) { return r.json(); })
        .then(function(profiles) {
          var userPlan = (profiles && profiles.length > 0) ? profiles[0].plan : 'free';
          bizData.plan = userPlan;
          var isPaid = userPlan === 'pro' || userPlan === 'business';
      var fetches = [
        fetch(API + '/testimonials?business_id=eq.' + bizData.id + '&status=eq.approved&order=created_at.desc&limit=' + max, { headers: headers }).then(function(r) { return r.json(); })
      ];
      if (isPaid) {
        fetches.push(fetch(API + '/external_reviews?business_id=eq.' + bizData.id + '&status=eq.approved&order=review_date.desc&limit=' + max, { headers: headers }).then(function(r) { return r.json(); }));
      }
      Promise.all(fetches).then(function(results) {
        var testimonials = results[0] || [];
        var reviews = (results[1] || []).map(function(r) {
          return { customer_name: r.author_name, rating: r.rating, text_content: r.review_text, created_at: r.review_date || r.created_at, _source: r.platform };
        });
        var all = testimonials.concat(reviews);
        all.sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); });
        render(all.slice(0, max), bizData);
      });
        });
    });
})();
