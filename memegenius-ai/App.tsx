
import React, { useState, useCallback } from 'react';
import { MemeState, SuggestedCaption } from './types';
import { MEME_TEMPLATES, DEFAULT_FONT_SIZE } from './constants';
import MemeCanvas from './components/MemeCanvas';
import EditorTools from './components/EditorTools';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [meme, setMeme] = useState<MemeState>({
    image: null,
    topText: '',
    bottomText: '',
    fontSize: DEFAULT_FONT_SIZE,
    textColor: '#ffffff'
  });
  
  const [suggestedCaptions, setSuggestedCaptions] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'templates'>('edit');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMeme(prev => ({ ...prev, image: event.target?.result as string }));
        setSuggestedCaptions([]);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateSelect = (url: string) => {
    setMeme(prev => ({ ...prev, image: url }));
    setSuggestedCaptions([]);
    setAnalysis(null);
    setActiveTab('edit');
  };

  const fetchMagicCaptions = async () => {
    if (!meme.image) return;
    setIsLoading(true);
    try {
      const captions = await geminiService.getMagicCaptions(meme.image);
      setSuggestedCaptions(captions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    if (!meme.image) return;
    setIsLoading(true);
    try {
      const text = await geminiService.analyzeImage(meme.image);
      setAnalysis(text);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyCaption = (text: string) => {
    // Simple logic: if top is empty, use top, else use bottom. 
    // Or just cycle them. Here we'll just set bottom as it's common for punchlines.
    setMeme(prev => ({ ...prev, bottomText: text }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fa-solid fa-face-grin-tears text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              MEMEGENIUS <span className="text-indigo-500">AI</span>
            </h1>
          </div>
          <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full text-sm font-semibold transition-all border border-slate-700">
            <i className="fa-solid fa-upload mr-2"></i> Upload Photo
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Template Selector or Tools */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button 
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'edit' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Editor
            </button>
            <button 
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'templates' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Templates
            </button>
          </div>

          {activeTab === 'edit' ? (
            <EditorTools 
              state={meme} 
              setState={setMeme} 
              onMagicCaption={fetchMagicCaptions}
              onAnalyze={fetchAnalysis}
              isLoading={isLoading}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
              {MEME_TEMPLATES.map(temp => (
                <button
                  key={temp.id}
                  onClick={() => handleTemplateSelect(temp.url)}
                  className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all aspect-square"
                >
                  <img src={temp.url} alt={temp.name} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center p-2 text-center transition-all">
                    <span className="text-xs font-bold">{temp.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Center: Canvas Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <MemeCanvas state={meme} onDownload={() => {}} />

          {/* Magic Captions Suggestion Row */}
          {suggestedCaptions.length > 0 && (
            <div className="animate-in slide-in-from-bottom duration-500">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <i className="fa-solid fa-sparkles text-indigo-400"></i> AI Suggested Captions (Click to apply)
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestedCaptions.map((cap, i) => (
                  <button
                    key={i}
                    onClick={() => applyCaption(cap)}
                    className="bg-slate-800 hover:bg-indigo-900/40 border border-slate-700 hover:border-indigo-500/50 px-4 py-2 rounded-lg text-sm transition-all text-slate-200"
                  >
                    "{cap}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Analysis View */}
          {analysis && (
            <div className="bg-indigo-950/20 border border-indigo-500/20 p-6 rounded-2xl animate-in fade-in duration-700">
              <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">AI Visual Insights</h4>
              <p className="text-slate-300 text-sm leading-relaxed italic">
                "{analysis}"
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 text-center text-slate-600 text-xs">
        <p>&copy; 2024 MemeGenius AI Studio. Powered by Gemini 3.</p>
      </footer>
    </div>
  );
};

export default App;
