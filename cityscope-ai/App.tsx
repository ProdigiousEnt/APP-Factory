
import React, { useState, useRef, useEffect } from 'react';
import { AppState, LandmarkAnalysis, LandmarkHistory, StylePreset } from './types';
import { identifyLandmark, researchLandmark, generateNarration, editLandmarkImage, decodeBase64, decodeAudioData, parsePostcardIntent } from './services/geminiService';
import AROverlay from './components/AROverlay';
import { Keyboard } from '@capacitor/keyboard';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { APP_CONFIG } from './app.config';
import { historyService, HistoryItem } from './services/historyService';
import { revenueCatService } from './services/revenueCatService';

const STYLE_PRESETS: StylePreset[] = [
  { id: 'postcard', label: 'Vintage Postcard', prompt: 'Make it look like a 1920s vintage sepia postcard with elegant cursive text that says "Greetings from [CITY]"', icon: '✉️' },
  { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'Apply a cyberpunk aesthetic with neon pink and blue lighting, holographic data streams in the air, and a futuristic atmosphere.', icon: '🦾' },
  { id: 'golden', label: 'Golden Hour', prompt: 'Enhance the lighting to a warm, cinematic golden hour sunset with long soft shadows and a professional photography look.', icon: '☀️' },
  { id: 'painting', label: 'Oil Painting', prompt: 'Transform this into a vibrant Impressionist oil painting with visible brushstrokes and rich colors.', icon: '🎨' }
];

const drawTextOverlay = (base64: string, text: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!text.trim()) {
      resolve(base64);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `data:image/png;base64,${base64}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Postcard style text overlay
      const fontSize = Math.floor(canvas.width * 0.05);
      ctx.font = `italic 900 ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = canvas.width * 0.01;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw at the bottom center with padding
      ctx.fillText(text, canvas.width / 2, canvas.height * 0.9);

      resolve(canvas.toDataURL('image/png').split(',')[1]);
    };
    img.onerror = () => reject(new Error("Failed to load image for canvas overlay"));
  });
};

