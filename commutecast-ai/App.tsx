
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { NewsArticle, SummaryConfig, AppStatus } from './types';
import { summarizeArticles, generateSpeech } from './services/gemini';
import { decode, decodeAudioData } from './utils/audio';

// Components
const Header = () => (
  <header className="flex items-center justify-between p-6 bg-white border-b sticky top-0 z-10 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
        <i className="fas fa-podcast text-xl"></i>
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">CommuteCast <span className="text-indigo-600">AI</span></h1>
        <p className="text-xs text-gray-500 font-medium">Your Morning News, Audio-fied</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span> Live API
      </span>
    </div>
  </header>
);

const App: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [summary, setSummary] = useState<string>('');
  const [config, setConfig] = useState<SummaryConfig>({
    persona: 'professional',
    duration: 'medium',
    voice: 'Kore'
  });
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const addArticle = () => {
    if (!newTitle || !newContent) return;
    const article: NewsArticle = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      content: newContent
    };
    setArticles([...articles, article]);
    setNewTitle('');
    setNewContent('');
  };

  const removeArticle = (id: string) => {
    setArticles(articles.filter(a => a.id !== id));
  };

  const handleGenerate = async () => {
    if (articles.length === 0) return;
    
    try {
      setStatus(AppStatus.SUMMARIZING);
      const textSummary = await summarizeArticles(articles, config);
      setSummary(textSummary);
      
      setStatus(AppStatus.GENERATING_AUDIO);
      const audioBase64 = await generateSpeech(textSummary, config.voice);
      
      // Setup Audio Context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      
      const rawData = decode(audioBase64);
      const audioBuffer = await decodeAudioData(rawData, ctx, 24000, 1);
      
      // Stop previous if playing
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setIsPlaying(false);
        setStatus(AppStatus.IDLE);
      };
      
      audioSourceRef.current = source;
      source.start(0);
      setIsPlaying(true);
      setStatus(AppStatus.PLAYING);
      
    } catch (err) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      alert("Something went wrong. Please check your API key or input.");
    }
  };

  const togglePlayback = () => {
    if (status === AppStatus.PLAYING && audioSourceRef.current) {
      if (isPlaying) {
        audioContextRef.current?.suspend();
      } else {
        audioContextRef.current?.resume();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stopPlayback = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      setIsPlaying(false);
      setStatus(AppStatus.IDLE);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto bg-gray-50 pb-20 md:pb-0">
      <Header />
      
      <main className="flex-1 p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-plus-circle text-indigo-500"></i> Add News Article
            </h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Article Title or URL" 
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <textarea 
                placeholder="Paste the article content here..." 
                rows={5}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              ></textarea>
              <button 
                onClick={addArticle}
                disabled={!newTitle || !newContent}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100"
              >
                <i className="fas fa-file-import"></i> Add to Queue
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border min-h-[300px]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-list text-indigo-500"></i> Current Queue
              <span className="ml-auto text-xs font-normal text-gray-500">{articles.length} items</span>
            </h2>
            {articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <i className="fas fa-newspaper text-5xl mb-4 opacity-20"></i>
                <p>Your news queue is empty.</p>
                <p className="text-sm">Add some articles to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {articles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-medium text-gray-900 truncate">{article.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{article.content.substring(0, 100)}...</p>
                    </div>
                    <button 
                      onClick={() => removeArticle(article.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Settings & Summary Section */}
        <section className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-cog text-indigo-500"></i> Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Narrator Persona</label>
                <select 
                  className="w-full p-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={config.persona}
                  onChange={(e) => setConfig({...config, persona: e.target.value as any})}
                >
                  <option value="professional">Professional News Anchor</option>
                  <option value="chill">Chill Friend</option>
                  <option value="enthusiastic">Energetic Morning Host</option>
                  <option value="concise">Direct & Fast-paced</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Target Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['short', 'medium', 'long'] as const).map(d => (
                    <button 
                      key={d}
                      onClick={() => setConfig({...config, duration: d})}
                      className={`py-2 text-xs font-semibold rounded-lg capitalize border ${config.duration === d ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Voice Selection</label>
                <select 
                  className="w-full p-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={config.voice}
                  onChange={(e) => setConfig({...config, voice: e.target.value as any})}
                >
                  <option value="Kore">Kore (Balanced)</option>
                  <option value="Puck">Puck (Fast-paced)</option>
                  <option value="Charon">Charon (Deep/Gravelly)</option>
                  <option value="Fenrir">Fenrir (Authoritative)</option>
                  <option value="Zephyr">Zephyr (Light/Airy)</option>
                </select>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={articles.length === 0 || status !== AppStatus.IDLE}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {status === AppStatus.SUMMARIZING && <i className="fas fa-spinner animate-spin"></i>}
                {status === AppStatus.GENERATING_AUDIO && <i className="fas fa-wave-square animate-pulse"></i>}
                {status === AppStatus.IDLE && <i className="fas fa-bolt"></i>}
                <span>
                  {status === AppStatus.SUMMARIZING ? 'Summarizing...' : 
                   status === AppStatus.GENERATING_AUDIO ? 'Preparing Audio...' : 
                   'Generate CommuteCast'}
                </span>
              </button>
            </div>
          </div>

          {/* Transcript Panel */}
          {summary && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <i className="fas fa-file-alt text-indigo-500"></i> Transcript
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {summary}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Floating Audio Player */}
      {status === AppStatus.PLAYING && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-full md:max-w-2xl px-4 z-50">
          <div className="glass rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-indigo-100">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-lg animate-pulse">
              <i className="fas fa-waveform text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">Morning Commute Summary</p>
              <p className="text-xs text-gray-500 font-medium">Personalized for you</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={togglePlayback}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-indigo-600 transition-colors"
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
              <button 
                onClick={stopPlayback}
                className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
              >
                <i className="fas fa-stop"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
