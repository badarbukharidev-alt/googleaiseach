import { useState } from 'react';
import { Copy, Check, ArrowLeft, Zap, Search, Video, Globe, MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-xl overflow-hidden border border-border bg-secondary/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/80">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-foreground leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const EndpointCard = ({
  method,
  path,
  title,
  description,
  params,
  responseExample,
  curlExample,
  jsExample,
  pythonExample,
  icon: Icon,
}: {
  method: string;
  path: string;
  title: string;
  description: string;
  params: { name: string; type: string; required: boolean; description: string }[];
  responseExample: string;
  curlExample: string;
  jsExample: string;
  pythonExample: string;
  icon: React.ElementType;
}) => (
  <section id={path.replace(/[^a-z]/gi, '-')} className="scroll-mt-24">
    <div className="search-card p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
            <Badge className="bg-accent/15 text-accent border-accent/30 font-mono text-xs">{method}</Badge>
          </div>
          <p className="text-muted-foreground">{description}</p>
          <div className="mt-3 flex items-center gap-2 bg-secondary/80 rounded-lg px-3 py-2 border border-border overflow-x-auto">
            <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">{SUPABASE_URL}/functions/v1{path}</span>
          </div>
        </div>
      </div>

      {/* Parameters */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Parameters</h3>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Required</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {params.map((p) => (
                <tr key={p.name} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-primary text-xs">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.type}</td>
                  <td className="px-4 py-3">
                    {p.required ? (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Examples */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Examples</h3>
        <Tabs defaultValue="curl" className="w-full">
          <TabsList className="mb-3">
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
          </TabsList>
          <TabsContent value="curl"><CodeBlock code={curlExample} language="bash" /></TabsContent>
          <TabsContent value="js"><CodeBlock code={jsExample} language="javascript" /></TabsContent>
          <TabsContent value="python"><CodeBlock code={pythonExample} language="python" /></TabsContent>
        </Tabs>
      </div>

      {/* Response */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Response</h3>
        <CodeBlock code={responseExample} language="json" />
      </div>
    </div>
  </section>
);

const ApiDocs = () => {
  const navigate = useNavigate();
  const baseUrl = `${SUPABASE_URL}/functions/v1`;

  const aiSearchEndpoint = {
    method: 'GET',
    path: '/badartestapi-ai-search',
    title: 'AI Search',
    description: 'Get AI-powered answers with source references. Powered by Felo AI for intelligent, contextual responses.',
    icon: MessageSquare,
    params: [
      { name: 'query', type: 'string', required: true, description: 'Search query (max 500 characters)' },
    ],
    curlExample: `curl "${baseUrl}/badartestapi-ai-search?query=what+is+typescript"`,
    jsExample: `const response = await fetch(
  "${baseUrl}/badartestapi-ai-search?query=" +
  encodeURIComponent("what is typescript")
);
const data = await response.json();
console.log(data.ai_answer);
console.log(data.references);`,
    pythonExample: `import requests

response = requests.get(
    "${baseUrl}/badartestapi-ai-search",
    params={"query": "what is typescript"}
)
data = response.json()
print(data["ai_answer"])
print(data["references"])`,
    responseExample: JSON.stringify({
      success: true,
      query: "what is typescript",
      ai_answer: "TypeScript is a strongly typed programming language that builds on JavaScript...",
      references: [
        { title: "TypeScript Official Documentation", url: "https://www.typescriptlang.org/" },
        { title: "TypeScript - Wikipedia", url: "https://en.wikipedia.org/wiki/TypeScript" },
      ],
    }, null, 2),
  };

  const googleSearchEndpoint = {
    method: 'GET',
    path: '/badartestapi-google-search',
    title: 'Google Search',
    description: 'Search the web and get structured results including web pages and short video clips with thumbnails.',
    icon: Globe,
    params: [
      { name: 'q', type: 'string', required: true, description: 'Search query (max 500 characters)' },
    ],
    curlExample: `curl "${baseUrl}/badartestapi-google-search?q=react+hooks+tutorial"`,
    jsExample: `const response = await fetch(
  "${baseUrl}/badartestapi-google-search?q=" +
  encodeURIComponent("react hooks tutorial")
);
const data = await response.json();
console.log(data.results);       // Web results
console.log(data.short_videos);  // Video results`,
    pythonExample: `import requests

response = requests.get(
    "${baseUrl}/badartestapi-google-search",
    params={"q": "react hooks tutorial"}
)
data = response.json()
print(data["results"])
print(data["short_videos"])`,
    responseExample: JSON.stringify({
      success: true,
      query: "react hooks tutorial",
      results: [
        {
          title: "Introducing Hooks – React",
          link: "https://react.dev/reference/react",
          snippet: "Hooks let you use state and other React features without writing a class...",
          source: "react.dev",
          thumbnail: null,
        },
      ],
      short_videos: [
        {
          title: "React Hooks Crash Course",
          link: "https://youtube.com/watch?v=example",
          thumbnail: "https://i.ytimg.com/vi/example/default.jpg",
          clip: "https://encrypted-vtbn0.gstatic.com/video?q=tbn:example",
          duration: "12:34",
          channel: "Traversy Media",
          source: "YouTube",
        },
      ],
    }, null, 2),
  };

  return (
    <div className="min-h-screen search-container">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">API Documentation</h1>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs">v1.0</Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-12">
        {/* Intro */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            BadarTestAPI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Free, public search APIs — AI-powered answers and Google web search with video results. No API key required.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-accent/15 text-accent border-accent/30">
              <Zap className="w-3 h-3 mr-1" /> No Auth Required
            </Badge>
            <Badge className="bg-primary/15 text-primary border-primary/30">
              <Globe className="w-3 h-3 mr-1" /> Public REST API
            </Badge>
            <Badge className="bg-primary/15 text-primary border-primary/30">
              <Video className="w-3 h-3 mr-1" /> Video Results
            </Badge>
          </div>

          {/* Base URL */}
          <div className="search-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Base URL</p>
            <CodeBlock code={baseUrl} language="url" />
          </div>
        </div>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-3">
          <a href="#-badartestapi-ai-search" className="toggle-pill toggle-pill-inactive flex items-center gap-2 no-underline">
            <MessageSquare className="w-4 h-4" /> AI Search
          </a>
          <a href="#-badartestapi-google-search" className="toggle-pill toggle-pill-inactive flex items-center gap-2 no-underline">
            <Search className="w-4 h-4" /> Google Search
          </a>
        </div>

        {/* Endpoints */}
        <EndpointCard {...aiSearchEndpoint} />
        <EndpointCard {...googleSearchEndpoint} />

        {/* Error Codes */}
        <section className="search-card p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Error Handling</h2>
          <p className="text-muted-foreground text-sm">All endpoints return consistent error responses.</p>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { code: '200', desc: 'Success — results returned' },
                  { code: '400', desc: 'Bad request — missing or invalid query parameter' },
                  { code: '503', desc: 'Service unavailable — upstream API is temporarily down' },
                  { code: '500', desc: 'Internal error — unexpected server failure' },
                ].map((e) => (
                  <tr key={e.code} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-primary">{e.code}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CodeBlock
            code={JSON.stringify({ success: false, error: "Query parameter is required" }, null, 2)}
            language="json"
          />
        </section>

        {/* Rate limits */}
        <section className="search-card p-6 md:p-8 space-y-3">
          <h2 className="text-xl font-bold text-foreground">Rate Limits & Usage</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>No API key or authentication required</li>
            <li>Query strings are trimmed and capped at 500 characters</li>
            <li>Google Search returns up to 10 web results and 6 short videos per request</li>
            <li>CORS is enabled for all origins — use from any web app</li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-sm text-muted-foreground">
          BadarTestAPI &middot; Built with Lovable
        </p>
      </footer>
    </div>
  );
};

export default ApiDocs;
