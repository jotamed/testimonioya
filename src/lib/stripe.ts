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
      '10 testimonios/mes',
      '1 enlace de recolección',
      'Muro público básico',
      'Marca TestimonioYa',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || '',
    features: [
      'Testimonios ilimitados',
      'Enlaces ilimitados',
      'Sin marca TestimonioYa',
      'Widget embebido',
      'Personalización total',
    ],
  },
  premium: {
    name: 'Premium',
    price: 49,
    priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || '',
    features: [
      'Todo lo de Pro',
      'Hasta 5 negocios',
      'Analíticas avanzadas',
      'Soporte prioritario',
      'API access',
    ],
  },
} as const
