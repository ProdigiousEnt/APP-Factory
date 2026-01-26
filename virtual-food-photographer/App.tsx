
import React, { useState, useEffect, useCallback } from 'react';
import { PhotographyStyle, ImageSize, Dish } from './types';
import { parseMenu, generateFoodImage, editFoodImage } from './geminiService';

const App: React.FC = () => {
  const [menuText, setMenuText] = useState('');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<PhotographyStyle>('Bright/Modern');
  const [selectedSize, setSelectedSize] = useState<ImageSize>('1K');
  const [isProcessingMenu, setIsProcessingMenu] = useState(false);
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // Use existing global aistudio definition to avoid type clashes
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success as per guidelines to avoid race condition
      setApiKeySelected(true);
    }
  };

  const handleParseMenu = async () => {
    if (!menuText.trim()) return;
    setIsProcessingMenu(true);
    try {
      const extracted = await parseMenu(menuText);
      const newDishes: Dish[] = extracted.map((d, i) => ({
        id: `dish-${Date.now()}-${i}`,
        name: d.name || 'Unknown Dish',
        description: d.description || '',
        status: 'idle' as const
      }));
      setDishes(newDishes);
    } catch (error: any) {
      console.error(error);
      // Reset key if requested entity was not found (standard error for invalid/missing keys in this context)
      if (error?.message?.includes("Requested entity was not found")) {
        setApiKeySelected(false);
      }
      alert("Failed to parse menu. Please try again.");
    } finally {
      setIsProcessingMenu(false);
    }
  };

  const handleGenerateImage = async (dishId: string) => {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return;

    setDishes(prev => prev.map(d => 
      d.id === dishId ? { ...d, status: 'generating', error: undefined } : d
    ));

    try {
      const imageUrl = await generateFoodImage(dish, selectedStyle, selectedSize);
      setDishes(prev => prev.map(d => 
        d.id === dishId ? { ...d, status: 'completed', imageUrl } : d
      ));
    } catch (error: any) {
      console.error(error);
      let errorMsg = "Generation failed";
      // Reset key if requested entity was not found
      if (error?.message?.includes("Requested entity was not found")) {
        setApiKeySelected(false);
        errorMsg = "API key issue. Please re-select key.";
      }
      setDishes(prev => prev.map(d => 
        d.id === dishId ? { ...d, status: 'error', error: errorMsg } : d
      ));
    }
  };

  const handleEditImage = async () => {
    if (!editingDishId || !editPrompt) return;
    const dish = dishes.find(d => d.id === editingDishId);
    if (!dish || !dish.imageUrl) return;

    setIsEditing(true);
    try {
      const editedUrl = await editFoodImage(dish.imageUrl, editPrompt);
      setDishes(prev => prev.map(d => 
        d.id === editingDishId ? { ...d, imageUrl: editedUrl } : d
      ));
      setEditPrompt('');
    } catch (error: any) {
      console.error(error);
      // Reset key if requested entity was not found
      if (error?.message?.includes("Requested entity was not found")) {
        setApiKeySelected(false);
      }
      alert("Edit failed. Please try a different instruction.");
    } finally {
      setIsEditing(false);
    }
  };

  if (!apiKeySelected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-white p-6">
        <div className="max-w-md text-center space-y-6">
          <i className="fa-solid fa-camera-retro text-6xl text-amber-500"></i>
          <h1 className="text-4xl font-bold">Virtual Food Photographer</h1>
          <p className="text-stone-400">
            Professional image generation requires a Google Cloud API key from a paid project.
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 rounded-lg font-bold text-black transition-all transform hover:scale-105"
          >
            Select API Key to Begin
          </button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            className="block text-sm text-stone-500 hover:underline"
          >
            Learn about API billing & documentation
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-utensils text-amber-600 text-xl"></i>
            <span className="text-xl font-bold tracking-tight">FoodVision AI</span>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setApiKeySelected(false)} className="text-xs text-stone-400 hover:text-stone-600">
               Change Key
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Config */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-file-invoice text-stone-400"></i>
              Import Menu
            </h2>
            <textarea
              value={menuText}
              onChange={(e) => setMenuText(e.target.value)}
              placeholder="Paste your menu here... e.g. 'Truffle Burger: Wagyu beef with swiss cheese and black truffle aioli'"
              className="w-full h-40 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none"
            />
            <button
              onClick={handleParseMenu}
              disabled={isProcessingMenu || !menuText.trim()}
              className="w-full mt-4 py-3 bg-stone-900 text-white rounded-xl font-semibold hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isProcessingMenu ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
              Parse Dishes
            </button>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <i className="fa-solid fa-sliders text-stone-400"></i>
              Photography Style
            </h2>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-stone-600 mb-2 block">Visual Aesthetic</span>
                <div className="grid grid-cols-1 gap-2">
                  {(['Rustic/Dark', 'Bright/Modern', 'Social Media (Top-down)'] as PhotographyStyle[]).map(style => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`px-4 py-3 rounded-xl text-left border transition-all ${
                        selectedStyle === style 
                        ? 'border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500' 
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-600 mb-2 block">Resolution (High-End)</span>
                <div className="flex gap-2">
                  {(['1K', '2K', '4K'] as ImageSize[]).map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex-1 py-2 rounded-xl border transition-all ${
                        selectedSize === size 
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold ring-1 ring-amber-500' 
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Dish Gallery */}
        <div className="lg:col-span-8">
          {dishes.length === 0 ? (
            <div className="h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-3xl bg-white/50">
              <i className="fa-solid fa-plate-wheat text-6xl text-stone-200 mb-4"></i>
              <p className="text-stone-400 font-medium">No dishes parsed yet. Import your menu to start.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dishes.map(dish => (
                <div key={dish.id} className="bg-white rounded-3xl overflow-hidden shadow-md border border-stone-100 flex flex-col group">
                  <div className="relative aspect-square bg-stone-100 flex items-center justify-center overflow-hidden">
                    {dish.imageUrl ? (
                      <>
                        <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button 
                            onClick={() => setEditingDishId(dish.id)}
                            className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-all text-stone-700"
                            title="Edit with AI"
                          >
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                          </button>
                          <a 
                            href={dish.imageUrl} 
                            download={`${dish.name}.png`}
                            className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-all text-stone-700"
                            title="Download"
                          >
                            <i className="fa-solid fa-download"></i>
                          </a>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-8">
                        {dish.status === 'generating' ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-stone-500 italic">Capturing perfection...</p>
                          </div>
                        ) : dish.status === 'error' ? (
                          <div className="flex flex-col items-center gap-2 text-red-500">
                             <i className="fa-solid fa-circle-exclamation text-2xl"></i>
                             <p className="text-xs">{dish.error}</p>
                             <button onClick={() => handleGenerateImage(dish.id)} className="text-xs underline font-bold mt-2">Retry</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleGenerateImage(dish.id)}
                            className="p-4 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 transition-all transform hover:scale-110"
                          >
                            <i className="fa-solid fa-camera text-2xl"></i>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-stone-900 mb-1">{dish.name}</h3>
                    <p className="text-sm text-stone-500 mb-6 flex-1 line-clamp-2 italic">{dish.description}</p>
                    
                    {!dish.imageUrl && dish.status === 'idle' && (
                       <button 
                        onClick={() => handleGenerateImage(dish.id)}
                        className="w-full py-2 px-4 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
                      >
                        Generate High-End Photo
                      </button>
                    )}

                    {dish.imageUrl && (
                      <div className="text-xs text-stone-400 font-medium uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {selectedSize} • {selectedStyle}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingDishId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h3 className="text-2xl font-bold">Retouch with AI</h3>
              <button onClick={() => setEditingDishId(null)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="aspect-video w-full bg-stone-100 rounded-2xl overflow-hidden relative">
                <img 
                  src={dishes.find(d => d.id === editingDishId)?.imageUrl} 
                  className="w-full h-full object-contain" 
                  alt="Editing"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center gap-4">
                     <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
                     <span className="font-bold text-stone-700">Applying changes...</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-600">What would you like to change?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g. 'Add a retro film filter', 'Make it look steamier', 'Brighten the sauce'"
                    className="flex-1 p-4 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleEditImage()}
                  />
                  <button
                    onClick={handleEditImage}
                    disabled={isEditing || !editPrompt.trim()}
                    className="px-6 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-2xl disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-wand-sparkles"></i>
                    Apply
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Make it moodier', 'Add a vintage filter', 'Increase saturation', 'Add a bit more garnish'].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setEditPrompt(suggestion)}
                      className="text-xs px-3 py-1.5 bg-stone-100 text-stone-500 rounded-full hover:bg-stone-200 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="text-center py-8 text-stone-400 text-sm">
        <p>&copy; 2024 Virtual Food Photographer • Powered by Gemini 3 Pro</p>
      </footer>
    </div>
  );
};

export default App;
