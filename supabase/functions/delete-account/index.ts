import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create client with user's token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get confirmation from request body
    const { confirmation } = await req.json()
    if (confirmation !== 'ELIMINAR') {
      throw new Error('Invalid confirmation. Please type ELIMINAR to confirm.')
    }

    // Create admin client for deletion operations
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's business
    const { data: business } = await adminClient
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (business) {
      // Delete all testimonials
      await adminClient
        .from('testimonials')
        .delete()
        .eq('business_id', business.id)

      // Delete all NPS responses
      await adminClient
        .from('nps_responses')
        .delete()
        .eq('business_id', business.id)

      // Delete all collection links
      await adminClient
        .from('collection_links')
        .delete()
        .eq('business_id', business.id)

      // Delete the business
      await adminClient
        .from('businesses')
        .delete()
        .eq('id', business.id)

      // Delete files from storage
      const { data: files } = await adminClient.storage
        .from('audio-testimonials')
        .list(`testimonials/${business.id}`)
      
      if (files && files.length > 0) {
        const filePaths = files.map(f => `testimonials/${business.id}/${f.name}`)
        await adminClient.storage.from('audio-testimonials').remove(filePaths)
      }

      // Video files too
      const { data: videoFiles } = await adminClient.storage
        .from('video-testimonials')
        .list(`testimonials/${business.id}`)
      
      if (videoFiles && videoFiles.length > 0) {
        const videoPaths = videoFiles.map(f => `testimonials/${business.id}/${f.name}`)
        await adminClient.storage.from('video-testimonials').remove(videoPaths)
      }
    }

    // Delete the user account
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
      throw new Error('Failed to delete user account: ' + deleteError.message)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Delete account error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
