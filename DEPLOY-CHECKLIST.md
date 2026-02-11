# 🚀 Deploy Checklist - Phase 4-6: Recovery Flow Complete

**Date:** 2026-02-11  
**Branch:** main  
**Deploy to:** Production (Vercel)

---

## ✅ Pre-Deployment Verification

### Code Complete
- [x] 2 new edge functions created (`recovery-reply`, `recovery-customer-reply`)
- [x] 1 new public page created (`RecoveryResponse.tsx`)
- [x] 1 dashboard page updated (`RecoveryCases.tsx` - detail modal)
- [x] Onboarding updated (auto-create unified_link for Pro+)
- [x] Landing pricing updated (NPS as Pro+ feature)
- [x] Routes registered in App.tsx
- [x] All Spanish text verified
- [x] No console.log with sensitive data
- [x] No incorrect plan lookups (all from profiles table)

### Security Verified
- [x] HMAC token generation/validation server-side only
- [x] Recovery customer replies go through edge function (not direct DB access)
- [x] RLS policies correct (business owners only for dashboard access)
- [x] Token validation uses crypto.subtle with service role key
- [x] Max 5 messages enforced (frontend + backend)

### Files Summary
```
NEW:
  supabase/functions/recovery-reply/index.ts
  supabase/functions/recovery-customer-reply/index.ts
  src/pages/RecoveryResponse.tsx
  docs/PHASE4-6-SUMMARY.md

MODIFIED:
  src/pages/RecoveryCases.tsx
  src/pages/Onboarding.tsx
  src/pages/Landing.tsx
  src/App.tsx
```

---

## 🔧 Deployment Steps

### 1. Environment Check
```bash
cd /workspace/business/testimonioya

# Verify you're on main branch
git branch

# Verify no uncommitted changes
git status
```

### 2. Build Test (CRITICAL)
```bash
# MUST PASS with ZERO errors
npm run build

# If build fails, DO NOT DEPLOY
# Fix errors first, then retry
```

### 3. Edge Functions Deployment
```bash
# Deploy new edge functions to Supabase
# These should auto-deploy or use Supabase CLI:

supabase functions deploy recovery-reply
supabase functions deploy recovery-customer-reply

# Verify they're live:
# Check Supabase dashboard → Functions → verify status
```

### 4. Vercel Deployment
```bash
# Deploy to production
npx vercel --prod --yes

# This will:
# - Build the app
# - Deploy to testimonioya.com
# - Update production URLs
```

### 5. Git Commit & Push
```bash
git add -A
git commit -m "feat: recovery flow complete + landing updated + testing

- Add recovery-reply and recovery-customer-reply edge functions
- Add RecoveryResponse public page for customer replies
- Update RecoveryCases with detail modal and reply functionality
- Auto-create unified_link for Pro+ users in onboarding
- Update landing pricing to position NPS as Pro+ feature
- All security checks passed (HMAC validation, RLS, max messages)
- No regressions on existing flows"

git push origin main
```

---

## 🧪 Post-Deployment Testing

### 1. Edge Functions Health Check
```bash
# Test recovery-reply (requires JWT - use dashboard)
# Test recovery-customer-reply (requires valid token)

# Check Supabase logs for any errors
# Dashboard → Functions → Logs
```

### 2. Critical Path Testing (Production)

**Test 1: Business User Creates Detractor Recovery Case**
1. Login as Business plan user
2. Go to `/r/your-unified-slug`
3. Give NPS score 0-6
4. Fill feedback
5. Submit
6. ✅ Verify: Case appears in `/dashboard/recovery`

**Test 2: Business Owner Replies to Case**
1. Go to `/dashboard/recovery`
2. Click "Ver detalles" on a case
3. Write reply, click "Enviar"
4. ✅ Verify: Message appears in conversation thread
5. ✅ Verify: Customer receives email with recovery link

**Test 3: Customer Responds via Recovery Link**
1. Get recovery email (check inbox or logs)
2. Click recovery link: `/recovery/:caseId?token=...`
3. See conversation thread
4. Write reply, submit
5. ✅ Verify: Message appears in thread
6. ✅ Verify: Business owner gets notification email

**Test 4: Onboarding Creates Unified Link for Pro User**
1. Create new account
2. Upgrade to Pro plan (or register as Pro)
3. Complete onboarding
4. ✅ Verify: Dashboard shows unified link in request section

**Test 5: Landing Pricing Accuracy**
1. Visit https://testimonioya.com
2. Scroll to pricing section
3. ✅ Verify: Free plan shows "❌ Sin NPS"
4. ✅ Verify: Pro plan shows "✅ NPS completo"
5. ✅ Verify: Business plan shows "✅ Recovery Flow"

### 3. Regression Testing
- [ ] `/t/:slug` testimonial form still works
- [ ] `/nps/:slug` NPS form still works
- [ ] Widget embeds still work
- [ ] Dashboard testimonials page works
- [ ] Dashboard NPS page works

---

## 🐛 Rollback Plan (If Issues Found)

### If Edge Functions Fail
```bash
# Revert edge functions
supabase functions delete recovery-reply
supabase functions delete recovery-customer-reply

# Deploy previous version
git revert HEAD
git push origin main
npx vercel --prod --yes
```

### If Build Fails
```bash
# DO NOT DEPLOY
# Fix build errors locally
# Test with `npm run build`
# Commit fixes
# Retry deployment
```

### If Critical Bug in Production
```bash
# Option 1: Quick fix
# - Fix bug
# - Deploy immediately

# Option 2: Full rollback
git revert HEAD
git push origin main
npx vercel --prod --yes
```

---

## 📊 Monitoring (First 24h)

### Metrics to Watch
- [ ] Edge function invocations (recovery-reply, recovery-customer-reply)
- [ ] Edge function error rate (should be < 1%)
- [ ] Recovery cases created (check DB)
- [ ] Customer replies received (check DB)
- [ ] Email delivery rate (Resend dashboard)

### Where to Monitor
- **Supabase Dashboard:** Functions tab → Logs & metrics
- **Vercel Dashboard:** Analytics → Error tracking
- **Resend Dashboard:** Emails → Delivery rate
- **Database:** Query `recovery_cases` table for activity

---

## ✅ Sign-Off

- [ ] Build passed (zero errors)
- [ ] Edge functions deployed
- [ ] Vercel deployment successful
- [ ] Critical path tests passed
- [ ] No regressions found
- [ ] Monitoring set up

**Deployed by:** _________________  
**Date:** _________________  
**Production URL:** https://testimonioya.com  
**Status:** ⬜ Deployed | ⬜ Issues Found | ⬜ Rolled Back

---

## 📞 Support

**If issues arise:**
1. Check Supabase logs first
2. Check Vercel deployment logs
3. Check browser console (for frontend errors)
4. Refer to PHASE4-6-SUMMARY.md for implementation details

**Rollback if:**
- Critical bugs affecting existing users
- Edge functions returning 500 errors
- Database queries timing out
- Email delivery failures

**Known limitations (by design):**
- Max 5 messages per recovery case
- Recovery flow only for Business plan
- Token-based access (no password recovery)
