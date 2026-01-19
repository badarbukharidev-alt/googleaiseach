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
    const query = url.searchParams.get('q');

    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Query parameter "q" is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const sanitizedQuery = query.trim().slice(0, 500);
    
    console.log('Google Search query:', sanitizedQuery);

    // Call Google Search API
    const searchUrl = `https://searchapi.fakcloud.tech/?q=${encodeURIComponent(sanitizedQuery)}`;
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Google Search API error:', response.status);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Search service temporarily unavailable' 
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    
    // Extract only clean result fields
    const results: { title: string; link: string; snippet: string; source: string; thumbnail: string | null }[] = [];
    
    const rawResults = data.results || data.organic_results || data.items || data.data || [];
    
    if (Array.isArray(rawResults)) {
      for (const item of rawResults.slice(0, 10)) {
        const title = item.title || item.name || '';
        const link = item.link || item.url || item.href || '';
        const snippet = item.snippet || item.description || item.text || '';
        const thumbnail = item.thumbnail || item.image || item.favicon || null;
        
        // Extract domain as source
        let source = 'Website';
        try {
          if (link) {
            const urlObj = new URL(link);
            source = urlObj.hostname.replace('www.', '');
          }
        } catch {
          // Keep default source
        }

        if (title && link) {
          results.push({
            title: String(title).trim(),
            link: String(link).trim(),
            snippet: String(snippet).trim(),
            source: source,
            thumbnail: thumbnail ? String(thumbnail).trim() : null
          });
        }
      }
    }

    // Extract short videos
    const shortVideos: { title: string; link: string; thumbnail: string | null; duration: string | null; channel: string | null; source: string }[] = [];
    
    const rawVideos = data.short_video_results || data.video_results || data.videos || [];
    
    if (Array.isArray(rawVideos)) {
      for (const video of rawVideos.slice(0, 6)) {
        const title = video.title || '';
        const link = video.link || video.url || '';
        const thumbnail = video.thumbnail || null;
        const duration = video.duration || null;
        const channel = video.channel || null;
        const source = video.source || 'Video';

        if (title && link) {
          shortVideos.push({
            title: String(title).trim(),
            link: String(link).trim(),
            thumbnail: thumbnail ? String(thumbnail).trim() : null,
            duration: duration ? String(duration).trim() : null,
            channel: channel ? String(channel).trim() : null,
            source: String(source).trim()
          });
        }
      }
    }

    // Return clean response
    const cleanResponse = {
      success: true,
      query: sanitizedQuery,
      results: results,
      short_videos: shortVideos
    };

    console.log('Google Search successful, found', results.length, 'results and', shortVideos.length, 'videos');

    return new Response(
      JSON.stringify(cleanResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Google Search error:', error);
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
