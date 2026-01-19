import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('query');

    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Query parameter is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const sanitizedQuery = query.trim().slice(0, 500);
    
    console.log('AI Search query:', sanitizedQuery);

    // Call Felo AI API
    const response = await fetch('https://yabes-api.pages.dev/api/ai/chat/felo-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sanitizedQuery }),
    });

    if (!response.ok) {
      console.error('Felo AI error:', response.status);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'AI search service temporarily unavailable' 
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    
    // Extract only the clean fields we need
    const references: { title: string; url: string }[] = [];
    
    if (data.references && Array.isArray(data.references)) {
      for (const ref of data.references) {
        if (ref.title && ref.link) {
          references.push({
            title: String(ref.title).trim(),
            url: String(ref.link).trim()
          });
        } else if (ref.title && ref.url) {
          references.push({
            title: String(ref.title).trim(),
            url: String(ref.url).trim()
          });
        }
      }
    }

    // Return clean response
    const cleanResponse = {
      success: true,
      query: sanitizedQuery,
      ai_answer: data.answer || data.response || data.text || 'No answer available',
      references: references
    };

    console.log('AI Search successful');

    return new Response(
      JSON.stringify(cleanResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('AI Search error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
