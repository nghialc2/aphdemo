
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
    
    // Improved text content extraction from the complex n8n payload structure
    let processedContent = ''
    
    const findTextContent = (obj: any, path: string = ''): string => {
      if (typeof obj === 'string') {
        // Filter out very short strings that are likely keys/IDs
        if (obj.length > 20) {
          console.log(`Found text content at path ${path}: ${obj.substring(0, 100)}...`)
          return obj
        }
        return ''
      }
      
      if (Array.isArray(obj)) {
        const results = obj.map((item, index) => findTextContent(item, `${path}[${index}]`)).filter(Boolean)
        return results.join('\n\n')
      }
      
      if (typeof obj === 'object' && obj !== null) {
        // Look for common text fields first
        if (obj.text && typeof obj.text === 'string' && obj.text.length > 20) {
          console.log(`Found text field at ${path}.text`)
          return obj.text
        }
        if (obj.content && typeof obj.content === 'string' && obj.content.length > 20) {
          console.log(`Found content field at ${path}.content`)
          return obj.content
        }
        if (obj.data) {
          const dataResult = findTextContent(obj.data, `${path}.data`)
          if (dataResult) return dataResult
        }
        
        // Recursively search through all values, but prioritize certain keys
        const priorityKeys = ['text', 'content', 'extracted_text', 'pdf_content', 'processed_text']
        const allResults: string[] = []
        
        // First check priority keys
        for (const key of priorityKeys) {
          if (obj[key]) {
            const result = findTextContent(obj[key], `${path}.${key}`)
            if (result && result.length > 20) {
              allResults.push(result)
            }
          }
        }
        
        // If no priority keys found substantial content, check all other keys
        if (allResults.length === 0) {
          for (const [key, value] of Object.entries(obj)) {
            // Skip IDs and very short values
            if (key.toLowerCase().includes('id') || key.toLowerCase().includes('session')) {
              continue
            }
            
            const result = findTextContent(value, `${path}.${key}`)
            if (result && result.length > 20) {
              allResults.push(result)
            }
          }
        }
        
        return allResults.join('\n\n')
      }
      
      return ''
    }

    processedContent = findTextContent(body, 'root')
    
    // If still no content found, try to extract from the nested structure visible in logs
    if (!processedContent || processedContent.length < 50) {
      console.log('Trying alternative extraction method...')
      
      // From the logs, it looks like the structure might be deeply nested
      // Try to get any string value that contains substantial text
      const getAllStrings = (obj: any): string[] => {
        const strings: string[] = []
        
        const traverse = (item: any) => {
          if (typeof item === 'string' && item.length > 50) {
            strings.push(item)
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
    
    console.log('Extracted uploadId:', uploadId)
    console.log('Extracted content length:', processedContent ? processedContent.length : 0)
    console.log('Content preview:', processedContent ? processedContent.substring(0, 200) + '...' : 'No content')

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
