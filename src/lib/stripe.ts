import { loadStripe } from '@stripe/stripe-js'

// Stripe publishable key - safe to expose in frontend
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''

let stripePromise: ReturnType<typeof loadStripe> | null = null

export const getStripe = () => {
  if (!stripePromise && STRIPE_KEY) {
    stripePromise = loadStripe(STRIPE_KEY)
  }
  return stripePromise
}

// Price IDs from Stripe Dashboard
export const PLANS = {
  free: {
    name: 'Gratis',
    monthlyPrice: 0,
    annualPrice: 0,
    annualMonthlyPrice: 0,
    monthlyPriceId: null as string | null,
    annualPriceId: null as string | null,
    features: [
      '15 testimonios/mes',
      '2 enlaces de recolección',
      'Muro público',
      'NPS básico',
      'Solo texto',
      'Branding TestimonioYa',
    ],
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 19,
    annualPrice: 180,
    annualMonthlyPrice: 15,
    monthlyPriceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || '',
    annualPriceId: import.meta.env.VITE_STRIPE_PRO_ANNUAL_PRICE_ID || '',
    features: [
      'Testimonios ilimitados',
      'Enlaces ilimitados',
      'Sin branding',
      'Audio + Video',
      'Widget embebible',
      'NPS dashboard completo',
      'Analytics',
      'QR + Google Reviews redirect',
      '1 negocio',
    ],
  },
  business: {
    name: 'Business',
    monthlyPrice: 49,
    annualPrice: 468,
    annualMonthlyPrice: 39,
    monthlyPriceId: import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID || '',
    annualPriceId: import.meta.env.VITE_STRIPE_BUSINESS_ANNUAL_PRICE_ID || '',
    features: [
      'Todo lo de Pro',
      'Hasta 5 negocios',
      'Analytics avanzados',
      'Soporte prioritario',
    ],
  },
} as const
