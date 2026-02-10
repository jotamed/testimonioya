import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

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
    const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')!
    const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')!
    const redirectUri = 'https://testimonioya.com/auth/google-business/callback'

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

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

    const { action, code, businessId } = await req.json()

    // Action: get OAuth URL
    if (action === 'auth_url') {
      const state = btoa(JSON.stringify({ userId: user.id, businessId }))
      const scopes = 'https://www.googleapis.com/auth/business.manage'
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`

      return new Response(JSON.stringify({ url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: exchange code for tokens
    if (action === 'exchange') {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })
      const tokens = await tokenRes.json()

      if (tokens.error) {
        return new Response(JSON.stringify({ error: tokens.error_description || tokens.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Store tokens securely in the business record
      await supabaseClient
        .from('businesses')
        .update({
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token || null,
          google_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        })
        .eq('id', businessId)
        .eq('user_id', user.id)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: list Google Business accounts/locations
    if (action === 'list_locations') {
      const { data: biz } = await supabaseClient
        .from('businesses')
        .select('google_access_token, google_refresh_token, google_token_expiry')
        .eq('id', businessId)
        .eq('user_id', user.id)
        .single()

      if (!biz?.google_access_token) {
        return new Response(JSON.stringify({ error: 'Not connected to Google Business' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Refresh token if expired
      let accessToken = biz.google_access_token
      if (biz.google_token_expiry && new Date(biz.google_token_expiry) < new Date()) {
        const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            refresh_token: biz.google_refresh_token,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
          }),
        })
        const refreshData = await refreshRes.json()
        if (refreshData.access_token) {
          accessToken = refreshData.access_token
          await supabaseClient
            .from('businesses')
            .update({
              google_access_token: accessToken,
              google_token_expiry: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
            })
            .eq('id', businessId)
        }
      }

      // List accounts
      const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const accountsData = await accountsRes.json()
      const accounts = accountsData.accounts || []

      // For each account, list locations
      const locations: any[] = []
      for (const account of accounts) {
        const locRes = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const locData = await locRes.json()
        for (const loc of (locData.locations || [])) {
          const addr = loc.storefrontAddress
          locations.push({
            name: loc.name, // e.g. "locations/123456"
            title: loc.title,
            address: addr ? [addr.addressLines?.join(', '), addr.locality, addr.regionCode].filter(Boolean).join(', ') : '',
            accountName: account.name,
          })
        }
      }

      return new Response(JSON.stringify({ locations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: sync all reviews from Google Business Profile
    if (action === 'sync_reviews') {
      const { data: biz } = await supabaseClient
        .from('businesses')
        .select('google_access_token, google_refresh_token, google_token_expiry, google_business_location')
        .eq('id', businessId)
        .eq('user_id', user.id)
        .single()

      if (!biz?.google_access_token || !biz?.google_business_location) {
        return new Response(JSON.stringify({ error: 'Google Business not fully connected' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Refresh token if needed
      let accessToken = biz.google_access_token
      if (biz.google_token_expiry && new Date(biz.google_token_expiry) < new Date()) {
        const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            refresh_token: biz.google_refresh_token,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
          }),
        })
        const refreshData = await refreshRes.json()
        if (refreshData.access_token) {
          accessToken = refreshData.access_token
          await supabaseClient
            .from('businesses')
            .update({
              google_access_token: accessToken,
              google_token_expiry: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
            })
            .eq('id', businessId)
        }
      }

      // Fetch ALL reviews with pagination
      let imported = 0
      let skipped = 0
      let pageToken: string | undefined
      const location = biz.google_business_location // e.g. "accounts/123/locations/456"

      // Get existing external_ids
      const { data: existing } = await supabaseClient
        .from('external_reviews')
        .select('external_id')
        .eq('business_id', businessId)
        .eq('platform', 'google')
      const existingIds = new Set((existing || []).map((r: any) => r.external_id))

      do {
        const url = `https://mybusiness.googleapis.com/v4/${location}/reviews${pageToken ? '?pageToken=' + pageToken : ''}`
        const reviewsRes = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const reviewsData = await reviewsRes.json()

        if (reviewsData.error) {
          console.error('Google API error:', reviewsData.error)
          break
        }

        const reviews = reviewsData.reviews || []

        for (const review of reviews) {
          const externalId = review.reviewId || `gbp_${review.createTime}`

          if (existingIds.has(externalId)) {
            skipped++
            continue
          }

          // Map Google star rating to number
          const ratingMap: Record<string, number> = {
            ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
          }
          const rating = ratingMap[review.starRating] || 3

          const { error: insertError } = await supabaseClient
            .from('external_reviews')
            .insert({
              business_id: businessId,
              platform: 'google',
              author_name: review.reviewer?.displayName || 'Anónimo',
              rating,
              review_text: review.comment || null,
              review_date: review.createTime || new Date().toISOString(),
              external_id: externalId,
              status: 'pending',
              approved: false,
            })

          if (insertError) {
            console.error('Insert error:', insertError)
            skipped++
          } else {
            imported++
            existingIds.add(externalId)
          }
        }

        pageToken = reviewsData.nextPageToken
      } while (pageToken)

      // Update last synced
      await supabaseClient
        .from('businesses')
        .update({ reviews_last_synced: new Date().toISOString() })
        .eq('id', businessId)

      return new Response(
        JSON.stringify({ success: true, imported, skipped }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
