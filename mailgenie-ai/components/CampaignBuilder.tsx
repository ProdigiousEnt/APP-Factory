
import React, { useState } from 'react';
import { generateCampaign } from '../services/geminiService';
import { EmailCampaign } from '../types';

interface CampaignBuilderProps {
  onCampaignGenerated: (campaign: EmailCampaign) => void;
}

const CampaignBuilder: React.FC<CampaignBuilderProps> = ({ onCampaignGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const campaign = await generateCampaign(prompt);
      onCampaignGenerated(campaign);
      setPrompt('');
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate campaign. Please check your prompt or API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <i className="fa-solid fa-wand-magic-sparkles text-blue-500"></i>
        New Campaign
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">What's your goal?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A summer sale for a specialty coffee shop, targeting loyal customers with 20% off..."
            className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !prompt}
          className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            loading 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/20'
          }`}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-circle-notch animate-spin"></i>
              Dreaming up your campaign...
            </>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane"></i>
              Generate Full Campaign
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CampaignBuilder;
