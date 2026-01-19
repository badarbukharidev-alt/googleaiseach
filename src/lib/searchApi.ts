import { supabase } from '@/integrations/supabase/client';

export interface AISearchResult {
  success: boolean;
  query: string;
  ai_answer: string;
  references: { title: string; url: string }[];
  error?: string;
}

export interface GoogleSearchResult {
  success: boolean;
  query: string;
  results: {
    title: string;
    link: string;
    snippet: string;
    source: string;
  }[];
  error?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export async function searchAI(query: string): Promise<AISearchResult> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/badartestapi-ai-search?query=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        query,
        ai_answer: '',
        references: [],
        error: data.error || 'Search failed',
      };
    }

    return data as AISearchResult;
  } catch (error) {
    console.error('AI search error:', error);
    return {
      success: false,
      query,
      ai_answer: '',
      references: [],
      error: 'Failed to connect to search service',
    };
  }
}

export async function searchGoogle(query: string): Promise<GoogleSearchResult> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/badartestapi-google-search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        query,
        results: [],
        error: data.error || 'Search failed',
      };
    }

    return data as GoogleSearchResult;
  } catch (error) {
    console.error('Google search error:', error);
    return {
      success: false,
      query,
      results: [],
      error: 'Failed to connect to search service',
    };
  }
}
