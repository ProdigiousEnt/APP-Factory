
import React, { useState, useEffect } from 'react';
import { Tone, Platform, ImageSize, AspectRatio, AppState, GeneratedContent } from './types';
import { GeminiService } from './services/geminiService';
import { PlatformCard } from './components/PlatformCard';
import { PlatformSelector } from './components/PlatformSelector';
import { HistoryService, HistoryEntry } from './services/historyService';
import { RevenueCatService } from './services/revenueCatService';
import { UsageLimitService } from './services/usageLimitService';
import { Paywall } from './components/Paywall';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './services/utils';
import { Capacitor } from '@capacitor/core';

const Icons = {
  Sparkles: () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
  ),
  Key: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4.1a1 1 0 0 0-1.4 0l-2.1 2.1a1 1 0 0 0 0 1.4ZM15.5 7.5l-3 3ZM7 21l-4-4 2.9-2.9c.7-.7 1.4-1.1 2.1-1.1.7 0 1.4.3 2.1 1.1l1.2 1.2c.8.8 1.1 1.7 1.1 2.7 0 1-.3 1.9-1.1 2.7l-2.9 2.9c-.8.8-1.7 1.1-2.7 1.1-1 0-1.9-.3-2.7-1.1Z" /></svg>
  ),
  External: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
  ),
  Zap: () => (
    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
  ),
  Shield: () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  ),
  Loader: () => (
    <svg className="w-6 h-6 animate-spin text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>
  ),
  History: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
  )
};

const PLATFORMS: Platform[] = ['LinkedIn', 'Twitter/X', 'Instagram'];
const TONES: Tone[] = ['Professional', 'Witty', 'Urgent'];
const SIZES: ImageSize[] = ['1K', '2K'];
const ASPECT_RATIOS: AspectRatio[] = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

