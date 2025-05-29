
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
    
    // Enhanced text content extraction from the complex n8n payload structure
    let processedContent = ''
    
    const findTextContent = (obj: any, path: string = ''): string => {
      if (typeof obj === 'string') {
        // Filter out very short strings that are likely keys/IDs
        if (obj.length > 30) {
          console.log(`Found text content at path ${path}: ${obj.substring(0, 200)}...`)
          return obj
        }
        return ''
      }
      
      if (Array.isArray(obj)) {
        const results = obj.map((item, index) => findTextContent(item, `${path}[${index}]`)).filter(Boolean)
        return results.join('\n\n')
      }
      
      if (typeof obj === 'object' && obj !== null) {
        // Look for common text fields first with priority
        const textFields = ['text', 'content', 'extracted_text', 'pdf_content', 'processed_text', 'body', 'message']
        
        for (const field of textFields) {
          if (obj[field] && typeof obj[field] === 'string' && obj[field].length > 50) {
            console.log(`Found substantial content in field '${field}' at path ${path}`)
            return obj[field]
          }
        }
        
        // If it has a 'data' property, prioritize searching there
        if (obj.data) {
          const dataResult = findTextContent(obj.data, `${path}.data`)
          if (dataResult && dataResult.length > 50) {
            return dataResult
          }
        }
        
        // Recursively search through all values
        const allResults: string[] = []
        
        for (const [key, value] of Object.entries(obj)) {
          // Skip IDs, URLs, and metadata fields
          if (key.toLowerCase().includes('id') || 
              key.toLowerCase().includes('url') ||
              key.toLowerCase().includes('session') ||
              key.toLowerCase().includes('timestamp') ||
              key.toLowerCase().includes('created') ||
              key.toLowerCase().includes('status')) {
            continue
          }
          
          const result = findTextContent(value, `${path}.${key}`)
          if (result && result.length > 50) {
            allResults.push(result)
          }
        }
        
        return allResults.join('\n\n')
      }
      
      return ''
    }

    processedContent = findTextContent(body, 'root')
    
    // Alternative extraction method if the first one fails
    if (!processedContent || processedContent.length < 100) {
      console.log('Primary extraction failed, trying alternative methods...')
      
      // Look for any long strings in the payload
      const getAllStrings = (obj: any): string[] => {
        const strings: string[] = []
        
        const traverse = (item: any) => {
          if (typeof item === 'string' && item.length > 100) {
            // Check if it looks like actual content (not just JSON or metadata)
            if (!item.startsWith('{') && !item.startsWith('[') && 
                !item.includes('http://') && !item.includes('https://') &&
                item.split(' ').length > 10) {
              strings.push(item)
            }
          } else if (Array.isArray(item)) {
            item.forEach(traverse)
          } else if (typeof item === 'object' && item !== null) {
            Object.values(item).forEach(traverse)
          }
        }
        
        traverse(obj)
        return strings
      }
      
      const allStrings = getAllStrings(body)
      if (allStrings.length > 0) {
        processedContent = allStrings.join('\n\n')
        console.log(`Found ${allStrings.length} text segments using alternative method`)
      }
    }
    
    console.log('Final extraction results:', {
      uploadId,
      contentLength: processedContent ? processedContent.length : 0,
      contentPreview: processedContent ? processedContent.substring(0, 300) + '...' : 'No content',
      hasContent: !!processedContent && processedContent.length > 50
    })

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

    if (processedContent && processedContent.length > 50) {
      updateData.processed_content = processedContent
      updateData.processed_at = new Date().toISOString()
      console.log('Updating with processed content, length:', processedContent.length)
    } else {
      console.log('No substantial processed content found, marking as failed')
      updateData.processing_status = 'failed'
      updateData.processed_content = null
    }

    const { data, error: updateError } = await supabaseClient
      .from('pdf_uploads')
      .update(updateData)
      .eq('id', uploadId)
      .select()

    if (updateError) {
      console.error('Error updating PDF upload:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update PDF upload', details: updateError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('PDF upload updated successfully:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        contentExtracted: !!processedContent && processedContent.length > 50,
        contentLength: processedContent ? processedContent.length : 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in PDF processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
