import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Terminal, 
  Database, 
  CloudLightning, 
  Search, 
  RefreshCw, 
  Copy, 
  Check, 
  Play, 
  Cpu, 
  Layers, 
  Globe, 
  ExternalLink,
  ChevronRight,
  FolderOpen
} from "lucide-react";
import { Dua, ApiResponse } from "./types";

export default function App() {
  const [duas, setDuas] = useState<Dua[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"explorer" | "database" | "deploy">("explorer");
  
  // API Sandbox State
  const [sandboxEndpoint, setSandboxEndpoint] = useState<string>("duas");
  const [sandboxParam, setSandboxParam] = useState<string>("");
  const [sandboxQuery, setSandboxQuery] = useState<string>("");
  const [sandboxResults, setSandboxResults] = useState<any>(null);
  const [sandboxLoading, setSandboxLoading] = useState<boolean>(false);
  const [sandboxUrl, setSandboxUrl] = useState<string>("/api/duas");
  
  // Search & Filter State for Database Viewer
  const [dbSearch, setDbSearch] = useState<string>("");
  const [dbCategory, setDbCategory] = useState<string>("All");
  
  // Status feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"loading" | "online" | "offline">("online");
  const [serverTimestamp, setServerTimestamp] = useState<string>("");

  // Load Initial Data and verify server health
  useEffect(() => {
    fetchHealth();
    fetchDuas();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch("/health");
      const data = await res.json();
      if (data.success) {
        setApiStatus("online");
        setServerTimestamp(data.timestamp);
      } else {
        setApiStatus("offline");
      }
    } catch (e) {
      setApiStatus("offline");
    }
  };

  const fetchDuas = async () => {
    try {
      const res = await fetch("/api/duas");
      const result: ApiResponse<Dua[]> = await res.json();
      if (result.success) {
        setDuas(result.data);
        // Extract categories
        const cats = Array.from(new Set(result.data.map(d => d.category)));
        setCategories(cats);
        // Pre-populate sandbox results
        setSandboxResults(result);
      }
    } catch (e) {
      console.error("Failed to load duas from local REST API:", e);
    }
  };

  // Build current URL for the Sandbox
  useEffect(() => {
    let url = "/api/duas";
    if (sandboxEndpoint === "dua_by_id") {
      url = `/api/duas/${sandboxParam || "1"}`;
    } else if (sandboxEndpoint === "by_category") {
      url = `/api/category/${sandboxParam || "Sleep"}`;
    } else if (sandboxEndpoint === "random") {
      url = "/api/random";
    } else if (sandboxEndpoint === "search") {
      url = `/api/search?q=${encodeURIComponent(sandboxQuery || "ঘুম")}`;
    } else if (sandboxEndpoint === "health") {
      url = "/health";
    }
    setSandboxUrl(url);
  }, [sandboxEndpoint, sandboxParam, sandboxQuery]);

  // Execute testing API
  const handleTestApi = async () => {
    setSandboxLoading(true);
    try {
      const res = await fetch(sandboxUrl);
      const data = await res.json();
      setSandboxResults(data);
    } catch (err: any) {
      setSandboxResults({
        success: false,
        error: "Failed to connect to the REST API server.",
        details: err.message
      });
    } finally {
      setSandboxLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered duas for Database Viewer Tab
  const filteredDuas = duas.filter(dua => {
    const matchesCategory = dbCategory === "All" || dua.category === dbCategory;
    const matchesQuery = 
      dua.title_bn.toLowerCase().includes(dbSearch.toLowerCase()) ||
      dua.title_en.toLowerCase().includes(dbSearch.toLowerCase()) ||
      dua.meaning_bn.toLowerCase().includes(dbSearch.toLowerCase()) ||
      dua.pronunciation_bn.toLowerCase().includes(dbSearch.toLowerCase()) ||
      dua.arabic.toLowerCase().includes(dbSearch.toLowerCase()) ||
      dua.reference.toLowerCase().includes(dbSearch.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Client code generator snippets
  const getSnippets = () => {
    const fullUrl = `${window.location.origin}${sandboxUrl}`;
    return {
      curl: `curl -X GET "${fullUrl}"`,
      fetch: `fetch("${fullUrl}")\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error(error));`,
      axios: `import axios from 'axios';\n\naxios.get("${fullUrl}")\n  .then(response => {\n    console.log(response.data);\n  })\n  .catch(error => {\n    console.error(error);\n  });`
    };
  };

  const codeSnippets = getSnippets();

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col font-sans antialiased">
      
      {/* Editorial Header */}
      <header className="border-b border-gray-200 bg-[#FDFCFB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 sm:px-8 lg:px-10 flex flex-col sm:flex-row justify-between items-baseline gap-4">
          <div className="flex flex-col sm:flex-row items-baseline gap-4">
            <h1 className="text-3xl font-serif italic font-bold text-[#2D5A27] tracking-tight selection:bg-[#2D5A27]/10">
              Nur Dua
            </h1>
            <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold font-mono">
              RESTful API Engine v1.0.4
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded text-xs">
              <span className={`h-2 w-2 rounded-full inline-block ${apiStatus === "online" ? "bg-emerald-600 animate-pulse" : "bg-red-500"}`}></span>
              <span className="text-gray-600 uppercase font-mono tracking-wider text-[10px]">API SERVICE: {apiStatus}</span>
            </div>

            <button 
              onClick={() => { fetchHealth(); fetchDuas(); }} 
              className="p-1.5 rounded border border-gray-300 hover:border-gray-500 text-gray-500 hover:text-gray-950 transition-colors"
              title="Refresh Service State"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Editorial Navigation Tabs */}
      <div className="bg-[#FDFCFB] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("explorer")}
              className={`py-4 px-1 border-b-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === "explorer"
                  ? "border-[#2D5A27] text-[#2D5A27]"
                  : "border-transparent text-gray-400 hover:text-gray-900"
              }`}
            >
              Interactive API Sandbox
            </button>
            <button
              onClick={() => setActiveTab("database")}
              className={`py-4 px-1 border-b-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === "database"
                  ? "border-[#2D5A27] text-[#2D5A27]"
                  : "border-transparent text-gray-400 hover:text-gray-900"
              }`}
            >
              Database Viewer ({duas.length})
            </button>
            <button
              onClick={() => setActiveTab("deploy")}
              className={`py-4 px-1 border-b-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === "deploy"
                  ? "border-[#2D5A27] text-[#2D5A27]"
                  : "border-transparent text-gray-400 hover:text-gray-900"
              }`}
            >
              Deployment Guidelines
            </button>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 sm:px-8 lg:px-10">
        
        {/* TAB 1: INTERACTIVE API SANDBOX */}
        {activeTab === "explorer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Project Structure & Endpoints Selection */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Directory Structure representation */}
              <div className="border border-gray-200 bg-[#FDFCFB] p-6 shadow-sm rounded-none">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4 font-bold flex items-center gap-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-[#2D5A27] bg-transparent" />
                  Project Structure
                </h3>
                <ul className="space-y-2 text-xs font-mono text-gray-600">
                  <li className="flex items-center gap-2"><span className="text-[#2D5A27] font-bold">/</span> server.js</li>
                  <li className="flex items-center gap-2 ml-4"><span className="text-gray-300">├──</span> routes/ <span className="text-[9px] text-gray-400 font-sans italic">(duaRoutes.js)</span></li>
                  <li className="flex items-center gap-2 ml-4"><span className="text-gray-300">├──</span> data/ <span className="text-[10px] text-[#2D5A27] bg-emerald-50 px-1.5 rounded font-sans">(duas.json)</span></li>
                  <li className="flex items-center gap-2 ml-4"><span className="text-gray-300">└──</span> package.json</li>
                </ul>
              </div>

              {/* Endpoints selector */}
              <div className="border border-gray-200 bg-[#FDFCFB] p-6 shadow-sm rounded-none">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4 font-bold flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-[#2D5A27] bg-transparent" />
                  API Endpoints
                </h3>
                <p className="text-xs text-gray-500 mb-6 italic leading-relaxed">
                  Select an endpoint block to load custom parameters and preview JSON output in real time.
                </p>

                <div className="space-y-4">
                  {/* Route: Health */}
                  <div 
                    onClick={() => setSandboxEndpoint("health")}
                    className={`p-3 border transition-all cursor-pointer ${
                      sandboxEndpoint === "health" 
                        ? "border-[#2D5A27] bg-emerald-50/20 pl-4 border-l-2" 
                        : "border-gray-100 bg-[#FDFCFB] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">GET</span>
                      <span className="font-mono text-xs text-gray-700">/health</span>
                    </div>
                    <p className="text-xs text-gray-500 italic mt-1">Get Node.js heartbeat credentials.</p>
                  </div>

                  {/* Route: Get All Duas */}
                  <div 
                    onClick={() => setSandboxEndpoint("duas")}
                    className={`p-3 border transition-all cursor-pointer ${
                      sandboxEndpoint === "duas" 
                        ? "border-[#2D5A27] bg-emerald-50/20 pl-4 border-l-2" 
                        : "border-gray-100 bg-[#FDFCFB] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">GET</span>
                      <span className="font-mono text-xs text-gray-700">/api/duas</span>
                    </div>
                    <p className="text-xs text-gray-500 italic mt-1">Retrieve complete list of duas database.</p>
                  </div>

                  {/* Route: Get Dua By ID */}
                  <div 
                    onClick={() => {
                      setSandboxEndpoint("dua_by_id");
                      if (!sandboxParam) setSandboxParam("1");
                    }}
                    className={`p-3 border transition-all cursor-pointer ${
                      sandboxEndpoint === "dua_by_id" 
                        ? "border-[#2D5A27] bg-emerald-50/20 pl-4 border-l-2" 
                        : "border-gray-100 bg-[#FDFCFB] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-[#2D5A27] bg-emerald-50 px-1.5 py-0.5 rounded">GET</span>
                      <span className="font-mono text-xs text-gray-700">/api/duas/:id</span>
                    </div>
                    <p className="text-xs text-gray-900 font-medium mt-1">Single resource custom database lookup.</p>
                    
                    {sandboxEndpoint === "dua_by_id" && (
                      <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[10px] text-[#2D5A27] font-bold uppercase tracking-wider block mb-1">Dua Resource ID (1 - 15):</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="15"
                          value={sandboxParam} 
                          onChange={(e) => setSandboxParam(e.target.value)}
                          className="w-full bg-[#FDFCFB] border border-gray-300 px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-[#2D5A27] font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Route: Get Categories */}
                  <div 
                    onClick={() => {
                      setSandboxEndpoint("by_category");
                      if (!sandboxParam || !categories.includes(sandboxParam)) setSandboxParam("Sleep");
                    }}
                    className={`p-3 border transition-all cursor-pointer ${
                      sandboxEndpoint === "by_category" 
                        ? "border-[#2D5A27] bg-emerald-50/20 pl-4 border-l-2" 
                        : "border-gray-100 bg-[#FDFCFB] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">GET</span>
                      <span className="font-mono text-xs text-gray-700">/api/category/:name</span>
                    </div>
                    <p className="text-xs text-gray-500 italic mt-1">Filter list by specific Arabic categories.</p>
                    
                    {sandboxEndpoint === "by_category" && (
                      <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[10px] text-[#2D5A27] font-bold uppercase tracking-wider block mb-1 font-mono">Category Taxonomy:</label>
                        <select 
                          value={sandboxParam} 
                          onChange={(e) => setSandboxParam(e.target.value)}
                          className="w-full bg-[#FDFCFB] border border-gray-300 px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-[#2D5A27]"
                        >
                          <option value="Sleep">Sleep</option>
                          <option value="Travel">Travel</option>
                          <option value="Food & Drink">Food & Drink</option>
                          <option value="Daily Lifecycle">Daily Lifecycle</option>
                          <option value="Mosque">Mosque</option>
                          <option value="Family">Family</option>
                          <option value="Knowledge">Knowledge</option>
                          <option value="Well-being">Well-being</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Route: Get Random Dua */}
                  <div 
                    onClick={() => setSandboxEndpoint("random")}
                    className={`p-3 border transition-all cursor-pointer ${
                      sandboxEndpoint === "random" 
                        ? "border-[#2D5A27] bg-emerald-50/20 pl-4 border-l-2" 
                        : "border-gray-100 bg-[#FDFCFB] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">GET</span>
                      <span className="font-mono text-xs text-gray-700">/api/random</span>
                    </div>
                    <p className="text-xs text-gray-500 italic mt-1">Acquire single randomized daily card payload.</p>
                  </div>

                  {/* Route: Search Duas */}
                  <div 
                    onClick={() => setSandboxEndpoint("search")}
                    className={`p-3 border transition-all cursor-pointer ${
                      sandboxEndpoint === "search" 
                        ? "border-[#2D5A27] bg-emerald-50/20 pl-4 border-l-2" 
                        : "border-gray-100 bg-[#FDFCFB] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">GET</span>
                      <span className="font-mono text-xs text-gray-700">/api/search</span>
                    </div>
                    <p className="text-xs text-gray-500 italic mt-1">Bangla keyword text indices execution.</p>
                    
                    {sandboxEndpoint === "search" && (
                      <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[10px] text-[#2D5A27] font-bold uppercase tracking-wider block mb-1">Search Keyword Term:</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="e.g. ঘুম, ঘর, খাবার, আয়না"
                            value={sandboxQuery} 
                            onChange={(e) => setSandboxQuery(e.target.value)}
                            className="w-full bg-[#FDFCFB] border border-gray-300 pl-7 pr-2 py-1 text-xs text-gray-950 focus:outline-none focus:border-[#2D5A27]"
                          />
                          <Search className="h-3 w-3 text-gray-400 absolute left-2.5 top-2.5" />
                        </div>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {["ঘুম", "মসজিদ", "আহার", "দয়া", "ঋণ"].map(term => (
                            <button 
                              key={term}
                              onClick={() => setSandboxQuery(term)}
                              className="text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Modern Console and Preview (Colspan 7) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* API Live Console Sandbox */}
              <div className="bg-[#151515] text-[#F3F4F6] p-6 rounded-none shadow-2xl relative flex flex-col">
                <div className="flex items-center justify-between mb-4 border-b border-[#2D2D2D] pb-4">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80 inline-block"></span>
                  </div>
                  <div className="text-[11px] font-mono text-gray-400 text-right">
                    API SERVER HOST: <span className="text-[#2D5A27] font-bold">{window.location.host}</span>
                  </div>
                </div>

                {/* Simulated Address Bar */}
                <div className="mb-6 flex gap-2">
                  <div className="px-2.5 py-1.5 bg-[#252525] text-emerald-400 font-mono text-xs tracking-wider rounded font-bold border border-[#333]">
                    GET
                  </div>
                  <div className="flex-1 min-w-0 bg-[#252525] rounded border border-[#333] flex items-center px-3 font-mono text-xs overflow-x-auto whitespace-nowrap">
                    <span className="text-gray-500 font-bold select-none pr-1">http://localhost:3000</span>
                    <span className="text-emerald-400 font-medium">{sandboxUrl}</span>
                  </div>
                  <button 
                    onClick={handleTestApi}
                    disabled={sandboxLoading}
                    className="px-4 py-1.5 bg-[#2D5A27] hover:bg-emerald-700 text-white font-mono text-xs uppercase tracking-widest text-center transition-all flex items-center justify-center gap-1 bg-transparent border border-[#2D5A27]"
                  >
                    {sandboxLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Play className="h-2.5 w-2.5 fill-current mr-1" />
                        Run
                      </>
                    )}
                  </button>
                </div>

                {/* Code Pre Container */}
                <div className="bg-[#1B1B1B] p-4 border border-[#2D2D2D]/60 max-h-[460px] overflow-y-auto font-mono text-[11px] leading-relaxed relative rounded">
                  <div className="absolute right-3 top-3 flex items-center bg-transparent">
                    <button 
                      onClick={() => copyToClipboard(JSON.stringify(sandboxResults, null, 2), "response")}
                      className="p-1 px-2.5 bg-[#252525] text-xs text-gray-400 hover:text-white border border-[#3D3D3D] transition-colors rounded items-center flex gap-1.5"
                    >
                      {copiedId === "response" ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400 text-[10px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span className="text-[10px]">Copy JSON</span>
                        </>
                      )}
                    </button>
                  </div>

                  {sandboxLoading ? (
                    <div className="py-24 text-center text-gray-500 flex flex-col justify-center items-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-[#2D5A27]" />
                      <p className="animate-pulse tracking-wide font-serif italic text-gray-400 text-xs">Querying local Nur Dua sandbox server...</p>
                    </div>
                  ) : sandboxResults ? (
                    <pre className="text-emerald-400 ">{JSON.stringify(sandboxResults, null, 2)}</pre>
                  ) : (
                    <div className="py-16 text-center text-gray-500 font-serif italic">
                      <Terminal className="h-6 w-6 text-[#2D5A27] mx-auto mb-2 opacity-50 bg-transparent" />
                      <p className="text-center">State empty. Execute "Run" command to trigger the endpoint request.</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[#2D2D2D] flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                  <span>RESPONSE STATUS: 200 OK</span>
                  <span>RENDER LATENCY: ~14ms</span>
                </div>
              </div>

              {/* Developer Client helpers snippet card */}
              <div className="border border-gray-200 bg-[#FDFCFB] p-6 shadow-sm rounded-none space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-[#2D5A27] font-bold font-serif italic flex items-center gap-1.5">
                  <Globe className="h-4 w-4 bg-transparent text-[#2D5A27]" />
                  Client Connection Code Snippets
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed font-sans">
                  Use this generated code schema block inside your frontend applications to resolve dynamic records successfully:
                </p>

                <div className="space-y-4 font-mono text-[11px]">
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                      <span>cURL CLI Terminal Query</span>
                      <button 
                        onClick={() => copyToClipboard(codeSnippets.curl, "curl")}
                        className="text-gray-400 hover:text-gray-800 transition-colors"
                      >
                        {copiedId === "curl" ? <span className="text-emerald-600 text-[9px] font-sans">Copied!</span> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-2.5 rounded text-gray-700 whitespace-pre overflow-x-auto">
                      {codeSnippets.curl}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                      <span>Standard JavaScript Fetch API</span>
                      <button 
                        onClick={() => copyToClipboard(codeSnippets.fetch, "fetch")}
                        className="text-gray-400 hover:text-gray-800 transition-colors"
                      >
                        {copiedId === "fetch" ? <span className="text-emerald-600 text-[9px] font-sans">Copied!</span> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-2.5 rounded text-gray-700 whitespace-pre overflow-x-auto">
                      {codeSnippets.fetch}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: DATABASE VIEW ENGINE */}
        {activeTab === "database" && (
          <div className="space-y-6">
            
            {/* Toolbar filter widgets */}
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between border-b border-gray-200 pb-5 gap-4">
              <div>
                <h2 className="text-2xl font-serif italic text-[#2D5A27] font-bold">Dua Database Catalogue</h2>
                <p className="text-xs text-gray-500">Inspecting all {duas.length} static model objects bundled within <code className="font-mono text-emerald-800">/data/duas.json</code></p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search query content..."
                    value={dbSearch}
                    onChange={(e) => setDbSearch(e.target.value)}
                    className="bg-[#FDFCFB] border border-gray-300 text-xs text-gray-950 px-3 pl-8 py-1.5 focus:outline-none focus:border-[#2D5A27] w-48 sm:w-60"
                  />
                  <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-2" />
                </div>

                <select 
                  value={dbCategory}
                  onChange={(e) => setDbCategory(e.target.value)}
                  className="bg-[#FDFCFB] border border-gray-300 text-xs text-gray-700 px-3 py-1.5 focus:outline-none focus:border-[#2D5A27] font-medium"
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Total Indicator label */}
            <div className="text-[10px] text-gray-400 tracking-wider font-mono uppercase flex justify-between items-center py-1">
              <span>Selected Records count: <span className="text-gray-900 font-bold">{filteredDuas.length} / 15</span></span>
              {(dbSearch || dbCategory !== "All") && (
                <button 
                  onClick={() => { setDbSearch(""); setDbCategory("All"); }}
                  className="text-[#2D5A27] font-semibold underline underline-offset-2 tracking-normal lowercase font-sans bg-transparent"
                >
                  Clear filter triggers
                </button>
              )}
            </div>

            {/* List Layout - Styled with Editorial Aesthetic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredDuas.length > 0 ? (
                filteredDuas.map((dua) => (
                  <div 
                    key={dua.id} 
                    id={`editorial-card-${dua.id}`}
                    className="bg-[#FDFCFB] border border-gray-200 p-6 flex flex-col justify-between space-y-4 hover:border-gray-500 transition-colors shadow-sm"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-mono text-gray-400 uppercase font-semibold">Dua Schema ID #{dua.id}</span>
                        <span className="px-2.5 py-0.5 border border-gray-300 bg-gray-50 text-gray-600 rounded-full tracking-wide">
                          {dua.category}
                        </span>
                      </div>

                      {/* Title block */}
                      <div className="border-l-2 border-[#2D5A27] pl-3">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-[#1A1A1A] font-bold">{dua.title_en}</h4>
                        <h3 className="text-lg font-serif italic font-semibold text-[#2D5A27] mt-0.5">{dua.title_bn}</h3>
                      </div>

                      {/* Display Arabic Font styled gracefully */}
                      <div className="bg-gray-50 p-5 rounded border border-gray-100 text-right leading-loose text-emerald-950 font-serif text-xl select-all select-none" dir="rtl">
                        {dua.arabic}
                      </div>

                      {/* Pronunciations, Meanings translations */}
                      <div className="space-y-2 text-xs text-gray-700">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5 font-mono">Pronunciation (Bangla):</span>
                          <p className="leading-relaxed font-sans font-medium text-gray-900">{dua.pronunciation_bn}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5 font-mono">Meaning (Bangla):</span>
                          <p className="leading-relaxed font-serif italic text-gray-800">"{dua.meaning_bn}"</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer reference copy block */}
                    <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-center text-[11px] text-gray-400 font-mono">
                      <span>Source: <strong className="text-gray-700 italic font-serif">{dua.reference}</strong></span>
                      <button 
                        onClick={() => copyToClipboard(JSON.stringify(dua, null, 2), `dua-copy-${dua.id}`)}
                        className="text-[#2D5A27] hover:text-[#2D5A27]/80 inline-flex items-center gap-1.5 transition-colors font-sans text-xs uppercase tracking-wider font-semibold"
                      >
                        {copiedId === `dua-copy-${dua.id}` ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Item Object</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-gray-400 border border-dashed border-gray-200">
                  <Database className="h-8 w-8 text-[#2D5A27] mx-auto mb-3 opacity-40 bg-transparent" />
                  <p className="font-serif italic text-base">No database items matched your query keywords.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: DEPLOYMENT MANUAL */}
        {activeTab === "deploy" && (
          <div className="max-w-4xl mx-auto space-y-8 bg-[#FDFCFB]">
            <div>
              <h2 className="text-3xl font-serif italic font-bold text-[#2D5A27]">Free Production Host Deployments</h2>
              <p className="text-xs tracking-widest text-gray-400 font-mono uppercase bg-transparent mr-2 mt-1">Lightweight, Micro-Service Platform blueprints</p>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                Because this customized Islamic Dua REST API project utilizes fully open-source built-in native modules (<code className="font-mono text-emerald-800 font-bold">express</code>, <code className="font-mono text-emerald-800 font-bold">cors</code>, <code className="font-mono text-emerald-800 font-bold">fs</code>) with zero external stateful database clusters, it can be hosted perpetually under free computing targets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option 1 */}
              <div className="border border-gray-200 p-6 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-[#2D5A27] bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold tracking-widest inline-block mb-3">RECOMMENDED</div>
                  <h4 className="font-bold text-sm uppercase tracking-wider text-gray-950 mb-2">Render.com</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans mb-4">
                    Render hosts continuously deployed Node REST APIs directly on top of your connected GitHub branches easily resource-free.
                  </p>
                </div>
                <div className="space-y-2 border-t border-gray-100 pt-3 text-[11px] font-mono">
                  <div className="justify-between flex text-gray-500"><span>Build:</span><span className="text-gray-900">npm install</span></div>
                  <div className="justify-between flex text-gray-500"><span>Command:</span><span className="text-gray-900 font-extrabold text-[10px]">npm start</span></div>
                </div>
              </div>

              {/* Option 2 */}
              <div className="border border-gray-200 p-6 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-[#2D5A27] bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold tracking-widest inline-block mb-3">ZERO ADMIN</div>
                  <h4 className="font-bold text-sm uppercase tracking-wider text-gray-950 mb-2">Railway.app</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans mb-4">
                    Automatic node structure detections boot standalone express engines cleanly in under 30 seconds straight.
                  </p>
                </div>
                <div className="space-y-2 border-t border-gray-100 pt-3 text-[11px] font-mono">
                  <div className="justify-between flex text-gray-500"><span>Start file:</span><span className="text-gray-900">server.js</span></div>
                  <div className="justify-between flex text-gray-500"><span>Detection:</span><span className="text-gray-900">Automatic</span></div>
                </div>
              </div>

              {/* Option 3 */}
              <div className="border border-gray-200 p-6 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-gray-700 bg-gray-50 px-2 py-0.5 rounded font-mono font-bold tracking-widest inline-block mb-3">SERVERLESS</div>
                  <h4 className="font-bold text-sm uppercase tracking-wider text-gray-950 mb-2">Vercel Lambdas</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans mb-4">
                    Run the entire router sequence fast as Serverless edge endpoints by utilizing standard vercel configs.
                  </p>
                </div>
                <div className="border-t border-gray-100 pt-3 text-[11px] font-mono">
                  <p className="text-gray-400 uppercase text-[10px] font-bold mb-1">vercel.json rewrite:</p>
                  <pre className="text-emerald-700 bg-gray-50 border border-gray-200 p-2 rounded text-[10px] overflow-hidden whitespace-nowrap text-ellipsis">
                    {"{ \"rewrites\": [ { \"source\": \"/(.*)\" ... } ] }"}
                  </pre>
                </div>
              </div>
            </div>

            {/* Stage Step Setup */}
            <div className="border border-gray-200 p-6 bg-gray-50 space-y-4">
              <h4 className="font-serif italic font-bold text-lg text-[#2D5A27]">Step-by-Step GitHub Repository Setup workflow</h4>
              <ol className="list-decimal pl-5 text-xs text-gray-600 space-y-2.5">
                <li>Create a brand new repository on <strong className="text-gray-900">GitHub.com</strong> (e.g., <code className="font-mono text-[#2D5A27] font-bold">islamic-dua-api</code>).</li>
                <li>Download this project zip or export via AI Studio settings, extract contents locally, and run your tracking codes: <code className="font-mono bg-white border border-gray-300 px-1 rounded">git init</code></li>
                <li>Add project records and save standard checkpoint commits: <code className="font-mono bg-white border border-gray-300 px-1 rounded">git add . && git commit -m "First commit: Nur Dua REST API"</code></li>
                <li>Connect your GitHub origin, push commits, link Render or Railway to the repo, and witness your API scale instantly!</li>
              </ol>
            </div>

          </div>
        )}

      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-gray-200 bg-gray-50/70 py-6 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-gray-500">
            <Cpu className="h-4 w-4 text-[#2D5A27]/70 bg-transparent" />
            <span>Islamic Dua REST API © 2026. NUR DUA INTELLECTUALS.</span>
          </div>

          <div className="flex gap-4 font-mono text-[10px] text-gray-400 items-baseline">
            <span className="font-bold text-gray-600">DEPLOYED ON: MAPPED HOST</span>
            <span>•</span>
            <span>CORS: ALLOWED (ANY CLIENT)</span>
            <span>•</span>
            <span>UTF-8: BN/AR CODECS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