const App: React.FC = () => {
  const [view, setView] = useState<'generate' | 'history'>('generate');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState<number>(3);
  const [resetDate, setResetDate] = useState<Date | null>(null);

  const [state, setState] = useState<AppState>({
    idea: '',
    tone: 'Professional',
    imageSize: '1K',
    aspectRatio: '1:1',
    selectedPlatforms: ['LinkedIn', 'Twitter/X', 'Instagram'],
    results: {
      'LinkedIn': null,
      'Twitter/X': null,
      'Instagram': null,
      'Facebook': null,
      'Pinterest': null,
      'Threads': null,
    },
    isGenerating: false,
  });

  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const initServices = async () => {
      // Check Gemini Key
      // @ts-ignore
      if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }

      // Initialize RevenueCat
      await RevenueCatService.initialize();
      const status = await RevenueCatService.checkSubscriptionStatus();
      setIsPro(status);

      // Load usage limit for free tier
      if (!status) {
        const limit = await UsageLimitService.checkGenerationLimit();
        setRemainingGenerations(limit.remaining);
        setResetDate(limit.resetDate);
      }
    };
    initServices();
  }, []);

  const loadHistory = async () => {
    const data = await HistoryService.getHistory();
    setHistory(data);
  };

  useEffect(() => {
    if (view === 'history') {
      loadHistory();
    }
  }, [view]);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (typeof window.aistudio?.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleNewPost = () => {
    setState({
      idea: '',
      tone: 'Professional',
      imageSize: '1K',
      aspectRatio: '1:1',
      selectedPlatforms: state.selectedPlatforms,
      results: {
        'LinkedIn': null,
        'Twitter/X': null,
        'Instagram': null,
        'Facebook': null,
        'Pinterest': null,
        'Threads': null,
      },
      isGenerating: false,
    });
  };

  const handlePlatformToggle = (platform: Platform) => {
    setState(prev => {
      const isSelected = prev.selectedPlatforms.includes(platform);

      if (isSelected) {
        // Deselect
        const newSelected = prev.selectedPlatforms.filter(p => p !== platform);
        return { ...prev, selectedPlatforms: newSelected };
      } else {
        // Select - if at max, replace the first one
        if (prev.selectedPlatforms.length >= 3) {
          const newSelected = [...prev.selectedPlatforms.slice(1), platform];
          return { ...prev, selectedPlatforms: newSelected };
        } else {
          const newSelected = [...prev.selectedPlatforms, platform];
          return { ...prev, selectedPlatforms: newSelected };
        }
      }
    });
  };

  const handleGenerate = async () => {
    if (!state.idea.trim()) return;

    // TEMPORARY: Bypass usage limit check for testing
    // TODO: Re-enable once Supabase generation_usage table is set up
    /*
    // Usage Limit Check: Free tier gets 3 generations per week
    if (!isPro) {
      const limit = await UsageLimitService.checkGenerationLimit();
      console.log('[App] Usage limit check:', limit);
      if (!limit.allowed) {
        setShowPaywall(true);
        return;
      }
    }
    */

    // Entitlement Check: 2K is a Pro feature
    if (state.imageSize === '2K' && !isPro) {
      setShowPaywall(true);
      return;
    }

    setState(prev => ({
      ...prev,
      isGenerating: true,
      results: {
        'LinkedIn': { platform: 'LinkedIn', status: 'loading', text: '', imageUrl: '' },
        'Twitter/X': { platform: 'Twitter/X', status: 'loading', text: '', imageUrl: '' },
        'Instagram': { platform: 'Instagram', status: 'loading', text: '', imageUrl: '' },
      }
    }));

    const gemini = new GeminiService();

    const promises = state.selectedPlatforms.map(async (platform) => {
      try {
        const [text, imageUrl] = await Promise.all([
          gemini.generatePlatformText(state.idea, state.tone, platform),
          gemini.generatePlatformImage(state.idea, platform, state.aspectRatio, state.imageSize)
        ]);

        const result: GeneratedContent = {
          platform,
          text,
          imageUrl,
          status: 'success'
        };

        setState(prev => ({
          ...prev,
          results: {
            ...prev.results,
            [platform]: result
          }
        }));

        // Persist to History
        await HistoryService.saveResult(state.idea, result);

      } catch (error: any) {
        console.error(`Error generating for ${platform}:`, error);

        if (error.message === 'API_KEY_RESET_REQUIRED') {
          setHasApiKey(false);
        }

        setState(prev => ({
          ...prev,
          results: {
            ...prev.results,
            [platform]: {
              platform,
              status: 'error',
              text: '',
              imageUrl: '',
              errorMessage: error.message || 'Unknown error occurred'
            } as GeneratedContent
          }
        }));
      }
    });

    await Promise.all(promises);
    setState(prev => ({ ...prev, isGenerating: false }));

    // Increment usage count for free tier
    if (!isPro) {
      await UsageLimitService.incrementGenerationCount();
      const limit = await UsageLimitService.checkGenerationLimit();
      setRemainingGenerations(limit.remaining);
      setResetDate(limit.resetDate);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 pb-20 selection:bg-indigo-500/10">
      <div className="deep-canvas" />

      <AnimatePresence>
        {showPaywall && (
          <Paywall
            onClose={() => setShowPaywall(false)}
            onSuccess={() => setIsPro(true)}
          />
        )}
      </AnimatePresence>

      {/* HUD Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur-xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.2)] flex-shrink-0">
              <Icons.Sparkles />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 truncate">
                SocialGenie <span className="text-indigo-600">Pro</span>
                {isPro && <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[8px] rounded-full uppercase tracking-tighter align-middle hidden sm:inline">Neural Active</span>}
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em] hidden sm:block">Mission Control</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Upgrade to Pro Button - Always Visible (App Store Compliance) */}
            {!isPro && (
              <button
                onClick={() => setShowPaywall(true)}
                className="glass-pill px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2 border border-indigo-500/20"
              >
                <Icons.Zap /> <span className="hidden sm:inline">Upgrade to Pro</span><span className="sm:hidden">Pro</span>
              </button>
            )}

            {/* Usage Counter Badge - Free Tier Only */}
            {!isPro && (
              <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-100 rounded-full flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-600">{remainingGenerations}/3</span>
                <span className="text-[8px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider hidden sm:inline">remaining</span>
              </div>
            )}

            {view === 'generate' && state.results['LinkedIn'] && (
              <button
                onClick={handleNewPost}
                className="glass-pill px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2"
              >
                <Icons.Plus /> <span className="hidden sm:inline">New Post</span>
              </button>
            )}
            <button
              onClick={() => setView(view === 'generate' ? 'history' : 'generate')}
              className="glass-pill px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:bg-white/40 transition-all flex items-center gap-2"
            >
              {view === 'generate' ? <><Icons.History /> Archives</> : <><Icons.ArrowLeft /> Back</>}
            </button>

            {!hasApiKey && (
              <button
                onClick={handleOpenKeySelector}
                className="glass-pill px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-white/40 transition-all flex items-center gap-2"
              >
                <Icons.Key /> <span className="hidden sm:inline">Connect</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-32">
        <AnimatePresence mode="wait">
          {view === 'history' ? (
            <motion.section
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Intelligence Archives</h2>
                  <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-medium">Historical Generation Log</p>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="aero-panel p-20 text-center opacity-40">
                  <Icons.History />
                  <p className="mt-4 text-lg font-medium">No records found in the neural archives.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.map((entry) => (
                    <div key={entry.id} className="aero-panel p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-black/5 pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">{entry.data.platform}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter line-clamp-1 italic">"{entry.data.idea}"</p>
                      {entry.data.imageUrl && (
                        <div className="aspect-square rounded-xl overflow-hidden border border-black/5">
                          <img src={entry.data.imageUrl} alt="Archived" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{entry.data.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          ) : !hasApiKey ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto mt-12 text-center p-16 aero-panel border-black/5"
            >
              <div className="w-24 h-24 bg-indigo-500/5 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/10 shadow-[0_0_50px_rgba(79,70,229,0.05)]">
                <Icons.Shield />
              </div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight text-slate-900">Neural Core Offline</h2>
              <p className="text-slate-500 mb-10 max-w-md mx-auto leading-relaxed text-lg font-light">
                Initialize the Gemini 2.0 Flash neural link to start generating high-fidelity content and assets.
              </p>
              <button
                onClick={handleOpenKeySelector}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 px-12 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.2)] transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Start Initialization
              </button>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {/* Input Panel */}
              <motion.section
                key="generate-input"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="aero-panel p-10 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10 group-hover:bg-indigo-500/10 transition-colors duration-700" />

                {/* Upgrade Banner - Free Tier Only */}
                {!isPro && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 mb-8"
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <Icons.Zap />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">Upgrade to Pro for Unlimited Generations</h3>
                          <p className="text-white/80 text-sm">Create unlimited content with higher quality and priority support</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPaywall(true)}
                        className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-lg whitespace-nowrap"
                      >
                        Upgrade
                      </button>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-700/20 blur-2xl" />
                  </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-medium text-indigo-600/60 uppercase tracking-widest">
                        <Icons.Zap /> Content Blueprint
                      </label>
                      {state.idea && (
                        <button
                          onClick={() => setState(prev => ({ ...prev, idea: '' }))}
                          className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                          title="Clear"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <textarea
                      value={state.idea}
                      onChange={(e) => setState(prev => ({ ...prev, idea: e.target.value }))}
                      placeholder="Input your concept here..."
                      className="w-full h-48 p-6 bg-slate-50 border border-black/5 rounded-3xl focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none transition-all resize-none text-slate-900 placeholder:text-slate-300 text-lg font-light leading-relaxed shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <label className="text-sm font-medium text-indigo-600/60 uppercase tracking-widest">Neural Tone</label>
                      <div className="flex flex-col gap-3">
                        {TONES.map(t => (
                          <button
                            key={t}
                            onClick={() => setState(prev => ({ ...prev, tone: t }))}
                            className={cn(
                              "px-6 py-3 rounded-2xl text-sm font-medium border transition-all duration-300",
                              state.tone === t
                                ? 'bg-indigo-600/10 text-indigo-600 border-indigo-500/20 shadow-sm'
                                : 'bg-white/50 text-slate-400 border-black/5 hover:border-black/10 hover:text-slate-600'
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <PlatformSelector
                      selectedPlatforms={state.selectedPlatforms}
                      onToggle={handlePlatformToggle}
                    />

                    <div className="space-y-5">
                      <label className="text-sm font-medium text-indigo-600/60 uppercase tracking-widest">Aero Optics</label>
                      <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Resolution</p>
                          <select
                            value={state.imageSize}
                            onChange={(e) => setState(prev => ({ ...prev, imageSize: e.target.value as ImageSize }))}
                            className="w-full bg-slate-50 border border-black/5 rounded-2xl px-4 py-3 text-sm outline-none focus:border-indigo-500/20 transition-colors cursor-pointer text-slate-600"
                          >
                            {SIZES.map(s => <option key={s} value={s} className="bg-white">{s} {s === '2K' ? '★ ' : ''}Fidelity</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-center">
                  <button
                    onClick={handleGenerate}
                    disabled={state.isGenerating || !state.idea.trim()}
                    className={cn(
                      "group relative flex items-center gap-4 py-5 px-16 rounded-3xl font-bold text-xl transition-all duration-500 overflow-hidden",
                      state.isGenerating || !state.idea.trim()
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-black/5'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_40px_rgba(79,70,229,0.2)] hover:scale-[1.02] active:scale-95'
                    )}
                  >
                    {state.isGenerating ? (
                      <>
                        <Icons.Loader />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Icons.Sparkles />
                        <span>Generate Multi-Channel</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.section>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {state.selectedPlatforms.map(p => (
                  <PlatformCard key={p} platform={p} content={state.results[p]} />
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-24 border-t border-black/5 py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-12 mb-8">
            <div className="text-left">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">AI Generation</p>
              <p className="text-sm text-slate-500 font-medium">Production Active</p>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Platform</p>
              <p className="text-sm text-slate-500 font-medium">Multi-Channel Ready</p>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-[0.3em]">
            SOCIALGENIE PRO • AERODYNAMIC DESIGN SYSTEM
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
