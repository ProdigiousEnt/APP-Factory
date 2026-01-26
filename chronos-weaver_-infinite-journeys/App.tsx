
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ApiKeyGuard from './components/ApiKeyGuard';
import LoreChat from './components/LoreChat';
import { GameState, ImageSize, HistoryItem } from './types';
import { GeminiService } from './services/gemini';

const App: React.FC = () => {
  const [isKeyReady, setIsKeyReady] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Initial prompt data
  const artStyle = "Ethereal dark fantasy with high contrast, deep purples and golds, cinematic lighting, sharp details, digital painting style.";

  const startGame = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const initial = await GeminiService.generateNextStep(
        "Wake up in the beginning of a grand adventure.",
        "",
        [],
        "Discover your destiny",
        artStyle
      );
      setGameState(initial);
      setGameStarted(true);
      
      // Trigger image generation
      setIsImageLoading(true);
      const img = await GeminiService.generateSceneImage(initial.imagePrompt, imageSize);
      setCurrentImage(img);
    } catch (err: any) {
      setError(err.message || "Failed to start adventure.");
    } finally {
      setIsLoading(false);
      setIsImageLoading(false);
    }
  };

  const handleChoice = async (action: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    const historyStr = history.map(h => `${h.role}: ${h.content}`).join('\n');
    
    try {
      const nextState = await GeminiService.generateNextStep(
        action,
        historyStr,
        gameState?.inventory || [],
        gameState?.currentQuest || "",
        artStyle
      );

      setGameState(nextState);
      setHistory(prev => [...prev, { role: 'user', content: action }, { role: 'model', content: nextState.currentStory }]);
      
      // Load new image
      setIsImageLoading(true);
      const img = await GeminiService.generateSceneImage(nextState.imagePrompt, imageSize);
      setCurrentImage(img);
    } catch (err: any) {
      if (err.message.includes("Requested entity was not found")) {
        // Handle race condition/stale key
        setIsKeyReady(false);
      }
      setError(err.message || "The story stream was interrupted.");
    } finally {
      setIsLoading(false);
      setIsImageLoading(false);
    }
  };

  if (!isKeyReady) {
    return <ApiKeyGuard onKeySelected={() => setIsKeyReady(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar 
        inventory={gameState?.inventory || []} 
        currentQuest={gameState?.currentQuest || ""} 
        location={gameState?.location || ""}
      />

      <main className="flex-1 relative flex flex-col overflow-y-auto">
        <header className="p-6 flex justify-between items-center border-b border-slate-800 bg-slate-900/30 backdrop-blur sticky top-0 z-10">
          <h1 className="text-2xl font-bold heading-font text-indigo-400">Chronos Weaver</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setImageSize(size)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    imageSize === size ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </header>

        {!gameStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-2xl mx-auto">
            <div className="mb-8 w-32 h-32 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
              <i className="fas fa-hat-wizard text-5xl text-indigo-500"></i>
            </div>
            <h2 className="text-4xl font-bold mb-4 heading-font">The Loom Awaits</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Step into a realm where your every word reshapes reality. No pre-written paths, only the infinite threads of the Chronos Weaver.
            </p>
            <button
              onClick={startGame}
              disabled={isLoading}
              className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-900/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Weaving Reality...' : 'Begin Your Journey'}
            </button>
          </div>
        ) : (
          <div className="p-6 md:p-12 max-w-5xl mx-auto w-full space-y-8 pb-32">
            {/* Image Container */}
            <div className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-800 shadow-2xl">
              {isImageLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-indigo-400 font-medium heading-font animate-pulse">Visualizing the scene...</p>
                </div>
              )}
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt="Current Scene" 
                  className={`w-full h-full object-cover transition-opacity duration-1000 ${isImageLoading ? 'opacity-30' : 'opacity-100'}`} 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="far fa-image text-slate-700 text-6xl"></i>
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950/80 to-transparent">
                 <p className="text-[10px] text-slate-300 uppercase tracking-tighter opacity-70">Model: Gemini 2.5 Flash / 3 Pro Image</p>
              </div>
            </div>

            {/* Story Text */}
            <div className="prose prose-invert max-w-none">
              <div className="space-y-6 text-xl leading-relaxed text-slate-200">
                {gameState?.currentStory.split('\n').map((para, i) => (
                  <p key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-500">{para}</p>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm flex items-center">
                <i className="fas fa-exclamation-triangle mr-3"></i>
                {error}
              </div>
            )}

            {/* Choices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              {gameState?.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice.action)}
                  disabled={isLoading}
                  className="p-6 text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all duration-200 group relative overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 transform scale-y-0 group-hover:scale-y-100 transition-transform"></div>
                  <span className="text-slate-400 text-xs mb-1 block uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Action</span>
                  <p className="text-slate-200 font-medium">{choice.text}</p>
                </button>
              ))}
            </div>

            {isLoading && !gameState?.currentStory && (
              <div className="space-y-4">
                <div className="h-4 bg-slate-800 rounded-full w-full animate-pulse"></div>
                <div className="h-4 bg-slate-800 rounded-full w-5/6 animate-pulse"></div>
                <div className="h-4 bg-slate-800 rounded-full w-4/6 animate-pulse"></div>
              </div>
            )}
          </div>
        )}

        <LoreChat gameContext={`Location: ${gameState?.location}, Story: ${gameState?.currentStory}`} />
      </main>
    </div>
  );
};

export default App;
