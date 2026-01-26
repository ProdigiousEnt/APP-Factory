
import React, { useState, useEffect } from 'react';

interface ApiKeyGuardProps {
  onKeySelected: () => void;
}

const ApiKeyGuard: React.FC<ApiKeyGuardProps> = ({ onKeySelected }) => {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (hasKey) {
        onKeySelected();
      } else {
        setChecking(false);
      }
    };
    checkKey();
  }, [onKeySelected]);

  const handleOpenSelectKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    // Proceed immediately to avoid race condition
    onKeySelected();
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-xl">Initializing Chronicler...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-2xl text-center">
        <h1 className="text-4xl font-bold mb-6 heading-font text-indigo-400">Chronos Weaver</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          To embark on your infinite journey with high-fidelity visuals, you must select an authorized Gemini API key.
        </p>
        <button
          onClick={handleOpenSelectKey}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-indigo-900/20 mb-4"
        >
          Select API Key
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-indigo-400 underline transition-colors"
        >
          Learn more about billing & setup
        </a>
      </div>
    </div>
  );
};

export default ApiKeyGuard;