// REVIEWER MODE: Unlimited generations for App Store testing
// Change back to APP_CONFIG.freeLimit before production release
const FREE_LIMIT = 9999; // Was: APP_CONFIG.freeLimit

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<LandmarkAnalysis | null>(null);
  const [history, setHistory] = useState<LandmarkHistory | null>(null);
  const [supabaseHistory, setSupabaseHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [effectDescription, setEffectDescription] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [editCount, setEditCount] = useState<number>(() => {
    const saved = localStorage.getItem('cityscope_edit_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPostcardEditor, setShowPostcardEditor] = useState(false);
  const [showPhotoTip, setShowPhotoTip] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    localStorage.setItem('cityscope_edit_count', editCount.toString());
  }, [editCount]);

  useEffect(() => {
    const showPromise = Keyboard.addListener('keyboardWillShow', () => setIsKeyboardVisible(true));
    const hidePromise = Keyboard.addListener('keyboardWillHide', () => setIsKeyboardVisible(false));

    return () => {
      showPromise.then(h => h.remove());
      hidePromise.then(h => h.remove());
    };
  }, []);

  const resetApp = () => {
    setState(AppState.IDLE);
    setOriginalImage(null);
    setDisplayImage(null);
    setAnalysis(null);
    setHistory(null);
    setError(null);
    setAudioBase64(null);
    setShowPaywall(false);
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
    }
    loadSupabaseHistory();
  };

  const loadSupabaseHistory = async () => {
    const data = await historyService.getHistory();
    setSupabaseHistory(data);
  };

  const initRevenueCat = async () => {
    await revenueCatService.initialize();
    const status = await revenueCatService.checkSubscriptionStatus();
    setIsPro(status);
  };

  const handleShare = async () => {
    if (!displayImage) return;
    try {
      // Extract base64 data from data URI
      const base64Data = displayImage.split(',')[1];

      // Save to temporary file
      const fileName = `cityscope-postcard-${Date.now()}.jpg`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      // Share the file using its URI
      await Share.share({
        title: analysis?.name || 'CityScope AI Postcard',
        text: `Check out this ${analysis?.name || 'landmark'} postcard created with CityScope AI!`,
        url: savedFile.uri,
        dialogTitle: 'Share Your Postcard'
      });

      // Clean up temp file after a delay
      setTimeout(async () => {
        try {
          await Filesystem.deleteFile({
            path: fileName,
            directory: Directory.Cache
          });
        } catch (e) {
          // File might already be deleted, ignore
        }
      }, 5000);
    } catch (err: any) {
      console.error('Share failed:', err);
      if (err.message && !err.message.includes('cancel')) {
        setError('Unable to share. Please try saving to photos instead.');
      }
    }
  };

  useEffect(() => {
    loadSupabaseHistory();
    initRevenueCat();
  }, []);

  const playNarration = async (base64: string) => {
    if (!base64) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      const decoded = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(decoded, ctx);
      if (sourceNodeRef.current) sourceNodeRef.current.stop();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
      sourceNodeRef.current = source;
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  const resizeImage = (dataUrl: string, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');

        // Target 3:2 landscape ratio for postcards
        const targetRatio = 3 / 2;
        let sourceWidth = img.width;
        let sourceHeight = img.height;
        let sourceRatio = sourceWidth / sourceHeight;

        // Determine crop dimensions to achieve 3:2 ratio
        let cropWidth, cropHeight, cropX, cropY;

        if (sourceRatio > targetRatio) {
          // Image is wider than 3:2, crop width
          cropHeight = sourceHeight;
          cropWidth = cropHeight * targetRatio;
          cropX = (sourceWidth - cropWidth) / 2;
          cropY = 0;
        } else {
          // Image is taller than 3:2, crop height
          cropWidth = sourceWidth;
          cropHeight = cropWidth / targetRatio;
          cropX = 0;
          cropY = (sourceHeight - cropHeight) / 2;
        }

        // Scale to max width while maintaining 3:2 ratio
        let finalWidth = maxWidth;
        let finalHeight = maxWidth / targetRatio;

        if (cropWidth < maxWidth) {
          finalWidth = cropWidth;
          finalHeight = cropHeight;
        }

        canvas.width = finalWidth;
        canvas.height = finalHeight;
        const ctx = canvas.getContext('2d');

        // Draw cropped and resized image
        ctx?.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,  // Source crop
          0, 0, finalWidth, finalHeight          // Destination
        );

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = dataUrl;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show photo tip toast
    setShowPhotoTip(true);
    setTimeout(() => setShowPhotoTip(false), 3000);

    const reader = new FileReader();
    reader.onload = async () => {
      const optimized = await resizeImage(reader.result as string);
      setOriginalImage(optimized);
      setDisplayImage(optimized);
      const base64 = optimized.split(',')[1];
      startWorkflow(base64);
    };
    reader.readAsDataURL(file);
  };

  const startWorkflow = async (base64: string) => {
    try {
      setState(AppState.ANALYZING);
      const landmark = await identifyLandmark(base64);
      setAnalysis(landmark);

      setState(AppState.RESEARCHING);
      const resHistory = await researchLandmark(landmark.name, landmark.estimatedLocation);
      setHistory(resHistory);

      setState(AppState.NARRATING);
      const narrationText = `Welcome to ${landmark.name}. ${landmark.description}. ${resHistory.fullStory}. Here's a fun fact: ${resHistory.funFacts[0]}`;
      const audio = await generateNarration(narrationText);
      setAudioBase64(audio);
      await playNarration(audio);

      // Save to Supabase History
      await historyService.saveHistory({
        data: {
          name: landmark.name,
          location: landmark.estimatedLocation,
          description: landmark.description,
          type: 'discovery'
        }
      });
      loadSupabaseHistory();

      setState(AppState.READY);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setState(AppState.ERROR);
    }
  };

  const checkAccess = async (): Promise<boolean> => {
    // If they are already Pro, they have access
    if (isPro) return true;

    // Testing mode bypass
    if (APP_CONFIG.testingMode) return true;

    if (isPro) return true;
    if (editCount < FREE_LIMIT) return true;
    const status = await revenueCatService.checkSubscriptionStatus();
    if (status) {
      setIsPro(true);
      return true;
    }
    setShowPaywall(true);
    return false;
  };

  const handlePurchase = async () => {
    setLoadingPurchase(true);
    const success = await revenueCatService.purchasePro();
    if (success) {
      setIsPro(true);
      setShowPaywall(false);
    }
    setLoadingPurchase(false);
  };

  const handleRestore = async () => {
    setLoadingPurchase(true);
    const success = await revenueCatService.restorePurchases();
    if (success) {
      setIsPro(true);
      setShowPaywall(false);
    }
    setLoadingPurchase(false);
  };

  const handleConnectPaidKey = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      setShowPaywall(false);
    } catch (err) {
      console.error("Failed to open key selector", err);
    }
  };

  const performEdit = async (prompt: string) => {
    if (!originalImage) return;
    const access = await checkAccess();
    if (!access) return;

    try {
      setState(AppState.EDITING);

      // Magic Box Parsing: Single input -> Intent (style + text)
      const intent = await parsePostcardIntent(prompt);
      console.log("Extracted Intent:", intent);

      const base64 = originalImage.split(',')[1];
      // Don't pass text to AI (unreliable positioning), use local overlay instead
      const aiEditedBase64 = await editLandmarkImage(base64, intent.style);

      // Apply local text overlay on top of AI-styled image
      const finalBase64 = intent.text.trim()
        ? await drawTextOverlay(aiEditedBase64, intent.text)
        : aiEditedBase64;

      setDisplayImage(`data:image/png;base64,${finalBase64}`);
      setEditCount(prev => prev + 1);

      // Clear text input for next postcard
      setEffectDescription('');

      // Save Postcard to Supabase History
      await historyService.saveHistory({
        data: {
          name: analysis?.name || 'Landmark',
          location: analysis?.estimatedLocation || '',
          description: intent.style,
          type: 'postcard',
          style: intent.style
        }
      });
      loadSupabaseHistory();

      setState(AppState.READY);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        await (window as any).aistudio.openSelectKey();
      }
      setError(err.message);
      setState(AppState.READY);
    }
  };

  const handleApplyStyle = async (preset: StylePreset) => {
    const prompt = preset.prompt.replace('[CITY]', analysis?.estimatedLocation || 'the city');
    await performEdit(prompt);
  };

  const handleCustomEdit = async () => {
    if (!effectDescription.trim()) return;
    await performEdit(effectDescription);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden bg-white">
      {/* Background Decorative Layer */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-10"></div>
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>

      {/* Header - iOS Safe Area Padding */}
      <header className="px-6 pt-12 pb-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-500/30">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 leading-none">{APP_CONFIG.shortName}<span className="text-blue-600">AI</span></h1>
        </div>
        {state !== AppState.IDLE && (
          <button onClick={resetApp} className="p-2.5 text-gray-400 hover:text-gray-900 bg-gray-100/50 rounded-full transition-all active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </header>

      {/* Pro Banner - For Reviewers (Shows on all screens) */}
      {!isPro && (
        <div
          onClick={() => setShowPaywall(true)}
          className="mx-6 mt-4 mb-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-bold">Go Pro for Unlimited Postcards</span>
          </div>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}

      <main className="flex-1 overflow-y-auto momentum-scroll relative z-10">
        {state === AppState.IDLE && (
          <div className="px-8 py-12 flex flex-col items-center justify-center min-h-[80vh] fade-in-up">
            <h2 className="text-4xl font-[900] text-gray-900 mb-4 text-center tracking-tight leading-[1.1]">
              Your Journey, <br /><span className="text-blue-600">Reimagined.</span>
            </h2>
            <p className="text-gray-500 mb-12 text-center text-xl max-w-[300px] leading-relaxed font-medium">
              The world's first AI tour guide that turns photos into history.
            </p>

            <div className="w-full space-y-4 max-w-xs">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.96] text-white font-bold py-5 rounded-3xl shadow-2xl shadow-blue-500/40 transition-all flex items-center justify-center gap-3 text-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Start Exploring
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

              <div className="pt-8 w-full">
                <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Quick Test (Desk Mode)</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      const sampleUrl = "/test-eiffel.jpg";
                      fetch(sampleUrl)
                        .then(res => res.blob())
                        .then(blob => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const dataUrl = reader.result as string;
                            setOriginalImage(dataUrl);
                            setDisplayImage(dataUrl);
                            const base64 = dataUrl.split(',')[1];
                            startWorkflow(base64);
                          };
                          reader.readAsDataURL(blob);
                        });
                    }}
                    className="flex-1 bg-white border-2 border-gray-100 hover:border-blue-100 p-3 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🗼</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase">Eiffel Tower</span>
                  </button>
                  <button
                    onClick={() => {
                      const sampleUrl = "/test-taj.jpg";
                      fetch(sampleUrl)
                        .then(res => res.blob())
                        .then(blob => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const dataUrl = reader.result as string;
                            setOriginalImage(dataUrl);
                            setDisplayImage(dataUrl);
                            const base64 = dataUrl.split(',')[1];
                            startWorkflow(base64);
                          };
                          reader.readAsDataURL(blob);
                        });
                    }}
                    className="flex-1 bg-white border-2 border-gray-100 hover:border-blue-100 p-3 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🕌</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase">Taj Mahal</span>
                  </button>
                  <button
                    onClick={() => {
                      const sampleUrl = "/test-statue.jpg";
                      fetch(sampleUrl)
                        .then(res => res.blob())
                        .then(blob => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const dataUrl = reader.result as string;
                            setOriginalImage(dataUrl);
                            setDisplayImage(dataUrl);
                            const base64 = dataUrl.split(',')[1];
                            startWorkflow(base64);
                          };
                          reader.readAsDataURL(blob);
                        });
                    }}
                    className="flex-1 bg-white border-2 border-gray-100 hover:border-blue-100 p-3 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🗽</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase">Statue Liberty</span>
                  </button>
                </div>
              </div>

              {/* Feature Pills */}
              <div className="mt-20 flex gap-4 overflow-x-auto scrollbar-hide px-4 w-full justify-center">
                <div className="bg-blue-50 px-4 py-2 rounded-2xl flex items-center gap-2 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Real-time Search</span>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-2xl flex items-center gap-2 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Postcard AI</span>
                </div>
              </div>

              {/* Coming Soon: City Recommendations */}
              <div className="mt-12 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-100/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Coming Soon</h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Tell us where you're visiting and get personalized landmark recommendations!
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white/60 rounded-xl border border-blue-100">
                  <p className="text-[10px] text-gray-500 font-medium">
                    💡 <span className="font-bold">Example:</span> Type "Paris" → See Eiffel Tower, Louvre, Notre Dame
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {displayImage && (
          <div className="p-5 pb-48 space-y-6 fade-in-up">
            {/* Native-style Image Card - Postcard Format */}
            <div className="relative rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-black aspect-[3/2] group">
              <img src={displayImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Landmark" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              {/* Overlay states */}
              {(state === AppState.ANALYZING || state === AppState.EDITING) && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-6 z-50">
                  <div className="w-16 h-16 border-[5px] border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="text-xl font-black mb-1">{state === AppState.ANALYZING ? 'Detecting Sight' : 'Magic in Progress'}</p>
                    <p className="text-blue-400 text-sm font-bold opacity-80 uppercase tracking-widest animate-pulse">Processing with AI</p>
                  </div>
                </div>
              )}
              {analysis && state === AppState.READY && editCount === 0 && <AROverlay features={analysis.keyFeatures} />}

              {/* Share Button - Top Right */}
              {state === AppState.READY && (
                <button
                  onClick={handleShare}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg active:scale-90 transition-all z-10 hover:bg-white"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Content Section */}
            {analysis && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Landmark Verified</span>
                    </div>
                    <h2 className="text-3xl font-[900] text-gray-900 leading-[1.1] mb-1">{analysis.name}</h2>
                    <p className="text-blue-600 font-bold text-lg flex items-center gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {analysis.estimatedLocation}
                    </p>
                  </div>
                  {editCount < FREE_LIMIT && (
                    <div className="bg-blue-600 text-white p-4 rounded-3xl text-center shadow-xl shadow-blue-500/20">
                      <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">Free Edits</span>
                      <span className="text-2xl font-black leading-none">{FREE_LIMIT - editCount}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                  <p className="text-gray-600 leading-relaxed text-lg font-medium italic">"{analysis.description}"</p>
                </div>

                {/* Supabase History List (Mini) */}
                {supabaseHistory.length > 0 && state === AppState.READY && (
                  <div className="animate-in fade-in slide-in-from-bottom duration-500">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Recent Discoveries</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {supabaseHistory.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 p-3 rounded-2xl min-w-[140px] shadow-sm">
                          <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{item.data.type}</p>
                          <p className="font-bold text-gray-900 text-sm truncate">{item.data.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {history && (
                  <div className="space-y-6 animate-in fade-in duration-700">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-[2px] flex-1 bg-gray-100"></div>
                        <h3 className="font-black text-gray-400 uppercase tracking-[0.2em]">History & Secrets</h3>
                        <div className="h-[2px] flex-1 bg-gray-100"></div>
                      </div>
                      <p className="text-gray-800 text-lg leading-relaxed font-medium">{history.fullStory}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <h4 className="font-black text-gray-900 text-sm">Insider Fun Facts</h4>
                      {history.funFacts.map((fact, i) => (
                        <div key={i} className="flex gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-3xl items-start">
                          <span className="bg-blue-50 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-black flex-shrink-0 text-xs">0{i + 1}</span>
                          <p className="text-gray-600 text-sm font-medium leading-relaxed">{fact}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-6 pt-10 pb-20">
                      <div className="h-[1px] bg-gray-100 w-full"></div>
                      <div className="text-center space-y-4">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Capture the Moment</p>
                        <button
                          onClick={() => setShowPostcardEditor(true)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black py-5 rounded-[28px] shadow-2xl shadow-blue-500/30 active:scale-95 transition-all text-lg flex items-center justify-center gap-3 group"
                        >
                          <svg className="w-6 h-6 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Generate AI Postcard
                        </button>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Powered by CityScope AI</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Editing & Audio Controls Bar - iOS Fixed Footer */}
      {state === AppState.READY && displayImage && showPostcardEditor && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowPostcardEditor(false)}>
          <div
            className="w-full max-w-md bg-white rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in slide-in-from-bottom duration-500 pb-safe"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-4 mb-2"></div>

            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Create Your Postcard</h4>
                  {editCount < FREE_LIMIT && (
                    <span className="text-[9px] font-bold text-blue-400/80 uppercase tracking-widest mt-0.5">
                      {FREE_LIMIT - editCount} Free Trials Left
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowPostcardEditor(false)}
                  className="bg-gray-100 text-gray-400 p-2 rounded-full active:scale-90 transition-transform"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {!isKeyboardVisible && (
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {STYLE_PRESETS.map((style) => (
                      <button
                        key={style.id}
                        disabled={state === AppState.EDITING}
                        onClick={() => {
                          setEffectDescription(style.prompt.replace('[CITY]', analysis?.estimatedLocation || 'the city'));
                          handleApplyStyle(style);
                        }}
                        className={`flex-shrink-0 flex flex-col items-center gap-1.5 group ${state === AppState.EDITING ? 'opacity-50' : ''}`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-xl shadow-sm border border-transparent group-hover:bg-blue-50 group-hover:border-blue-100 transition-all duration-300">
                          {style.icon}
                        </div>
                        <span className="text-[8px] font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-tight">{style.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="relative flex gap-2">
                    <input
                      type="text"
                      disabled={state === AppState.EDITING}
                      placeholder="Write greeting and effect for postcard (e.g. 'Hello from Paris' with fireworks)..."
                      className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-200 transition-all placeholder:text-gray-300"
                      value={effectDescription}
                      onChange={(e) => setEffectDescription(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCustomEdit()}
                    />
                    <button
                      onClick={handleCustomEdit}
                      disabled={state === AppState.EDITING || !effectDescription.trim()}
                      className={`${state === AppState.EDITING ? 'bg-blue-400' : 'bg-blue-600'} text-white p-2.5 rounded-xl active:scale-90 transition-all shadow-md shadow-blue-500/20`}
                    >
                      {state === AppState.EDITING ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Integrated Player - Compressed */}
            {audioBase64 && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3.5 flex items-center gap-4 text-white">
                <button
                  onClick={() => playNarration(audioBase64)}
                  className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all group flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black truncate leading-tight">{analysis?.name}</p>
                </div>
                <div className="flex gap-1 items-end h-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-1 bg-blue-300/40 rounded-full animate-bounce" style={{ height: `${40 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paywall Overlay - RevenueCat Dashboard Style */}
      {showPaywall && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className="w-full max-w-lg bg-white rounded-t-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500 pb-safe"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Banner / Hero */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 pt-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
                <svg viewBox="0 0 24 24" fill="none" className="w-48 h-48" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>

              <button
                onClick={() => setShowPaywall(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                  Premium Access
                </div>
                <h2 className="text-4xl font-black tracking-tighter mb-2">Go {APP_CONFIG.shortName} <span className="text-blue-300">Pro</span></h2>
                <p className="text-blue-100 font-medium text-lg leading-tight">Unlock the full power of your AI Tour Guide.</p>
              </div>
            </div>

            {/* Subscription Details - Required by Guideline 3.1.2 */}
            <div className="p-8 pb-4 border-b border-gray-100">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-gray-900 mb-1">CityScope AI Pro</h3>
                    <p className="text-sm font-bold text-blue-600">Annual Subscription</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900">$9.99</p>
                    <p className="text-xs font-bold text-gray-500">per year</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-gray-700">12 months of premium access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="font-medium text-gray-700">Just $0.42 per month</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-blue-100">
                  <p className="text-xs font-bold text-gray-600 mb-2">What's included:</p>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Unlimited AI postcard generations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Premium audio tours with high-fidelity narration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Full discovery history synced across devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Access to Gemini 2.0 Pro creative engine</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Purchase Actions */}
            <div className="px-8 pt-6 pb-4 space-y-4">
              <button
                onClick={handlePurchase}
                disabled={loadingPurchase}
                className="w-full bg-blue-600 active:bg-blue-700 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loadingPurchase ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Subscribe Now - $9.99/year</>
                )}
              </button>

              <button
                onClick={handleRestore}
                disabled={loadingPurchase}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 hover:bg-gray-200"
              >
                Restore Purchases
              </button>

              <p className="text-[10px] text-gray-400 text-center px-4 leading-relaxed font-medium">
                Subscription automatically renews annually. Cancel anytime in App Store settings. Payment charged to Apple ID at confirmation of purchase.
              </p>
            </div>

            {/* Legal Links - Required by Guideline 3.1.2 */}
            <div className="px-8 pb-8 pt-2">
              <div className="flex items-center justify-center gap-4 text-sm">
                <button
                  onClick={async () => await Browser.open({ url: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/' })}
                  className="text-blue-600 font-bold underline hover:text-blue-700 transition-colors"
                >
                  Terms of Use
                </button>
                <span className="text-gray-300">•</span>
                <button
                  onClick={async () => await Browser.open({ url: 'https://prodigiousent.github.io/APP-Factory/cityscope/index.html' })}
                  className="text-blue-600 font-bold underline hover:text-blue-700 transition-colors"
                >
                  Privacy Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Tip Toast */}
      {showPhotoTip && (
        <div className="fixed top-safe left-4 right-4 mt-4 bg-blue-600 text-white p-4 rounded-[20px] shadow-2xl z-[100] text-sm flex items-center gap-3 animate-in slide-in-from-top-10 duration-500">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-bold text-base">📸 Photo Tip</p>
            <p className="text-sm text-white/90 mt-0.5">Use landscape mode for best postcard results</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-safe left-4 right-4 mt-4 bg-red-600 text-white p-5 rounded-[24px] shadow-2xl z-[100] text-sm flex justify-between items-center animate-in slide-in-from-top-10 duration-500">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="font-bold text-base">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="bg-white/20 p-2 rounded-xl active:scale-90 transition-transform">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
