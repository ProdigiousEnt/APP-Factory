import React, { useState, useEffect } from 'react';
import { geminiService } from './services/geminiService';
import { MeditationSession, GenerationStep } from './types';
import ChatBot from './components/ChatBot';
import MeditationPlayer from './components/MeditationPlayer';
import Auth from './components/Auth';
import SubscriptionView from './components/SubscriptionView';
import { supabase } from './services/supabaseClient';
import { revenueCatService } from './services/revenueCatService';
import { Session } from '@supabase/supabase-js';
import { APP_CONFIG } from './app.config';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(APP_CONFIG.persona.voices[0].id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        initializeRevenueCat(session.user.id);
        loadHistory(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        initializeRevenueCat(session.user.id);
        loadHistory(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeRevenueCat = async (userId: string) => {
    await revenueCatService.initialize(userId);
    const hasPro = await revenueCatService.checkEntitlement();
    setIsPro(hasPro);
  };

  const loadHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('meditations')
      .select('*')
      .eq('user_id', userId)
      .eq('app_id', APP_CONFIG.appId)
      .order('created_at', { ascending: false });

    if (data) {
      setSessions(data.map(d => ({
        id: d.id.toString(),
        theme: d.theme,
        script: d.script,
        imageUrl: d.image_url,
        audioData: d.audio_data, // Changed from audio_url to audio_data
        timestamp: d.created_at
      })));
    }
  };

  const saveMeditationToHistory = async (sess: MeditationSession, userId: string) => {
    await supabase.from('meditations').insert({
      user_id: userId,
      app_id: APP_CONFIG.appId,
      theme: sess.theme,
      script: sess.script,
      image_url: sess.imageUrl,
      audio_data: sess.audioData // Changed from audio_url to audio_data
    });
  };

  const [steps, setSteps] = useState<GenerationStep[]>([
    { label: 'Crafting Script', status: 'idle' },
    { label: 'Visualizing Scene', status: 'idle' },
    { label: 'Synthesizing Voice', status: 'idle' },
  ]);

  const updateStepStatus = (index: number, status: GenerationStep['status']) => {
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[index].status = status;
      return newSteps;
    });
  };

  const resetSteps = () => {
    setSteps(prev => prev.map(s => ({ ...s, status: 'idle' })));
  };

  const handleGenerate = async (presetTheme?: string) => {
    const targetTheme = presetTheme || theme;
    if (!targetTheme) return;

    setIsGenerating(true);
    setError(null);
    resetSteps();

    try {
      if (!isPro && sessions.length >= APP_CONFIG.freeLimit) {
        setShowSubscription(true);
        return;
      }

      updateStepStatus(0, 'loading');
      const script = await geminiService.generateMeditationScript(targetTheme);
      updateStepStatus(0, 'completed');

      updateStepStatus(1, 'loading');
      const imageUrl = await geminiService.generateMeditationImage(targetTheme);
      updateStepStatus(1, 'completed');

      updateStepStatus(2, 'loading');
      const audioData = await geminiService.generateTTS(script, selectedVoice);
      updateStepStatus(2, 'completed');

      const newSession: MeditationSession = {
        id: Date.now().toString(),
        theme: targetTheme,
        script,
        imageUrl,
        audioData, // Base64-encoded TTS audio
        timestamp: new Date().toISOString()
      };

      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession);
      setTheme('');
    } catch (err: any) {
      console.error("Generation Error Details:", err);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);
      console.error("Full error object:", JSON.stringify(err, null, 2));
      setError(`Unable to generate session: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Temporarily disabled for testing
  // if (!session) {
  //   return <Auth />;
  // }

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden bg-slate-950 text-slate-100 selection:bg-indigo-500/30 bg-gradient-to-br ${APP_CONFIG.theme.gradient}`}>
      {/* Full Screen Player Layer */}
      {activeSession && (
        <MeditationPlayer
          session={activeSession}
          onClose={() => setActiveSession(null)}
        />
      )}

      {showSubscription && (
        <SubscriptionView
          onPurchased={() => {
            setIsPro(true);
            setShowSubscription(false);
          }}
          onClose={() => setShowSubscription(false)}
        />
      )}

      {/* App Shell */}
      <header className={`z-20 px-6 pt-[env(safe-area-inset-top,1rem)] pb-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-${APP_CONFIG.theme.primary}-500/10`}>
            <img src={APP_CONFIG.logoUrl} alt={`${APP_CONFIG.name} Logo`} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{APP_CONFIG.name}</h1>
            {isPro && <span className={`text-[10px] font-black text-white uppercase tracking-widest bg-indigo-500 px-2 py-0.5 rounded-full border border-white/10`}>Pro</span>}
          </div>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full p-6 space-y-8 z-10">
        <div className="space-y-2 text-center py-4">
          <h2 className="text-3xl font-serif text-indigo-100">Daily Mindfulness</h2>
          <p className="text-slate-500 text-sm">Create an immersive escape in seconds.</p>
        </div>

        {/* Action Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-sm space-y-6">
          <div className="space-y-4">
            {/* Quick Themes */}
            <div className="flex flex-wrap gap-2">
              {APP_CONFIG.persona.popularThemes.map((t) => (
                <button
                  key={t}
                  onClick={() => handleGenerate(t)}
                  className="px-3 py-1.5 bg-slate-800/10 border border-slate-700/50 rounded-full text-[10px] font-bold text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all uppercase tracking-wider"
                >
                  {t}
                </button>
              ))}
            </div>

            <textarea
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Or define your own voyage... (e.g. A mountain cabin at dusk)"
              className="w-full h-32 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all text-base leading-relaxed"
            />

            {/* Voice Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Choose Your Guide</h4>
                {/* Temporarily disabled for testing */}
                {/* <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                  Pro Feature
                </span> */}
              </div>
              {/* Temporarily removed Pro feature message for testing */}
              {/* <div className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl">
                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                  🎙️ <span className="font-semibold text-slate-300">AI Voice Narration</span> is a premium feature. Upgrade to Pro to unlock guided meditation with calming voice narration.
                </p>
                <p className="text-[10px] text-slate-500">
                  For now, enjoy beautiful visuals and ambient sounds with text-based meditation scripts.
                </p>
              </div> */}
              <div className="grid grid-cols-1 gap-2">
                {APP_CONFIG.persona.voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${selectedVoice === voice.id
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                      : 'bg-slate-800/20 border-slate-700/50 text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    <div className="text-left">
                      <div className="text-sm font-bold">{voice.label}</div>
                      <div className="text-[10px] opacity-60">{voice.description}</div>
                    </div>
                    {selectedVoice === voice.id && <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !theme}
              className="group relative w-full py-5 bg-white text-slate-950 font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">{isGenerating ? 'Synthesizing Experience...' : 'Create Meditation'}</span>
            </button>
          </div>

          {isGenerating && (
            <div className="space-y-3 pt-4 border-t border-slate-800/50">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${step.status === 'loading' ? 'bg-indigo-400 animate-pulse' :
                    step.status === 'completed' ? 'bg-teal-400' : 'bg-slate-800'
                    }`} />
                  <span className={`text-xs font-medium ${step.status === 'loading' ? 'text-indigo-300' :
                    step.status === 'completed' ? 'text-teal-300' : 'text-slate-600'
                    }`}>{step.label}</span>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-red-400/80 text-xs text-center font-medium bg-red-400/5 py-3 rounded-xl border border-red-400/10">{error}</p>}
        </div>

        {/* Library */}
        <div className="space-y-4 pt-4">
          <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] px-1">Recent Journeys</h3>
          <div className="grid grid-cols-1 gap-3">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setActiveSession(session)}
                className="group flex items-center gap-4 p-3 bg-slate-900/20 hover:bg-slate-900/60 border border-slate-800/50 rounded-2xl transition-all"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg">
                  <img src={session.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors truncate max-w-[200px]">{session.theme}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <ChatBot />

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default App;
