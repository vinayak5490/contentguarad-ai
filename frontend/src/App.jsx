import React from "react"
import { useState } from "react";

function RiskGauge({ score }) {
  // Determine color and risk level based on score
  let color = "text-green-400";
  let bgColor = "bg-green-500/20";
  let borderColor = "border-green-500/50";
  let riskLevel = "LOW";
  
  if (score >= 70) {
    color = "text-red-400";
    bgColor = "bg-red-500/20";
    borderColor = "border-red-500/50";
    riskLevel = "HIGH";
  } else if (score >= 40) {
    color = "text-yellow-400";
    bgColor = "bg-yellow-500/20";
    borderColor = "border-yellow-500/50";
    riskLevel = "MEDIUM";
  }
  
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-lg border ${borderColor} ${bgColor}`}>
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-500 ${color}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-3xl font-bold ${color}`}>{score}</div>
            <div className="text-xs text-slate-400">out of 100</div>
          </div>
        </div>
      </div>
      <div className={`text-sm font-bold ${color}`}>{riskLevel} RISK</div>
    </div>
  );
}

function App() {
  const [content, setContent] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeContent = async () => {
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const res = await fetch("https://contentguarad-ai.onrender.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unexpected server error");
      } else {
        setReport(data);
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-3">
            ContentGuard AI
          </h1>
          <p className="text-slate-400 text-lg">Analyze and review your content with advanced AI</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Paste your content
                </label>
                <textarea
                  rows="12"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste blog content, article, or any text you want to analyze..."
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500 resize-none transition duration-200"
                />
              </div>

              <div className="flex justify-center">
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
                <div className="mt-6">
                  <div className="bg-red-600/10 border border-red-500 text-red-300 rounded-lg p-4">
                    <strong className="block font-semibold">Error</strong>
                    <div className="mt-2 text-sm">{error}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Section - Right Side */}
          <div>
            {report ? (
              <div className="space-y-4">
                {/* Risk Score Gauge */}
                <div className="bg-slate-800 rounded-lg shadow-2xl p-6 border border-slate-700">
                  <RiskGauge score={report.risk_score} />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">Tone</div>
                    <div className="text-sm font-bold text-blue-400">{report.tone}</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">Plagiarism</div>
                    <div className="text-sm font-bold text-blue-400">{report.plagiarism_risk}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Detailed Report */}
        {report && (
          <div className="mt-8 space-y-6">
            {/* Issues Section */}
            <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
              <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Compliance Issues
              </h2>
              <div className="space-y-2">
                {report.issues && report.issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-blue-400 mr-3 font-bold">→</span>
                    <span className="text-slate-300">{issue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
              <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Recommendations
              </h2>
              <div className="space-y-2">
                {report.recommendations && report.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-green-400 mr-3 font-bold">✓</span>
                    <span className="text-slate-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>Powered by ContentGuard AI • Advanced Content Analysis</p>
        </div>
      </div>
    </div>
  )
}

export default App
