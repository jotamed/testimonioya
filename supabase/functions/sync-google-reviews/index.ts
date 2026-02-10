import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')

    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!
    ).auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, businessId, placeId, query } = await req.json()

    // Action: search for a place by name
    if (action === 'search') {
      if (!googleApiKey) {
        return new Response(JSON.stringify({ error: 'Google API not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleApiKey}`
      const searchRes = await fetch(searchUrl)
      const searchData = await searchRes.json()

      const results = (searchData.results || []).slice(0, 5).map((r: any) => ({
        place_id: r.place_id,
        name: r.name,
        address: r.formatted_address,
        rating: r.rating,
        total_ratings: r.user_ratings_total,
      }))

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: connect place to business
    if (action === 'connect') {
      // Verify ownership
      const { data: biz } = await supabaseClient
        .from('businesses')
        .select('id, user_id')
        .eq('id', businessId)
        .eq('user_id', user.id)
        .single()

      if (!biz) {
        return new Response(JSON.stringify({ error: 'Business not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error: updateError } = await supabaseClient
        .from('businesses')
        .update({
          google_place_id: placeId,
          reviews_auto_sync: true,
        })
        .eq('id', businessId)

      if (updateError) throw updateError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: sync reviews from Google
    if (action === 'sync') {
      // Get business with place_id
      const { data: biz } = await supabaseClient
        .from('businesses')
        .select('id, user_id, google_place_id')
        .eq('id', businessId)
        .eq('user_id', user.id)
        .single()

      if (!biz || !biz.google_place_id) {
        return new Response(JSON.stringify({ error: 'No Google Place connected' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (!googleApiKey) {
        return new Response(JSON.stringify({ error: 'Google API not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Fetch place details with reviews
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${biz.google_place_id}&fields=reviews,rating,user_ratings_total&key=${googleApiKey}`
      const detailsRes = await fetch(detailsUrl)
      const detailsData = await detailsRes.json()

      const googleReviews = detailsData.result?.reviews || []
      let imported = 0
      let skipped = 0

      for (const review of googleReviews) {
        const externalId = `google_${review.time}_${review.author_name?.replace(/\s/g, '_')}`

        // Upsert — skip if already exists
        const { error: insertError } = await supabaseClient
          .from('external_reviews')
          .upsert(
            {
              business_id: businessId,
              platform: 'google',
              author_name: review.author_name || 'Anónimo',
              rating: review.rating,
              review_text: review.text || null,
              review_date: new Date(review.time * 1000).toISOString(),
              external_id: externalId,
            },
            {
              onConflict: 'business_id,platform,external_id',
              ignoreDuplicates: true,
            }
          )

        if (insertError) {
          skipped++
        } else {
          imported++
        }
      }

      // Update last synced
      await supabaseClient
        .from('businesses')
        .update({ reviews_last_synced: new Date().toISOString() })
        .eq('id', businessId)

      return new Response(
        JSON.stringify({
          success: true,
          imported,
          skipped,
          total_from_google: googleReviews.length,
          overall_rating: detailsData.result?.rating,
          total_ratings: detailsData.result?.user_ratings_total,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Action: disconnect
    if (action === 'disconnect') {
      await supabaseClient
        .from('businesses')
        .update({
          google_place_id: null,
          reviews_auto_sync: false,
        })
        .eq('id', businessId)
        .eq('user_id', user.id)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
