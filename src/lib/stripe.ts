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
    price: 0,
    priceId: null,
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
    price: 19,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || '',
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
    price: 49,
    priceId: import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID || '',
    features: [
      'Todo lo de Pro',
      'Hasta 5 negocios',
      'Analytics avanzados',
      'Soporte prioritario',
    ],
  },
} as const
