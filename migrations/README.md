# Migration: Plan from Business Level to User Level

## Overview
This migration moves the subscription plan from business-level to user-level storage. Previously, each business had its own `plan` column. Now, the plan is stored in the `profiles` table and applies to all businesses owned by that user.

## Why This Change?
- **Simplified subscription management**: One subscription per user, not per business
- **Better for multi-business users**: Premium plan users can manage up to 5 businesses with a single subscription
- **Clearer pricing model**: Users pay for their account level, not per business
- **Easier Stripe integration**: Stripe customer/subscription IDs now stored at user level

## Migration Date
2026-02-09

## What Changed

### Database (SQL)
- **Added to `profiles` table**:
  - `plan` (TEXT, default 'free')
  - `stripe_customer_id` (TEXT)
  - `stripe_subscription_id` (TEXT)
  - `plan_updated_at` (TIMESTAMPTZ)
- **Existing data migrated**: Plan copied from businesses to user profiles (highest plan if multiple businesses)
- **Deprecated in `businesses` table**: `plan` column kept temporarily for rollback safety but marked as deprecated

### Frontend
- **New hook**: `src/lib/useUserPlan.ts` - Gets user's plan with real-time updates
- **Updated `src/lib/plans.ts`**: All functions now get user's plan from profiles table
  - `canReceiveTestimonial(businessId, userId)` - now requires userId instead of plan
  - `canSendNps(businessId, userId)` - now requires userId instead of plan
  - `canCreateCollectionLink(businessId, userId)` - now requires userId instead of plan
  - `canCreateBusiness(userId)` - now gets plan from user automatically
  - `getUsageStats(businessId, userId)` - now requires userId instead of plan
- **Updated components**: All components using `business.plan` now use `useUserPlan()` hook
  - Dashboard.tsx
  - DashboardLayout.tsx
  - Widget.tsx
  - TestimonialForm.tsx
  - CollectionLinks.tsx
  - Analytics.tsx
  - NpsForm.tsx
  - WallOfLove.tsx
- **Updated `Business` type**: `plan` field marked as `@deprecated`

### Backend (Stripe Webhook)
- **Updated**: `supabase/functions/stripe-webhook/index.ts`
  - Now writes plan to `profiles` table instead of `businesses` table
  - Uses `user_id` from metadata instead of `business_id`
  - All subscription events (created, updated, deleted) update user plan

## How to Apply

### 1. Run SQL Migration
```sql
-- Connect to your Supabase database and run:
\i migrations/move-plan-to-user.sql
```

**⚠️ IMPORTANT**: Test in a staging environment first!

### 2. Update Stripe Checkout Sessions
Any code that creates Stripe checkout sessions must now pass `user_id` in metadata instead of `business_id`:

```typescript
// OLD
metadata: { business_id: business.id }

// NEW
metadata: { user_id: user.id }
```

### 3. Deploy Frontend
Deploy the updated frontend code after the SQL migration is complete.

### 4. No Need to Touch Edge Functions
The Stripe webhook is already updated in this commit. Just deploy it.

## Rollback Instructions
If you need to rollback, see the comments at the end of `migrations/move-plan-to-user.sql`

## Testing Checklist
- [ ] Run SQL migration in staging
- [ ] Verify plan appears correctly in user profiles
- [ ] Test creating a new business (should not set plan)
- [ ] Test Stripe checkout (should update user plan, not business plan)
- [ ] Test subscription cancellation (should revert user to free)
- [ ] Test all plan limits (testimonials, links, NPS, businesses)
- [ ] Test multi-business scenario (Premium user with 5 businesses)

## Breaking Changes
⚠️ **API consumers**: If you have external code querying `businesses.plan`, update it to query `profiles.plan` instead via the user_id.

## Support
If you encounter issues, check:
1. SQL migration ran successfully
2. `profiles` table has new columns
3. Existing plans migrated correctly
4. Frontend hooks are loading user plan
5. Stripe webhook is deployed and receiving events
