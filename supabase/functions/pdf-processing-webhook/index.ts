
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { uploadId, status, processedContent, workflowId, error } = await req.json()

    console.log('Received webhook:', { uploadId, status, processedContent: processedContent ? 'present' : 'none', workflowId, error })

    // Update the PDF upload record
    const updateData: any = {
      processing_status: status,
      n8n_workflow_id: workflowId,
    }

    if (status === 'completed' && processedContent) {
      updateData.processed_content = processedContent
      updateData.processed_at = new Date().toISOString()
    }

    const { data, error: updateError } = await supabaseClient
      .from('pdf_uploads')
      .update(updateData)
      .eq('id', uploadId)
      .select()

    if (updateError) {
      console.error('Error updating PDF upload:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update PDF upload' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('PDF upload updated successfully:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in PDF processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
