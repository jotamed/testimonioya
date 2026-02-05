import { supabase } from './supabase'

// Plan limits configuration
export const PLAN_LIMITS = {
  free: {
    testimonialsPerMonth: 10,
    collectionLinks: 1,
    businesses: 1,
    removesBranding: false,
    hasWidget: false,
    hasAnalytics: false,
    hasApi: false,
  },
  pro: {
    testimonialsPerMonth: Infinity,
    collectionLinks: Infinity,
    businesses: 1,
    removesBranding: true,
    hasWidget: true,
    hasAnalytics: false,
    hasApi: false,
  },
  premium: {
    testimonialsPerMonth: Infinity,
    collectionLinks: Infinity,
    businesses: 5,
    removesBranding: true,
    hasWidget: true,
    hasAnalytics: true,
    hasApi: true,
  },
} as const

export type PlanType = keyof typeof PLAN_LIMITS

// Get limits for a plan
export const getPlanLimits = (plan: PlanType) => PLAN_LIMITS[plan]

// Check if business can receive more testimonials this month
export const canReceiveTestimonial = async (businessId: string, plan: PlanType): Promise<{ allowed: boolean; current: number; limit: number }> => {
  const limits = getPlanLimits(plan)
  
  if (limits.testimonialsPerMonth === Infinity) {
    return { allowed: true, current: 0, limit: Infinity }
  }

  // Get testimonials from current month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('created_at', startOfMonth.toISOString())

  if (error) {
    console.error('Error checking testimonial limit:', error)
    return { allowed: true, current: 0, limit: limits.testimonialsPerMonth } // Fail open
  }

  const current = count || 0
  return {
    allowed: current < limits.testimonialsPerMonth,
    current,
    limit: limits.testimonialsPerMonth,
  }
}

// Check if business can create more collection links
export const canCreateCollectionLink = async (businessId: string, plan: PlanType): Promise<{ allowed: boolean; current: number; limit: number }> => {
  const limits = getPlanLimits(plan)
  
  if (limits.collectionLinks === Infinity) {
    return { allowed: true, current: 0, limit: Infinity }
  }

  const { count, error } = await supabase
    .from('collection_links')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  if (error) {
    console.error('Error checking link limit:', error)
    return { allowed: true, current: 0, limit: limits.collectionLinks }
  }

  const current = count || 0
  return {
    allowed: current < limits.collectionLinks,
    current,
    limit: limits.collectionLinks,
  }
}

// Check if user can create more businesses
export const canCreateBusiness = async (userId: string, plan: PlanType): Promise<{ allowed: boolean; current: number; limit: number }> => {
  const limits = getPlanLimits(plan)

  const { count, error } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('Error checking business limit:', error)
    return { allowed: true, current: 0, limit: limits.businesses }
  }

  const current = count || 0
  return {
    allowed: current < limits.businesses,
    current,
    limit: limits.businesses,
  }
}

// Check if plan has feature
export const hasFeature = (plan: PlanType, feature: keyof Omit<typeof PLAN_LIMITS.free, 'testimonialsPerMonth' | 'collectionLinks' | 'businesses'>): boolean => {
  return PLAN_LIMITS[plan][feature] as boolean
}

// Get usage stats for a business
export const getUsageStats = async (businessId: string, plan: PlanType) => {
  const [testimonialCheck, linkCheck] = await Promise.all([
    canReceiveTestimonial(businessId, plan),
    canCreateCollectionLink(businessId, plan),
  ])

  return {
    testimonials: testimonialCheck,
    links: linkCheck,
  }
}
