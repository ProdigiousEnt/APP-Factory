
import React, { useState, useCallback, useEffect } from 'react';
import { DESIGN_STYLES } from './constants';
import { AppState, ChatMessage, DesignStyle } from './types';
import ComparisonSlider from './components/ComparisonSlider';
import ChatInterface from './components/ChatInterface';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [reimaginedImage, setReimaginedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setAppState(AppState.READY);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateNewDesign = async (style: DesignStyle) => {
    if (!originalImage) return;
    setSelectedStyle(style);
    setAppState(AppState.GENERATING);
    setError(null);
    try {
      const result = await GeminiService.generateDesign(originalImage, style.name);
      setReimaginedImage(result);
      setAppState(AppState.READY);
    } catch (err: any) {
      setError(err.message || "Failed to generate design.");
      setAppState(AppState.READY);
    }
  };

  const handleChatMessage = async (content: string, isEdit: boolean) => {
    const userMsg: ChatMessage = { role: 'user', content, timestamp: new Date(), isImageEdit: isEdit };
    setMessages(prev => [...prev, userMsg]);

    if (isEdit && reimaginedImage) {
      setAppState(AppState.EDITING);
      try {
        const result = await GeminiService.editDesign(reimaginedImage, content);
        setReimaginedImage(result);
        setMessages(prev => [...prev, { 
          role: 'model', 
          content: "I've updated the design based on your request. How does it look?", 
          timestamp: new Date() 
        }]);
      } catch (err: any) {
        setMessages(prev => [...prev, { role: 'model', content: "Sorry, I couldn't process that edit. Let's try another one.", timestamp: new Date() }]);
      } finally {
        setAppState(AppState.READY);
      }
    } else {
      setAppState(AppState.GENERATING);
      try {
        const response = await GeminiService.getDesignAdvice(content, messages, reimaginedImage || originalImage || undefined);
        let reply = response.text;
        if (response.links.length > 0) {
          reply += "\n\nFound these items for you:\n" + response.links.map(l => `• [${l.title}](${l.uri})`).join('\n');
        }
        setMessages(prev => [...prev, { role: 'model', content: reply, timestamp: new Date() }]);
      } catch (err: any) {
        setMessages(prev => [...prev, { role: 'model', content: "I'm having a bit of trouble connecting to my design database. Let's try again in a moment!", timestamp: new Date() }]);
      } finally {
        setAppState(AppState.READY);
      }
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="py-10 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-2">AuraHome AI</h1>
        <p className="text-gray-500 font-light tracking-widest uppercase text-sm">Bespoke AI Interior Design Studio</p>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Input & Styles */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">1. Start with Your Space</h2>
            {!originalImage ? (
              <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Upload Room Photo</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            ) : (
              <div className="relative aspect-square rounded-2xl overflow-hidden group">
                <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                <button 
                  onClick={() => { setOriginalImage(null); setReimaginedImage(null); }}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">2. Choose Your Aesthetic</h2>
            <div className="grid grid-cols-2 gap-3">
              {DESIGN_STYLES.map((style) => (
                <button
                  key={style.id}
                  disabled={!originalImage || appState === AppState.GENERATING}
                  onClick={() => generateNewDesign(style)}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden group transition-all ${
                    selectedStyle?.id === style.id ? 'ring-2 ring-amber-500' : 'hover:ring-2 hover:ring-amber-200'
                  } ${!originalImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <img src={style.imageUrl} alt={style.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-white text-xs font-semibold">{style.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Visualization & Chat */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-2 md:p-6 rounded-3xl shadow-sm border border-gray-100">
            {reimaginedImage ? (
              <div className="space-y-6">
                <ComparisonSlider original={originalImage!} reimagined={reimaginedImage} />
                <div className="flex justify-between items-center px-2">
                  <div>
                    <h3 className="text-xl font-serif text-gray-900">{selectedStyle?.name} Transformation</h3>
                    <p className="text-sm text-gray-500">Compare original vs AI generation by dragging the slider</p>
                  </div>
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = reimaginedImage;
                      link.download = `aurahome-${selectedStyle?.id}.png`;
                      link.click();
                    }}
                    className="p-2 text-gray-400 hover:text-amber-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-dashed border-gray-100 text-center p-10">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-gray-400 font-medium">Visualization Studio</h3>
                <p className="text-gray-300 text-sm mt-1">Upload a photo and pick a style to begin</p>
                {appState === AppState.GENERATING && (
                  <div className="mt-6 flex flex-col items-center">
                    <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-amber-500 origin-left animate-[loading_2s_ease-in-out_infinite]" />
                    </div>
                    <p className="mt-2 text-amber-600 text-xs font-bold animate-pulse">CRAFTING YOUR SPACE...</p>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="mt-8">
             <ChatInterface 
                messages={messages} 
                onSendMessage={handleChatMessage} 
                status={appState} 
              />
          </section>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.5); }
          100% { transform: scaleX(1); }
        }
      `}} />
    </div>
  );
};

export default App;
