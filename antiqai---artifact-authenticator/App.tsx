
import React, { useState, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { LoadingState } from './components/LoadingState';
import { VerificationCard } from './components/VerificationCard';
import { AppStatus, ArtifactAnalysis } from './types';
import { analyzeArtifact } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<ArtifactAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6">
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
          <VerificationCard analysis={result} image={selectedImage} />
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
      </main>

      {/* Persistent Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 safe-area-bottom">
        <div className="max-w-2xl mx-auto">
          {status === AppStatus.SUCCESS || status === AppStatus.ERROR ? (
            <button 
              onClick={reset}
              className="w-full py-4 bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-200 hover:bg-amber-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Scan New Artifact
            </button>
          ) : status === AppStatus.IDLE ? (
            <button 
              onClick={triggerUpload}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              Start Identification
            </button>
          ) : (
            <div className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-2xl flex items-center justify-center cursor-not-allowed">
              Processing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
