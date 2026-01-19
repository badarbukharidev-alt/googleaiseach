import { useState } from 'react';
import { Search, Sparkles, Globe, Loader2, ExternalLink, AlertCircle, Play } from 'lucide-react';
import { searchAI, searchGoogle, type AISearchResult, type GoogleSearchResult } from '@/lib/searchApi';

type SearchType = 'ai' | 'google';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('ai');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AISearchResult | null>(null);
  const [googleResult, setGoogleResult] = useState<GoogleSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAiResult(null);
    setGoogleResult(null);

    try {
      if (searchType === 'ai') {
        const result = await searchAI(query.trim());
        if (result.success) {
          setAiResult(result);
        } else {
          setError(result.error || 'Search failed');
        }
      } else {
        const result = await searchGoogle(query.trim());
        if (result.success) {
          setGoogleResult(result);
        } else {
          setError(result.error || 'Search failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen search-container">
      {/* Header */}
      <div className="pt-16 pb-8 px-4 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3 animate-fade-in">
          Search API
        </h1>
        <p className="text-muted-foreground text-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Choose your search method and discover
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto px-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Toggle Pills */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => setSearchType('ai')}
              className={`toggle-pill flex items-center gap-2 ${
                searchType === 'ai' ? 'toggle-pill-active' : 'toggle-pill-inactive'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Search
            </button>
            <button
              type="button"
              onClick={() => setSearchType('google')}
              className={`toggle-pill flex items-center gap-2 ${
                searchType === 'google' ? 'toggle-pill-active' : 'toggle-pill-inactive'
              }`}
            >
              <Globe className="w-4 h-4" />
              Google Search
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchType === 'ai' ? 'Ask anything...' : 'Search the web...'}
              className="search-input pl-12"
              disabled={isLoading}
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="w-full py-4 rounded-xl font-semibold text-primary-foreground transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <div className="result-card border-destructive/30 bg-destructive/5 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4 animate-fade-in">
            <div className="loading-skeleton h-32 rounded-2xl" />
            <div className="loading-skeleton h-24 rounded-xl" />
            <div className="loading-skeleton h-24 rounded-xl" />
          </div>
        )}

        {/* AI Results */}
        {aiResult && !isLoading && (
          <div className="space-y-4 animate-slide-up">
            {/* AI Answer Card */}
            <div className="ai-answer-card">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-display font-semibold text-foreground">AI Answer</span>
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {aiResult.ai_answer}
              </p>
            </div>

            {/* References */}
            {aiResult.references.length > 0 && (
              <div className="result-card">
                <h3 className="font-display font-semibold text-foreground mb-3">References</h3>
                <ul className="space-y-2">
                  {aiResult.references.map((ref, index) => (
                    <li key={index}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="reference-link flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        {ref.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Google Results */}
        {googleResult && !isLoading && (
          <div className="space-y-6 animate-slide-up">
            {/* Short Videos Section */}
            {googleResult.short_videos && googleResult.short_videos.length > 0 && (
              <div className="result-card">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold text-foreground">Short Videos</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {googleResult.short_videos.map((video, index) => (
                    <a
                      key={index}
                      href={video.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-xl overflow-hidden bg-muted aspect-video hover:ring-2 hover:ring-primary transition-all"
                    >
                      {/* Thumbnail - visible by default, hidden on hover if clip exists */}
                      {video.thumbnail ? (
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className={`w-full h-full object-cover transition-all duration-300 ${
                            video.clip ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                          }`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-secondary ${
                          video.clip ? 'group-hover:opacity-0' : ''
                        }`}>
                          <Play className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Video clip preview - shown on hover */}
                      {video.clip && (
                        <video
                          src={video.clip}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => {
                            const videoEl = e.currentTarget;
                            videoEl.currentTime = 0;
                            videoEl.play().catch(() => {});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                          }}
                        />
                      )}
                      
                      {/* Play overlay - only show if no clip */}
                      {!video.clip && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-5 h-5 text-foreground fill-current" />
                          </div>
                        </div>
                      )}
                      
                      {/* Duration badge */}
                      {video.duration && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded z-10 group-hover:opacity-0 transition-opacity">
                          {video.duration}
                        </span>
                      )}
                      
                      {/* Title overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 z-10 group-hover:opacity-0 transition-opacity">
                        <p className="text-white text-xs line-clamp-2 font-medium">{video.title}</p>
                        {video.channel && (
                          <p className="text-white/70 text-xs truncate">{video.channel}</p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Web Results */}
            {googleResult.results.length === 0 && (!googleResult.short_videos || googleResult.short_videos.length === 0) ? (
              <div className="result-card text-center text-muted-foreground">
                No results found for "{googleResult.query}"
              </div>
            ) : (
              googleResult.results.map((result, index) => (
                <div 
                  key={index} 
                  className="result-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    {result.thumbnail && (
                      <img 
                        src={result.thumbnail} 
                        alt={result.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-muted"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <a
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-display font-semibold text-primary hover:text-primary/80 transition-colors block truncate"
                      >
                        {result.title}
                      </a>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {result.source}
                      </p>
                      {result.snippet && (
                        <p className="text-foreground/80 text-sm mt-2 line-clamp-2">
                          {result.snippet}
                        </p>
                      )}
                    </div>
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-muted-foreground text-sm">
        <p>API Endpoints: <code className="bg-secondary px-2 py-1 rounded text-xs">/badartestapi/api/*</code></p>
      </div>
    </div>
  );
};

export default SearchPage;
