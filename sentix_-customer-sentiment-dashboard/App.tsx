
import React, { useState } from 'react';
import { parseReviews, generateExecutiveSummary } from './services/geminiService';
import { DashboardData } from './types';
import SentimentChart from './components/SentimentChart';
import WordCloud from './components/WordCloud';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const reviews = await parseReviews(inputText);
      const summary = await generateExecutiveSummary(reviews);
      setData({ reviews, summary });
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again with different text.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sentix Analytics</h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <span className="text-indigo-600">Dashboard</span>
            <span>History</span>
            <span>Settings</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!data && !isLoading && (
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Import Reviews</h2>
            <p className="text-slate-500 mb-6">Paste raw text from app store reviews, emails, or chat logs. Our AI will handle the rest.</p>
            
            <textarea
              className="w-full h-64 p-4 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm mb-4 bg-slate-50 transition"
              placeholder="Example: 'I love the new UI, it's so snappy! But the pricing is getting too high for my team. Also, the mobile app crashes occasionally...'"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <button
              onClick={handleAnalyze}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Start Deep Sentiment Analysis
            </button>
            {error && <p className="mt-4 text-center text-rose-600 text-sm">{error}</p>}
          </div>
        )}

        {isLoading && (
          <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Insights...</h2>
            <p className="text-slate-500 animate-pulse">Gemini 3 Pro is applying deep reasoning to your customer feedback. This usually takes a few moments.</p>
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            {/* Top Bar Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Reviews</p>
                <h4 className="text-3xl font-bold text-slate-900">{data.reviews.length}</h4>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg. Sentiment</p>
                <h4 className={`text-3xl font-bold ${(data.reviews.reduce((acc, r) => acc + r.sentiment, 0) / data.reviews.length) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {(data.reviews.reduce((acc, r) => acc + r.sentiment, 0) / data.reviews.length).toFixed(2)}
                </h4>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Top Category</p>
                <h4 className="text-3xl font-bold text-indigo-600">UI/UX</h4>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                <button 
                  onClick={() => setData(null)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Analyze New Batch
                </button>
              </div>
            </div>

            {/* Main Visuals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SentimentChart reviews={data.reviews} />
              <WordCloud keywords={data.reviews.flatMap(r => r.keywords)} />
            </div>

            {/* Executive Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    AI Executive Summary
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">{data.summary.executiveSummary}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                      <h4 className="text-emerald-800 font-bold mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        What's Working
                      </h4>
                      <ul className="space-y-2 text-sm text-emerald-700">
                        {data.summary.topPraises.map((item, idx) => (
                          <li key={idx} className="flex gap-2">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-rose-50 p-6 rounded-xl border border-rose-100">
                      <h4 className="text-rose-800 font-bold mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Pain Points
                      </h4>
                      <ul className="space-y-2 text-sm text-rose-700">
                        {data.summary.topComplaints.map((item, idx) => (
                          <li key={idx} className="flex gap-2">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Actionable Next Steps
                </h3>
                {data.summary.actionableInsights.map((insight, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      insight.priority.toLowerCase() === 'high' ? 'bg-rose-500' : 
                      insight.priority.toLowerCase() === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(insight.priority)}`}>
                        {insight.priority} Priority
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition">{insight.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Reviews Table Snippet */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Parsed Data Overview</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Snippet</th>
                      <th className="px-6 py-4 text-center">Sentiment</th>
                      <th className="px-6 py-4">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.reviews.slice(0, 5).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 text-slate-500 font-medium">{r.date}</td>
                        <td className="px-6 py-4 text-slate-700 max-w-md truncate">{r.text}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            r.sentiment > 0.3 ? 'bg-emerald-100 text-emerald-700' :
                            r.sentiment < -0.3 ? 'bg-rose-100 text-rose-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {r.sentiment > 0 ? '+' : ''}{r.sentiment}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs">
                            {r.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Chatbot */}
      {data && <ChatBot data={data.reviews} />}
    </div>
  );
};

export default App;
