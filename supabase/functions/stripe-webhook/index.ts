import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
  })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const signature = req.headers.get('Stripe-Signature')!
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const businessId = session.metadata?.business_id
      
      if (businessId) {
        // Determine plan from price
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = subscription.items.data[0].price.id
        
        const proPriceId = Deno.env.get('STRIPE_PRO_PRICE_ID')
        const premiumPriceId = Deno.env.get('STRIPE_PREMIUM_PRICE_ID')
        
        let plan = 'free'
        if (priceId === proPriceId) plan = 'pro'
        else if (priceId === premiumPriceId) plan = 'premium'

        await supabase
          .from('businesses')
          .update({ 
            plan,
            stripe_subscription_id: session.subscription,
          })
          .eq('id', businessId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      await supabase
        .from('businesses')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const priceId = subscription.items.data[0].price.id
      
      const proPriceId = Deno.env.get('STRIPE_PRO_PRICE_ID')
      const premiumPriceId = Deno.env.get('STRIPE_PREMIUM_PRICE_ID')
      
      let plan = 'free'
      if (priceId === proPriceId) plan = 'pro'
      else if (priceId === premiumPriceId) plan = 'premium'
      
      if (subscription.status === 'active') {
        await supabase
          .from('businesses')
          .update({ plan })
          .eq('stripe_subscription_id', subscription.id)
      }
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
