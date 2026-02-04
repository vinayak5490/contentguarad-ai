import React from "react"
import { useState } from "react";
function App() {
  const [content, setContent] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const analyzeContent = async () => {
    setLoading(true);
    setError("");
    setReport("");

    try {
      const res = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unexpected server error");
      } else if (data.report) {
        setReport(data.report);
      } else {
        setError("No report returned from server");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };
  return (
   <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-3">
          ContentGuard AI
        </h1>
        <p className="text-slate-400 text-lg">Analyze and review your content with advanced AI</p>
      </div>

      {/* Main Card */}
      <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Paste your content
          </label>
          <textarea
            rows="10"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste blog content, article, or any text you want to analyze..."
            className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500 resize-none transition duration-200"
          />
        </div>

        {/* Button */}
        <div className="flex justify-center mb-8">
          <button 
            onClick={analyzeContent}
            disabled={loading || !content.trim()}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              "Analyze Content"
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-600/10 border border-red-500 text-red-300 rounded-lg p-4">
              <strong className="block font-semibold">Error</strong>
              <div className="mt-2 text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Report Section */}
        {report && (
          <div className="animate-fade-in">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Analysis Report</h2>
              <pre className="text-slate-300 text-sm overflow-auto max-h-96 font-mono bg-slate-900/50 p-4 rounded border border-slate-600 whitespace-pre-wrap">
                {report}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-slate-500 text-sm">
        <p>Powered by ContentGuard AI • Advanced Content Analysis</p>
      </div>
    </div>
   </div>
  )
}

export default App
