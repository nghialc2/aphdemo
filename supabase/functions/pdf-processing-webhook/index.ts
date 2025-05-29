
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

    // Extract uploadId from URL query parameters first
    const url = new URL(req.url)
    let uploadId = url.searchParams.get('uploadId')
    
    // Try to extract processed content from the complex n8n payload structure
    let processedContent = ''
    
    // The payload appears to have a deeply nested structure
    // Let's try to find the text content in the nested object
    const findTextContent = (obj: any): string => {
      if (typeof obj === 'string') {
        return obj
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => findTextContent(item)).join('\n')
      }
      
      if (typeof obj === 'object' && obj !== null) {
        // Look for common text fields
        if (obj.text) return obj.text
        if (obj.content) return obj.content
        if (obj.data) return findTextContent(obj.data)
        
        // Recursively search through all values
        for (const key in obj) {
          if (key !== 'uploadId' && key !== 'sessionId') {
            const result = findTextContent(obj[key])
            if (result && result.length > 10) { // Only return substantial text content
              return result
            }
          }
        }
      }
      
      return ''
    }

    processedContent = findTextContent(body)
    
    console.log('Extracted uploadId:', uploadId)
    console.log('Extracted content length:', processedContent ? processedContent.length : 0)

    if (!uploadId) {
      console.error('No uploadId found in query parameters')
      return new Response(
        JSON.stringify({ error: 'uploadId is required as query parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the PDF upload record
    const updateData: any = {
      processing_status: 'completed',
    }

    if (processedContent && processedContent.length > 0) {
      updateData.processed_content = processedContent
      updateData.processed_at = new Date().toISOString()
      console.log('Updating with processed content')
    } else {
      console.log('No processed content found, marking as failed')
      updateData.processing_status = 'failed'
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
