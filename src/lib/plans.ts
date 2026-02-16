import { supabase } from './supabase'

// Plan limits configuration - NPS-First model
export const PLAN_LIMITS = {
  free: {
    // NPS
    npsPerMonth: 0, // NO NPS at all for Free
    // Testimonials (from promoters)
    testimonialsPerMonth: 15, // era 10
    collectionLinks: 2, // era 1
    businesses: 1,
    // Features
    removesBranding: false,
    hasWidget: false,
    hasAudioTestimonials: false,
    hasVideoTestimonials: false,
    hasEmailAutomation: false,
    hasNps: false, // NO NPS for Free
    hasUnifiedFlow: false, // NO unified flow for Free
    hasRecoveryFlow: false, // NO recovery for Free
    hasNpsDashboard: false, // Only basic score
    hasAnalytics: false,
    hasApi: false,
    hasIntegrations: false,
    hasWhiteLabel: false,
    hasReviews: false,
  },
  pro: {
    // NPS
    npsPerMonth: Infinity,
    // Testimonials
    testimonialsPerMonth: Infinity,
    collectionLinks: Infinity,
    businesses: 1,
    // Features
    removesBranding: true,
    hasWidget: true,
    hasAudioTestimonials: true,
    hasVideoTestimonials: true,
    hasEmailAutomation: false, // NO FUNCIONA
    hasNps: true, // NPS enabled for Pro
    hasUnifiedFlow: true, // Unified flow for Pro
    hasRecoveryFlow: false, // NO recovery for Pro
    hasNpsDashboard: true, // Full dashboard
    hasAnalytics: true, // MOVIDO de business a pro
    hasApi: false,
    hasIntegrations: false,
    hasWhiteLabel: false,
    hasReviews: true,
  },
  business: { // RENOMBRADO de premium
    // NPS
    npsPerMonth: Infinity,
    // Testimonials
    testimonialsPerMonth: Infinity,
    collectionLinks: Infinity,
    businesses: 5,
    // Features
    removesBranding: true,
    hasWidget: true,
    hasAudioTestimonials: true,
    hasVideoTestimonials: true,
    hasEmailAutomation: false, // NO FUNCIONA
    hasNps: true, // NPS enabled for Business
    hasUnifiedFlow: true, // Unified flow for Business
    hasRecoveryFlow: true, // Recovery flow for Business
    hasNpsDashboard: true,
    hasAnalytics: true,
    hasApi: true, // mantener flag para futuro pero no mostrar en UI
    hasIntegrations: false, // NO FUNCIONA
    hasWhiteLabel: false, // NO FUNCIONA
    hasReviews: true,
  },
} as const

export type PlanType = keyof typeof PLAN_LIMITS

// Plan display info
export const PLAN_INFO = {
  free: {
    name: 'Gratis',
    price: 0,
    annualPrice: 0,
    annualMonthlyPrice: 0,
    description: 'Para probar el sistema',
    features: [
      '15 testimonios/mes',
      '2 enlaces',
      'Muro público',
      'Solo texto',
      'Branding TestimonioYa',
    ],
    limitations: ['Sin NPS', 'Sin flujo unificado'],
  },
  pro: {
    name: 'Pro',
    price: 19,
    annualPrice: 180,
    annualMonthlyPrice: 15,
    description: 'Para negocios que quieren crecer',
    features: [
      'Testimonios ilimitados',
      'Enlaces ilimitados',
      'Sin branding',
      'Audio + Video',
      'Widget embebible',
      'NPS completo',
      'Flujo unificado NPS→Testimonio',
      'Analytics',
      'QR + Google Reviews redirect',
      '1 negocio',
    ],
    limitations: [],
    popular: true,
  },
  business: { // RENOMBRADO de premium
    name: 'Business',
    price: 49,
    annualPrice: 468,
    annualMonthlyPrice: 39,
    description: 'Para agencias y multi-negocio',
    features: [
      'Todo lo de Pro',
      'Recovery Flow (detractores)',
      'Gestión de casos',
      'Hasta 5 negocios',
      'Analytics avanzados',
      'Soporte prioritario',
    ],
    limitations: [],
  },
} as const

// Get limits for a plan
export const getPlanLimits = (plan: PlanType) => PLAN_LIMITS[plan]

// Get display info for a plan
export const getPlanInfo = (plan: PlanType) => PLAN_INFO[plan]

// Get user's plan from profiles table
const getUserPlan = async (userId: string): Promise<PlanType> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  if (error || !data) {
    console.error('Error getting user plan:', error)
    return 'free' // Fail safe to free plan
  }

  return (data.plan as PlanType) || 'free'
}

// Check if business can receive more testimonials this month
// Now uses user's plan instead of business plan
export const canReceiveTestimonial = async (businessId: string, userId: string): Promise<{ allowed: boolean; current: number; limit: number }> => {
  const plan = await getUserPlan(userId)
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

// Check if business can send more NPS surveys this month
// Now uses user's plan instead of business plan
export const canSendNps = async (businessId: string, userId: string): Promise<{ allowed: boolean; current: number; limit: number }> => {
  const plan = await getUserPlan(userId)
  const limits = getPlanLimits(plan)
  
  if (limits.npsPerMonth === Infinity) {
    return { allowed: true, current: 0, limit: Infinity }
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('nps_responses')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('created_at', startOfMonth.toISOString())

  if (error) {
    console.error('Error checking NPS limit:', error)
    return { allowed: true, current: 0, limit: limits.npsPerMonth }
  }

  const current = count || 0
  return {
    allowed: current < limits.npsPerMonth,
    current,
    limit: limits.npsPerMonth,
  }
}

// Check if business can create more collection links
// Now uses user's plan instead of business plan
export const canCreateCollectionLink = async (businessId: string, userId: string): Promise<{ allowed: boolean; current: number; limit: number }> => {
  const plan = await getUserPlan(userId)
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
// Now uses user's plan from profiles table
export const canCreateBusiness = async (userId: string): Promise<{ allowed: boolean; current: number; limit: number }> => {
  const plan = await getUserPlan(userId)
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
export const hasFeature = (plan: PlanType, feature: keyof typeof PLAN_LIMITS.free): boolean => {
  const value = PLAN_LIMITS[plan][feature]
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  return false
}

// Get usage stats for a business
// Now uses user's plan instead of business plan
export const getUsageStats = async (businessId: string, userId: string) => {
  const [testimonialCheck, linkCheck, npsCheck] = await Promise.all([
    canReceiveTestimonial(businessId, userId),
    canCreateCollectionLink(businessId, userId),
    canSendNps(businessId, userId),
  ])

  return {
    testimonials: testimonialCheck,
    links: linkCheck,
    nps: npsCheck,
  }
}

// Get NPS stats for a business
export const getNpsStats = async (businessId: string) => {
  const { data, error } = await supabase
    .from('nps_responses')
    .select('score, category')
    .eq('business_id', businessId)

  if (error || !data) {
    return { score: 0, total: 0, promoters: 0, passives: 0, detractors: 0 }
  }

  const total = data.length
  const promoters = data.filter(r => r.category === 'promoter').length
  const passives = data.filter(r => r.category === 'passive').length
  const detractors = data.filter(r => r.category === 'detractor').length

  // NPS = % Promoters - % Detractors
  const score = total > 0 
    ? Math.round((promoters / total) * 100 - (detractors / total) * 100)
    : 0

  return { score, total, promoters, passives, detractors }
}
