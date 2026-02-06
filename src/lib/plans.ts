import { supabase } from './supabase'

// Plan limits configuration - NPS-First model
export const PLAN_LIMITS = {
  free: {
    // NPS
    npsPerMonth: 25,
    // Testimonials (from promoters)
    testimonialsPerMonth: 10,
    collectionLinks: 1,
    businesses: 1,
    // Features
    removesBranding: false,
    hasWidget: false,
    hasAudioTestimonials: false,
    hasVideoTestimonials: false,
    hasEmailAutomation: false,
    hasNpsDashboard: false, // Only basic score
    hasAnalytics: false,
    hasApi: false,
    hasIntegrations: false,
    hasWhiteLabel: false,
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
    hasEmailAutomation: true,
    hasNpsDashboard: true, // Full dashboard
    hasAnalytics: false,
    hasApi: false,
    hasIntegrations: false,
    hasWhiteLabel: false,
  },
  premium: {
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
    hasEmailAutomation: true,
    hasNpsDashboard: true,
    hasAnalytics: true,
    hasApi: true,
    hasIntegrations: true, // Zapier, webhooks
    hasWhiteLabel: true,
  },
} as const

export type PlanType = keyof typeof PLAN_LIMITS

// Plan display info
export const PLAN_INFO = {
  free: {
    name: 'Gratis',
    price: 0,
    description: 'Para probar el sistema',
    features: [
      '25 encuestas NPS/mes',
      '10 testimonios/mes',
      '1 enlace',
      'Muro público',
      'NPS Score básico',
    ],
    limitations: [
      'Solo texto',
      'Marca TestimonioYa',
      'Sin automatización',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19,
    description: 'Para negocios que quieren crecer',
    features: [
      'Encuestas NPS ilimitadas',
      'Testimonios ilimitados',
      'Enlaces ilimitados',
      'Audio + Video testimonios',
      'Widget embebible',
      'Email automático post-compra',
      'Dashboard NPS completo',
      'Sin marca',
    ],
    limitations: [],
    popular: true,
  },
  premium: {
    name: 'Premium',
    price: 49,
    description: 'Para agencias y multi-negocio',
    features: [
      'Todo lo de Pro',
      'Hasta 5 negocios',
      'Analytics avanzados',
      'API / Webhooks',
      'Integraciones (Zapier, etc)',
      'White-label completo',
      'Soporte prioritario',
    ],
    limitations: [],
  },
} as const

// Get limits for a plan
export const getPlanLimits = (plan: PlanType) => PLAN_LIMITS[plan]

// Get display info for a plan
export const getPlanInfo = (plan: PlanType) => PLAN_INFO[plan]

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

// Check if business can send more NPS surveys this month
export const canSendNps = async (businessId: string, plan: PlanType): Promise<{ allowed: boolean; current: number; limit: number }> => {
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
export const hasFeature = (plan: PlanType, feature: keyof typeof PLAN_LIMITS.free): boolean => {
  const value = PLAN_LIMITS[plan][feature]
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  return false
}

// Get usage stats for a business
export const getUsageStats = async (businessId: string, plan: PlanType) => {
  const [testimonialCheck, linkCheck, npsCheck] = await Promise.all([
    canReceiveTestimonial(businessId, plan),
    canCreateCollectionLink(businessId, plan),
    canSendNps(businessId, plan),
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
