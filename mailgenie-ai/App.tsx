
import React, { useState, useEffect } from 'react';
import { EmailCampaign } from './types';
import CampaignBuilder from './components/CampaignBuilder';
import CampaignViewer from './components/CampaignViewer';
import ChatBot from './components/ChatBot';
import KeySelector from './components/KeySelector';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [currentCampaign, setCurrentCampaign] = useState<EmailCampaign | null>(null);
  const [history, setHistory] = useState<EmailCampaign[]>([]);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } else {
      // Fallback for environments where key selection isn't strictly enforced via this mechanism
      // but in this prompt's context, we follow the rule.
      setHasKey(!!process.env.API_KEY);
    }
  };

  const handleCampaignGenerated = (campaign: EmailCampaign) => {
    setCurrentCampaign(campaign);
    setHistory(prev => [campaign, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {!hasKey && <KeySelector onKeySelected={() => setHasKey(true)} />}

      {/* Sidebar - Desktop Only */}
      <aside className="w-full lg:w-80 bg-slate-900 text-slate-300 p-6 flex-shrink-0 flex lg:flex-col border-b lg:border-r border-slate-800">
        <div className="flex items-center gap-3 mb-12 flex-1 lg:flex-none">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <i className="fa-solid fa-paper-plane-pulse text-lg"></i>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">MailGenie <span className="text-blue-500">AI</span></h1>
        </div>

        <nav className="hidden lg:block space-y-2 mb-8">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl transition-all">
            <i className="fa-solid fa-plus-circle"></i> Create New
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all">
            <i className="fa-solid fa-chart-line"></i> Analytics
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all">
            <i className="fa-solid fa-users"></i> Audience
          </button>
        </nav>

        <div className="hidden lg:block flex-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Campaigns</p>
          <div className="space-y-3">
            {history.length === 0 && <p className="text-xs text-slate-600 italic">No campaigns yet...</p>}
            {history.map(c => (
              <button
                key={c.id}
                onClick={() => setCurrentCampaign(c)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-all truncate border ${
                  currentCampaign?.id === c.id ? 'bg-blue-600/20 border-blue-600/50 text-white' : 'hover:bg-white/5 border-transparent'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:block pt-6 mt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
               <i className="fa-solid fa-user text-xs"></i>
             </div>
             <div className="flex-1 text-xs">
                <p className="text-white font-semibold">Pro Plan User</p>
                <p className="text-slate-500">Marketing Expert</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-8">
        <header className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Campaign Center</h2>
            <p className="text-slate-500">Generate high-converting emails in seconds.</p>
          </div>
          <div className="flex gap-3">
            <button className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
              <i className="fa-solid fa-gear"></i> Settings
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <CampaignBuilder onCampaignGenerated={handleCampaignGenerated} />
            
            {/* Quick Tips Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
               <h3 className="font-bold mb-2 flex items-center gap-2">
                 <i className="fa-solid fa-lightbulb"></i> Pro Tip
               </h3>
               <p className="text-sm text-blue-100 leading-relaxed">
                 Be specific about your audience's pain points. Gemini works best when you describe the transformation your product offers.
               </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            {currentCampaign ? (
              <CampaignViewer campaign={currentCampaign} />
            ) : (
              <div className="h-[600px] bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-10">
                <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 text-slate-200">
                   <i className="fa-solid fa-rocket text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Ready for liftoff?</h3>
                <p className="text-slate-500 max-w-sm">
                  Enter a prompt in the sidebar to generate your first complete email marketing campaign.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Chat Bot Layer */}
      <ChatBot />
    </div>
  );
};

export default App;
