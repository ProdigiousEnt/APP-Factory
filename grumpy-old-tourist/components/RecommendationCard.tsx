
import React from 'react';
import { Recommendation, Category } from '../types';
import { Utensils, Waves, ShoppingBag, Compass, Clock, MapPin, Star } from 'lucide-react';

interface Props {
  rec: Recommendation;
}

const RecommendationCard: React.FC<Props> = ({ rec }) => {
  const getIcon = () => {
    switch (rec.category) {
      case Category.FOOD: return <Utensils className="w-5 h-5 text-amber-600" />;
      case Category.BEACHES: return <Waves className="w-5 h-5 text-blue-600" />;
      case Category.SHOPPING: return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      default: return <Compass className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white border-b-4 border-slate-300 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-50 rounded-full">
            {getIcon()}
          </div>
          <h3 className="text-xl font-bold text-slate-800">{rec.name}</h3>
        </div>
        <div className="flex items-center bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">
          <span className="mr-1">GRUMPY:</span>
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={12} 
              className={i < rec.rating ? "fill-amber-500 text-amber-500" : "text-slate-300"} 
            />
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 text-sm text-slate-500 mb-4 italic">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{rec.address}</span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-slate-700 leading-relaxed font-medium">
            &ldquo;{rec.whyItsGood}&rdquo;
          </p>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
            <Clock className="w-4 h-4" />
            <span>Anti-Crowd Strategy</span>
          </div>
          <p className="text-sm text-amber-900 leading-snug">
            {rec.crowdAdvice}
          </p>
          <p className="text-xs mt-2 font-bold text-amber-700 uppercase tracking-tight">
            Best window: {rec.bestTime}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
