
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { LoadingState } from './components/LoadingState';
import { VerificationCard } from './components/VerificationCard';
import { Paywall } from './components/Paywall';
import { AppStatus, ArtifactAnalysis } from './types';
import { analyzeArtifact } from './services/geminiService';
import { revenueCatService } from './services/revenueCatService';

type HistoryItem = {
  id: string;
  analysis: ArtifactAnalysis;
  image: string;
  timestamp: number;
  isFavorite: boolean;
};

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<ArtifactAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'settings'>('home');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('antiqueai_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('antiqueai_history', JSON.stringify(history));
    }
  }, [history]);

  // Initialize RevenueCat on mount
  useEffect(() => {
    revenueCatService.initialize();
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setResult(null);
    setError(null);
    setStatus(AppStatus.UPLOADING);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setStatus(AppStatus.ANALYZING);

      try {
        const analysis = await analyzeArtifact(base64);
        setResult(analysis);
        setStatus(AppStatus.SUCCESS);

        // Add to history
        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          analysis,
          image: base64,
          timestamp: Date.now(),
          isFavorite: false
        };
        setHistory(prev => [historyItem, ...prev]);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to analyze artifact. Please try again.');
        setStatus(AppStatus.ERROR);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setSelectedImage(null);
    setResult(null);
    setError(null);
    setActiveTab('home');
  };

  const toggleFavorite = (id: string) => {
    setHistory(prev => prev.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const viewHistoryItem = (item: HistoryItem) => {
    setSelectedImage(item.image);
    setResult(item.analysis);
    setStatus(AppStatus.SUCCESS);
    setActiveTab('home');
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col pb-20">
      <Header onUpgradeClick={() => setShowPaywall(true)} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            {status === AppStatus.IDLE && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="relative group cursor-pointer" onClick={triggerUpload}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative h-48 w-48 bg-white border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center hover:border-amber-400 transition-colors">
                    <svg className="w-12 h-12 text-gray-400 group-hover:text-amber-500 transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-500">Take Photo</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">Identify Your <br /><span className="text-amber-600">Treasure</span></h2>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Snap a clear picture of an antique or artifact to uncover its history and verification hallmarks.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
              </div>
            )}

            {status === AppStatus.ANALYZING && <LoadingState />}

            {status === AppStatus.SUCCESS && result && selectedImage && (
              <div className="space-y-4">
                <VerificationCard analysis={result} image={selectedImage} />
                <button
                  onClick={reset}
                  className="w-full py-4 bg-amber-600 text-white font-bold rounded-2xl shadow-lg hover:bg-amber-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Scan New Artifact
                </button>
              </div>
            )}

            {status === AppStatus.ERROR && (
              <div className="flex flex-col items-center py-20 text-center px-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Analysis Failed</h3>
                <p className="text-gray-500 text-sm mb-6">{error}</p>
                <button
                  onClick={reset}
                  className="px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-4 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Scan History</h2>
            {history.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No scans yet. Start identifying antiques!</p>
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex gap-4 p-4">
                    <img
                      src={item.image}
                      alt={item.analysis.name}
                      className="w-24 h-24 object-cover rounded-xl flex-shrink-0 cursor-pointer"
                      onClick={() => viewHistoryItem(item)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-bold text-gray-900 text-sm line-clamp-2 cursor-pointer hover:text-amber-600"
                          onClick={() => viewHistoryItem(item)}
                        >
                          {item.analysis.name}
                        </h3>
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="flex-shrink-0"
                        >
                          <svg
                            className={`w-5 h-5 ${item.isFavorite ? 'text-amber-500 fill-current' : 'text-gray-300'}`}
                            fill={item.isFavorite ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.analysis.category} • {item.analysis.estimatedPeriod}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-4 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <button
                onClick={() => setShowPaywall(true)}
                className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors"
              >
                Upgrade to Pro
              </button>
              <button
                onClick={() => {
                  if (confirm('Clear all scan history?')) {
                    setHistory([]);
                    localStorage.removeItem('antiqueai_history');
                  }
                }}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear History
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-around py-3">
          {/* Home */}
          <button
            onClick={() => {
              setActiveTab('home');
              // Reset to camera screen if viewing results
              if (status === AppStatus.SUCCESS || status === AppStatus.ERROR) {
                reset();
              }
            }}
            className="flex flex-col items-center gap-1 px-6 py-2"
          >
            <svg className={`w-6 h-6 ${activeTab === 'home' ? 'text-amber-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className={`text-xs font-medium ${activeTab === 'home' ? 'text-amber-600' : 'text-gray-400'}`}>Home</span>
          </button>

          {/* History */}
          <button
            onClick={() => setActiveTab('history')}
            className="flex flex-col items-center gap-1 px-6 py-2"
          >
            <svg className={`w-6 h-6 ${activeTab === 'history' ? 'text-amber-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className={`text-xs font-medium ${activeTab === 'history' ? 'text-amber-600' : 'text-gray-400'}`}>History</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex flex-col items-center gap-1 px-6 py-2"
          >
            <svg className={`w-6 h-6 ${activeTab === 'settings' ? 'text-amber-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`text-xs font-medium ${activeTab === 'settings' ? 'text-amber-600' : 'text-gray-400'}`}>Settings</span>
          </button>
        </div>
      </nav>

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default App;
