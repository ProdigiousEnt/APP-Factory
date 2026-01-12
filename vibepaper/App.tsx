
import React, { useState, useEffect, useRef } from 'react';
import { AspectRatio, ImageSize, Wallpaper, GenerationState } from './types';
import { generateSingleImage } from './services/geminiService';
import { LoadingOverlay } from './components/LoadingOverlay';
import { WallpaperModal } from './components/WallpaperModal';
import { PaywallModal } from './components/PaywallModal';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { revenueCatService } from './services/revenueCatService';
import { saveImageToLocal, syncMetadataToCloud, readImageAsBase64, convertInternalSrc } from './services/persistenceService';
import { appConfig } from './app.config';

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '3:4', '4:3', '9:16', '16:9'];
const IMAGE_SIZES: ImageSize[] = ['1K', '2K'];

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [results, setResults] = useState<Wallpaper[]>([]);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [generationCount, setGenerationCount] = useState<number>(0);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [genState, setGenState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    message: '',
    error: null,
  });

  useEffect(() => {
    initRevenueCat();
    loadGenerationCount();
  }, []);

  const loadGenerationCount = () => {
    const saved = localStorage.getItem('vibepaper_generation_count');
    if (saved) {
      setGenerationCount(parseInt(saved, 10));
    }
  };

  const incrementGenerationCount = () => {
    const newCount = generationCount + 1;
    setGenerationCount(newCount);
    localStorage.setItem('vibepaper_generation_count', newCount.toString());

    // Show paywall if free limit reached and not Pro
    if (!isPro && !appConfig.testingMode && newCount >= appConfig.freeGenerationLimit) {
      setShowPaywall(true);
    }
  };

  const initRevenueCat = async () => {
    try {
      await revenueCatService.initialize();
      const status = await revenueCatService.checkSubscriptionStatus();
      setIsPro(status);
    } catch (e) {
      console.error("Error initializing RevenueCat", e);
      setIsPro(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (remixSource?: Wallpaper) => {
    if (!prompt.trim() && !remixSource && !uploadedPhoto) return;

    await Haptics.impact({ style: ImpactStyle.Medium });

    setGenState({ isGenerating: true, progress: 0, message: 'Initiating vibe scan...', error: null });

    // Determine the reference image: Uploaded photo takes priority over Remix source
    let referenceImage = uploadedPhoto;

    if (!referenceImage && remixSource) {
      if (remixSource.url.startsWith('file://') || remixSource.url.startsWith('capacitor://')) {
        referenceImage = await readImageAsBase64(remixSource.url);
      } else {
        referenceImage = remixSource.url;
      }
    }

    const activePrompt = prompt || (remixSource?.prompt || 'Beautiful artistic wallpaper');

    try {
      // Generate based on Pro status or testing mode
      const isProOrTesting = isPro || appConfig.testingMode;
      const generationCount = isProOrTesting ? appConfig.proBatchSize : appConfig.freeBatchSize;

      const generationPromises = Array(generationCount).fill(null).map(() =>
        generateSingleImage(activePrompt, {
          aspectRatio,
          imageSize,
          referenceImageBase64: referenceImage || undefined
        })
      );

      const urls = await Promise.all(generationPromises);

      const newWallpapers: Wallpaper[] = await Promise.all(urls.map(async (url, i) => {
        const id = `wp-${Date.now()}-${i}`;
        // Save to local filesystem to save on cloud storage
        const localUrl = await saveImageToLocal(id, url);

        const wp: Wallpaper = {
          id,
          url: localUrl,
          prompt: activePrompt,
          timestamp: Date.now(),
          config: { aspectRatio, imageSize }
        };

        // Sync metadata to cloud (non-blocking)
        syncMetadataToCloud(wp);

        return wp;
      }));

      setResults(prev => [...newWallpapers, ...prev]);
      setGenState(prev => ({ ...prev, isGenerating: false }));

      // Increment generation count for free tier tracking
      incrementGenerationCount();

      await Haptics.notification({ type: ImpactStyle.Light as any }); // Success haptic

      // Clear specific ephemeral states
      if (remixSource) setSelectedWallpaper(null);
    } catch (error: any) {
      setGenState({
        isGenerating: false,
        progress: 0,
        message: '',
        error: error.message || 'Something went wrong while generating.'
      });
    }
  };

  const handleRemix = async (wp: Wallpaper) => {
    setPrompt(wp.prompt);
    setUploadedPhoto(null); // Clear manual upload when remixing a result
    await handleGenerate(wp);
  };


  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto relative shadow-2xl bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-white/5 p-4 pt-[calc(1rem+var(--sat))] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-sparkles text-white text-xs"></i>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            VibePaper
          </h1>
        </div>
        {!isPro && (
          <button
            onClick={() => setShowPaywall(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full text-[10px] font-black uppercase tracking-tighter text-white animate-pulse shadow-lg"
          >
            Go Pro
          </button>
        )}
        {isPro && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-[10px] uppercase font-black tracking-widest text-purple-400">Pro</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-[calc(1rem+var(--sab))] space-y-8 custom-scroll">
        {/* Hero Input Section */}
        <section className="space-y-6">
          <div className="space-y-2 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Combine your vibe</label>
                <button
                  onClick={() => {
                    setPrompt('');
                    setUploadedPhoto(null);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <i className="fa-solid fa-plus text-[10px] text-purple-400"></i>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">New</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-600 font-mono">{prompt.length}/500</span>
            </div>
            <div className="relative group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={500}
                placeholder="Describe the aesthetic (e.g. 'Neon forest', 'Minimalist ocean'...)"
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 pt-5 pb-16 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[160px] transition-all resize-none text-lg leading-relaxed"
              />

              {/* Upload Action */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {uploadedPhoto ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-purple-500">
                      <img src={uploadedPhoto} className="w-full h-full object-cover" alt="Upload preview" />
                      <button
                        onClick={() => setUploadedPhoto(null)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"
                      >
                        <i className="fa-solid fa-xmark text-xs"></i>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <i className="fa-solid fa-image-plus"></i>
                    </button>
                  )}
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                    {uploadedPhoto ? "Photo Attached" : "Add Reference Photo"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`text-xs py-2 px-1 rounded-xl border transition-all ${aspectRatio === ratio
                      ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Quality</label>
              <div className="flex flex-col gap-2">
                {IMAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      if (size === '2K' && !isPro && !appConfig.testingMode) {
                        alert("2K Quality is a Pro Feature!");
                        return;
                      }
                      setImageSize(size);
                    }}
                    className={`text-xs py-2 px-4 rounded-xl border transition-all relative overflow-hidden ${imageSize === size
                      ? 'bg-white text-black border-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                  >
                    {size}
                    {size === '2K' && !isPro && !appConfig.testingMode && (
                      <div className="absolute top-1 right-1">
                        <i className="fa-solid fa-lock text-[8px] text-gray-500"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={genState.isGenerating || (!prompt.trim() && !uploadedPhoto)}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-5 rounded-3xl shadow-xl shadow-purple-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.97] flex items-center justify-center gap-3 text-lg"
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Create Wallpapers
          </button>

          {genState.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-start gap-3">
              <i className="fa-solid fa-triangle-exclamation mt-1"></i>
              <p className="leading-relaxed">{genState.error}</p>
            </div>
          )}
        </section>

        {/* Gallery Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <i className="fa-solid fa-gallery-thumbnails text-purple-400"></i>
              Your Creations
            </h2>
            {results.length > 0 && (
              <button
                onClick={() => setResults([])}
                className="text-[10px] uppercase font-bold text-gray-600 hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="aspect-[4/3] rounded-[2rem] bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-plus text-2xl opacity-20"></i>
              </div>
              <p className="text-sm">Describe a vibe or upload a photo to start your collection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pb-12">
              {results.map((wp) => (
                <div
                  key={wp.id}
                  onClick={() => setSelectedWallpaper(wp)}
                  className="group relative bg-white/5 rounded-2xl overflow-hidden cursor-pointer ring-1 ring-white/10 hover:ring-purple-500/50 transition-all active:scale-95 shadow-lg animate-in fade-in zoom-in duration-300"
                  style={{ aspectRatio: wp.config.aspectRatio.replace(':', '/') }}
                >
                  <img
                    src={convertInternalSrc(wp.url)}
                    alt={wp.prompt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white font-black uppercase tracking-widest opacity-90">
                        {wp.config.imageSize}
                      </span>
                      <span className="text-[10px] text-purple-300 font-bold truncate max-w-[120px]">
                        {wp.prompt}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modals & Overlays */}
      {genState.isGenerating && <LoadingOverlay />}

      {selectedWallpaper && (
        <WallpaperModal
          wallpaper={selectedWallpaper}
          onClose={() => setSelectedWallpaper(null)}
          onRemix={handleRemix}
        />
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onPurchase={async () => {
            // Mock purchase for screenshots - in production this would call RevenueCat
            if (appConfig.testingMode) {
              setIsPro(true);
              setShowPaywall(false);
              await Haptics.notification({ type: ImpactStyle.Light as any });
            } else {
              const success = await revenueCatService.purchasePro();
              if (success) {
                setIsPro(true);
                setShowPaywall(false);
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default App;
