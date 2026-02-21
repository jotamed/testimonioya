# TestimonioYa - Testing Guide

## Quick Test Checklist

### 1. Local Development Test (if build works)

```bash
# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Open browser to http://localhost:5173
```

**Test these URLs:**
- http://localhost:5173/ (main landing)
- http://localhost:5173/para/coaches
- http://localhost:5173/para/gimnasios (NEW)
- http://localhost:5173/para/restaurantes
- http://localhost:5173/para/clinicas

### 2. What to Test on Each Vertical Page

#### Visual Check:
- [ ] Page loads without errors
- [ ] H1 is visible and unique to the vertical
- [ ] Hero section displays correctly
- [ ] Pain points section shows (4-5 bullet points)
- [ ] Testimonials section shows (3 testimonial cards)
- [ ] Use cases section displays
- [ ] CTA buttons are visible ("Empezar gratis")
- [ ] Footer is present

#### SEO Check (View Source):
- [ ] Title tag includes vertical name + "TestimonioYa"
- [ ] Meta description is specific to the vertical
- [ ] Canonical URL is correct
- [ ] OG tags are present

#### Responsive Check:
- [ ] Resize browser to mobile width (375px)
- [ ] All text is readable
- [ ] Buttons are touch-friendly
- [ ] No horizontal scroll
- [ ] Images/cards stack properly

#### Functionality:
- [ ] "Empezar gratis" button leads to /register
- [ ] Logo link returns to /
- [ ] No console errors
- [ ] Smooth scrolling works

### 3. Production Test (Vercel)

Once deployed, test on **actual devices**:

#### Desktop:
- [ ] Chrome/Firefox/Safari/Edge
- [ ] All vertical pages load
- [ ] Widget loads on main landing
- [ ] Forms work (/register, /login)

#### Mobile:
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Tablet (iPad)

#### SEO Validation:
- [ ] Google Search Console: Submit sitemap
- [ ] Google Rich Results Test: https://search.google.com/test/rich-results
- [ ] Facebook Debugger: https://developers.facebook.com/tools/debug/
- [ ] Twitter Card Validator: https://cards-dev.twitter.com/validator

### 4. Performance Test

Use PageSpeed Insights: https://pagespeed.web.dev/

**Target Scores:**
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: 100

### 5. Vertical Landing Pages - Content Verification

#### /para/coaches ✅
- Emoji: 💼
- H1: "Tu próximo cliente necesita ver resultados reales"
- Keywords: testimonios coaching, casos de éxito consultoría, social proof coaches

#### /para/gimnasios ✅ (NEW)
- Emoji: 💪
- H1: "Reseñas para Gimnasios que Convierten Visitantes en Socios"
- Keywords: reseñas gimnasio, testimonios centro deportivo, opiniones gym, social proof fitness

#### /para/restaurantes ✅
- Emoji: 🍽️
- H1: "Más reseñas para tu restaurante"
- Keywords: reseñas restaurante, opiniones restaurante, testimonios hostelería

#### /para/clinicas ✅
- Emoji: 🏥
- H1: "La confianza que tus pacientes necesitan"
- Keywords: opiniones clínica, reseñas médico, testimonios centro salud

### 6. Known Issues / To-Do

- [ ] **apple-touch-icon.png missing** - Create 180x180px PNG from og-image.png
- [ ] **Verify widget.js** - Ensure widget script is accessible in production
- [ ] **Test actual widget rendering** - Confirm testimonials display correctly
- [ ] **Update GitHub Pages script** - Can be removed from index.html (not needed for Vercel)

### 7. Post-Launch Monitoring

#### Week 1:
- Check Google Search Console for crawl errors
- Verify all vertical pages are indexed
- Monitor Core Web Vitals
- Check for 404 errors in logs

#### Week 2:
- Review Google Analytics traffic to vertical pages
- Check which verticals get the most traffic
- A/B test different headlines if needed

#### Month 1:
- Review SEO rankings for target keywords
- Optimize underperforming pages
- Consider adding more verticals based on traffic data

### 8. Emergency Rollback Plan

If something breaks in production:

```bash
# Revert to previous commit
git log --oneline  # Find last good commit
git revert <commit-hash>
git push origin main

# Vercel will auto-deploy the rollback
```

### 9. Browser DevTools Tests

#### Test Dynamic Meta Tags:
1. Open any vertical page
2. Open DevTools > Console
3. Run: `document.title` - should show vertical-specific title
4. Run: `document.querySelector('meta[property="og:title"]').content` - should match
5. Run: `document.querySelector('link[rel="canonical"]').href` - should be correct URL

#### Test Mobile Viewport:
1. DevTools > Toggle device toolbar (Cmd+Shift+M)
2. Test: iPhone SE, iPhone 12, iPad, Galaxy S20
3. Check: no overflow, readable text, touch targets >44px

### 10. Accessibility Tests

- [ ] Tab through page - all interactive elements reachable
- [ ] Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] Check color contrast (WCAG AA minimum)
- [ ] Verify alt text on images (if any added)
- [ ] Test keyboard navigation

---

## Quick Command Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build
npm run lint                   # Run ESLint

# Git
git status                     # Check changes
git add .                      # Stage all changes
git commit -m "Add gimnasios vertical page"
git push origin main           # Deploy to Vercel (auto)

# Check files
ls -lh public/                 # List public assets
cat public/sitemap.xml         # View sitemap
cat public/robots.txt          # View robots.txt
```

---

## Success Criteria

✅ All 4 vertical pages (coaches, gimnasios, restaurantes, clinicas) are live  
✅ Each page has unique H1, meta tags, and content  
✅ Sitemap includes all vertical pages  
✅ No console errors on any page  
✅ Mobile-responsive on all devices  
✅ SEO score 100 on PageSpeed Insights  
✅ All CTAs lead to /register  
✅ Widget loads on main landing  

---

**Last Updated:** 2026-02-21  
**Status:** Ready for deployment
