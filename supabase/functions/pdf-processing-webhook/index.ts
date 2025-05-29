
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

    const body = await req.json()
    console.log('Received webhook payload:', JSON.stringify(body, null, 2))

    // Handle different payload formats from n8n
    let uploadId, processedContent, status = 'completed'
    
    // Check if this is the format from your n8n workflow
    if (body.success && body.data) {
      // Extract uploadId and processed content from the n8n format
      // Assuming the uploadId was passed in the initial request to n8n
      // We'll need to extract it from the data or URL
      
      if (Array.isArray(body.data) && body.data.length > 0) {
        // If data is an array, take the first item as processed content
        processedContent = typeof body.data[0] === 'string' ? body.data[0] : JSON.stringify(body.data[0])
      } else if (typeof body.data === 'string') {
        processedContent = body.data
      } else {
        processedContent = JSON.stringify(body.data)
      }

      // Try to get uploadId from query parameters or headers
      const url = new URL(req.url)
      uploadId = url.searchParams.get('uploadId')
      
      if (!uploadId) {
        console.error('No uploadId found in request')
        return new Response(
          JSON.stringify({ error: 'uploadId is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } else {
      // Handle the expected format with uploadId, status, processedContent
      ({ uploadId, status = 'completed', processedContent } = body)
    }

    console.log('Processing update:', { uploadId, status, processedContent: processedContent ? 'present' : 'none' })

    if (!uploadId) {
      console.error('Missing uploadId in payload')
      return new Response(
        JSON.stringify({ error: 'uploadId is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the PDF upload record
    const updateData: any = {
      processing_status: status,
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
