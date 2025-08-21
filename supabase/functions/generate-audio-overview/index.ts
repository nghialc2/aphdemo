
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const { notebookId } = await req.json()
    
    if (!notebookId) {
      return new Response(
        JSON.stringify({ error: 'Notebook ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update notebook status to indicate audio generation has started
    const { error: updateError } = await supabase
      .from('notebooks')
      .update({
        audio_overview_generation_status: 'generating'
      })
      .eq('id', notebookId)

    if (updateError) {
      console.error('Error updating notebook status:', updateError)
      throw updateError
    }

    // Get audio generation webhook URL and auth from secrets
    const audioGenerationWebhookUrl = Deno.env.get('AUDIO_GENERATION_WEBHOOK_URL')
    const authHeader = Deno.env.get('NOTEBOOK_GENERATION_AUTH')

    console.log('Environment check:')
    console.log('- AUDIO_GENERATION_WEBHOOK_URL:', audioGenerationWebhookUrl ? 'SET' : 'MISSING')
    console.log('- NOTEBOOK_GENERATION_AUTH:', authHeader ? 'SET' : 'MISSING')

    if (!audioGenerationWebhookUrl || !authHeader) {
      const missingVars = []
      if (!audioGenerationWebhookUrl) missingVars.push('AUDIO_GENERATION_WEBHOOK_URL')
      if (!authHeader) missingVars.push('NOTEBOOK_GENERATION_AUTH')
      
      console.error('Missing required environment variables:', missingVars.join(', '))
      return new Response(
        JSON.stringify({ 
          error: 'Audio generation service not configured', 
          missingVariables: missingVars 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Starting audio overview generation for notebook:', notebookId)

    // Call the external audio generation webhook
    try {
      const audioResponse = await fetch(audioGenerationWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          notebook_id: notebookId,
          callback_url: `${supabaseUrl}/functions/v1/audio-generation-callback`
        })
      })

      if (!audioResponse.ok) {
        const errorText = await audioResponse.text()
        console.error('Audio generation webhook failed:', errorText)
        
        // Update status to failed
        await supabase
          .from('notebooks')
          .update({ audio_overview_generation_status: 'failed' })
          .eq('id', notebookId)
          
        return new Response(
          JSON.stringify({ error: 'Failed to start audio generation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        console.log('Audio generation webhook called successfully for notebook:', notebookId)
      }
    } catch (webhookError) {
      console.error('Webhook call error:', webhookError)
      
      // Update status to failed
      await supabase
        .from('notebooks')
        .update({ audio_overview_generation_status: 'failed' })
        .eq('id', notebookId)
        
      return new Response(
        JSON.stringify({ error: 'Failed to call audio generation webhook' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return immediately with success status
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Audio generation started',
        status: 'generating'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-audio-overview:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to start audio generation' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
