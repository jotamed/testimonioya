# Deployment: Opt-in Toggles for Unified Flow and Recovery Flow

## Summary
Added opt-in toggles to make the unified NPS→Testimonio flow and Recovery Flow optional (not enabled by default).

## Changes Made

### 1. Database Migration
**File:** `migrations/008_add_flow_toggles.sql`
- Added `use_unified_flow` boolean column (default FALSE)
- Added `use_recovery_flow` boolean column (default FALSE)

**⚠️ MUST RUN MANUALLY:**
```bash
# Option 1: Via Supabase CLI (if available)
cd business/testimonioya
supabase db push

# Option 2: Via Management API
ACCESS_TOKEN=$(cat ~/.supabase/access-token)
curl -s -X POST "https://api.supabase.com/v1/projects/wnmfanhejnrtfccemlai/database/query" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS use_unified_flow BOOLEAN DEFAULT FALSE; ALTER TABLE businesses ADD COLUMN IF NOT EXISTS use_recovery_flow BOOLEAN DEFAULT FALSE;"}'

# Option 3: Via Supabase Dashboard SQL Editor
# Copy and paste the contents of migrations/008_add_flow_toggles.sql
```

### 2. Type Definitions
**File:** `src/lib/supabase.ts`
- Added `use_unified_flow?: boolean` to Business type
- Added `use_recovery_flow?: boolean` to Business type

### 3. Settings Page
**File:** `src/pages/Settings.tsx`
- Added new tab: "Flujo de Recolección" (only visible for Pro+ users)
- Added toggle: "Usar flujo unificado NPS→Testimonio"
  - When enabled: auto-creates or reactivates unified_link
  - When disabled: deactivates unified_link (doesn't delete)
  - Shows unified link URL after enabling
- Added toggle: "Activar Recovery Flow" (only visible for Business plan AND when unified flow is ON)
- Added state management for toggles and unified link creation
- Added `handleToggleUnifiedFlow` function
- Added `Workflow` icon import

### 4. Request Testimonial Page
**File:** `src/pages/RequestTestimonial.tsx`
- Updated `hasUnifiedFlow` logic to check `business?.use_unified_flow`
- Added hint banner when Pro+ user hasn't enabled unified flow yet:
  - "Activa el flujo unificado en Configuración para usar esta función"
  - Shows purple banner with link to Settings

### 5. Onboarding
**File:** `src/pages/Onboarding.tsx`
- **REMOVED** auto-creation of unified_link during onboarding
- Removed `getPlanLimits` import (no longer used)
- Users will now enable unified flow manually in Settings when ready

### 6. Dashboard Layout
**File:** `src/components/DashboardLayout.tsx`
- Updated "Casos" sidebar item visibility logic:
  - Only shows if `userPlan === 'business' AND currentBusiness?.use_recovery_flow === true`

### 7. Recovery Cases Page
**File:** `src/pages/RecoveryCases.tsx`
- Added check for `business?.use_recovery_flow`
- Shows message when disabled: "Activa el Recovery Flow en Configuración"
- Links to Settings page with collection tab pre-selected

## Testing Checklist

### Before Deploy
- [ ] Run database migration (see above)
- [ ] Build passes: `npm run build`

### After Deploy
- [ ] Free user: Cannot see "Flujo de Recolección" tab in Settings
- [ ] Pro user: Can see "Flujo de Recolección" tab
- [ ] Pro user: Toggle unified flow ON → unified link created and URL shown
- [ ] Pro user: Unified link appears in RequestTestimonial page after enabled
- [ ] Pro user with unified flow OFF: Sees hint in RequestTestimonial page
- [ ] Business user: Can see Recovery Flow toggle (only when unified flow is ON)
- [ ] Business user with recovery flow OFF: "Casos" not visible in sidebar
- [ ] Business user with recovery flow OFF: RecoveryCases page shows message
- [ ] Toggle unified flow OFF → recovery flow also gets disabled
- [ ] New user onboarding: No unified link auto-created

## Deployment Steps

```bash
cd /workspace/business/testimonioya

# 1. Ensure DB migration has been run (see above)

# 2. Build the project
npm run build
# MUST pass with zero errors

# 3. Deploy to Vercel
npx vercel --prod --yes

# 4. Commit and push
git add -A
git commit -m "feat: opt-in toggles for unified flow and recovery flow"
git push
```

## Rollback Plan

If issues arise:

1. **Revert code:**
   ```bash
   git revert HEAD
   git push
   npx vercel --prod --yes
   ```

2. **Database columns are safe to leave** (default FALSE won't affect existing functionality)

3. **To remove columns** (only if necessary):
   ```sql
   ALTER TABLE businesses DROP COLUMN IF EXISTS use_unified_flow;
   ALTER TABLE businesses DROP COLUMN IF EXISTS use_recovery_flow;
   ```

## Post-Deployment Tasks

1. Test all scenarios in the checklist above
2. Monitor for errors in Vercel logs
3. Check that existing Pro/Business users can enable flows
4. Verify new users don't get auto-created unified links

## Notes

- All existing businesses default to flows disabled (FALSE)
- Existing unified_links remain active (not affected by this change)
- To activate for existing businesses, they must manually toggle in Settings
- Recovery flow can only be enabled if unified flow is enabled first
