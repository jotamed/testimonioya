import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'
import Stripe from 'https://esm.sh/stripe@17.4.0?target=deno'

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
      const userId = session.metadata?.user_id
      
      if (userId) {
        // Determine plan from price
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = subscription.items.data[0].price.id
        
        const proPriceId = Deno.env.get('STRIPE_PRO_PRICE_ID')
        const premiumPriceId = Deno.env.get('STRIPE_PREMIUM_PRICE_ID')
        
        let plan = 'free'
        if (priceId === proPriceId) plan = 'pro'
        else if (priceId === premiumPriceId) plan = 'premium'

        // Update plan at USER level (profiles table), not business level
        await supabase
          .from('profiles')
          .update({ 
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      // Update user plan to free when subscription is cancelled
      await supabase
        .from('profiles')
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
      
      // Update user plan when subscription is updated
      if (subscription.status === 'active') {
        await supabase
          .from('profiles')
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
