
import React, { useState, useEffect, useCallback } from 'react';
import { getGrumpyRecommendations } from './services/geminiService';
import { Category, Recommendation, LocationData } from './types';
import RecommendationCard from './components/RecommendationCard';
import { Search, MapPin, Loader2, Info, Menu, X, Coffee, Filter, Compass } from 'lucide-react';

const App: React.FC = () => {
  const [location, setLocation] = useState('');
  const [locationData, setLocationData] = useState<LocationData>({});
  const [activeCategory, setActiveCategory] = useState<Category>(Category.FOOD);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    { id: Category.FOOD, label: 'Eats', icon: <Coffee className="w-4 h-4" /> },
    { id: Category.BEACHES, label: 'Solitude', icon: <Filter className="w-4 h-4" /> },
    { id: Category.SHOPPING, label: 'Goods', icon: <Search className="w-4 h-4" /> },
    { id: Category.HIDDEN_GEMS, label: 'Quiet', icon: <MapPin className="w-4 h-4" /> },
  ];

  const fetchRecommendations = useCallback(async (loc: string, cat: Category, lat?: number, lng?: number) => {
    if (!loc && !lat) return;
    setLoading(true);
    setError(null);
    try {
      const results = await getGrumpyRecommendations(loc || 'Current Location', cat, lat, lng);
      setRecommendations(results);
    } catch (err) {
      setError('Even the AI is too grumpy today. Try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      fetchRecommendations(location, activeCategory);
    }
  };

  const useCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocationData({ lat: latitude, lng: longitude });
        setLocation('My Current Spot');
        fetchRecommendations('My Current Spot', activeCategory, latitude, longitude);
      }, (err) => {
        setLoading(false);
        setError("Can't find you. Type it in yourself, lazy.");
      });
    } else {
      setError("Your browser is older than me. It doesn't support GPS.");
    }
  };

  useEffect(() => {
    if (location || locationData.lat) {
      fetchRecommendations(location, activeCategory, locationData.lat, locationData.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-slate-50 border-x border-slate-200 shadow-xl">
      {/* Header */}
      <header className="bg-slate-900 text-white p-6 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter flex items-center gap-2">
              Grumpy Old Tourist <span className="text-slate-500 text-sm">v1.0</span>
            </h1>
            <p className="text-slate-400 text-sm italic font-serif">"The hordes are coming. Go elsewhere."</p>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-slate-800 rounded-lg">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="mb-4 bg-slate-800 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
            <h4 className="font-bold mb-2 flex items-center gap-2"><Info size={16}/> The Manifesto</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tired of 45-minute waits for a 'viral' croissant? Sick of beaches that look like a mosh pit? 
              I find you the spots where you can actually hear your own thoughts. 
              No influencers allowed.
            </p>
          </div>
        )}

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Where are you stuck now?"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={useCurrentLocation}
            className="bg-slate-700 hover:bg-slate-600 p-3 rounded-lg transition-colors"
            title="Locate me"
          >
            <MapPin className="w-5 h-5" />
          </button>
        </form>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap font-semibold text-sm transition-all border-2 ${
                activeCategory === cat.id
                  ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-inner'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-amber-500" />
            <p className="font-serif italic animate-pulse">Checking my secret maps...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3">
            <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && recommendations.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-700 px-1 border-l-4 border-amber-500 ml-1">
              Solid Choices for {location || 'the area'}
            </h2>
            {recommendations.map((rec, idx) => (
              <RecommendationCard key={idx} rec={rec} />
            ))}
            <div className="text-center py-10 opacity-50 grayscale">
               <p className="text-sm italic">"Don't tell too many people, or it'll get crowded there too."</p>
            </div>
          </div>
        ) : !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center px-10">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <Compass className="w-16 h-16 opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-slate-600 mb-2">Nothing to see here... yet.</h3>
            <p className="text-sm">Enter a location above to see where the locals hide from the tourists.</p>
          </div>
        )}
      </main>

      {/* Persistent Call to Action / Footer */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-slate-200 p-4 flex justify-between items-center z-40">
        <div className="flex gap-4">
          <div className="text-xs text-slate-400">
            <p className="font-bold text-slate-600 uppercase tracking-widest text-[10px]">Current Status</p>
            <p>{location ? `Avoiding crowds in ${location}` : 'Awaiting orders'}</p>
          </div>
        </div>
        <button 
          onClick={handleSearch}
          disabled={!location || loading}
          className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-lg active:scale-95 text-sm uppercase tracking-wider"
        >
          Refresh Data
        </button>
      </footer>
    </div>
  );
};

export default App;
