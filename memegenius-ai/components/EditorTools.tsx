
import React, { useState } from 'react';
import { MemeState } from '../types';
import { geminiService } from '../services/geminiService';

interface EditorToolsProps {
  state: MemeState;
  setState: React.Dispatch<React.SetStateAction<MemeState>>;
  onMagicCaption: () => Promise<void>;
  onAnalyze: () => Promise<void>;
  isLoading: boolean;
}

const EditorTools: React.FC<EditorToolsProps> = ({ state, setState, onMagicCaption, onAnalyze, isLoading }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleEditImage = async () => {
    if (!state.image || !editPrompt) return;
    setIsEditing(true);
    try {
      const newImage = await geminiService.editImage(state.image, editPrompt);
      if (newImage) {
        setState(prev => ({ ...prev, image: newImage }));
        setEditPrompt('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
          <i className="fa-solid fa-font"></i> Text Editor
        </h3>
        
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Text</label>
          <input
            type="text"
            value={state.topText}
            onChange={(e) => setState(prev => ({ ...prev, topText: e.target.value }))}
            placeholder="SOMETHING FUNNY AT THE TOP"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bottom Text</label>
          <input
            type="text"
            value={state.bottomText}
            onChange={(e) => setState(prev => ({ ...prev, bottomText: e.target.value }))}
            placeholder="SOMETHING FUNNIER AT THE BOTTOM"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Font Size</label>
            <input
              type="range"
              min="10"
              max="100"
              value={state.fontSize}
              onChange={(e) => setState(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={state.textColor}
                onChange={(e) => setState(prev => ({ ...prev, textColor: e.target.value }))}
                className="w-10 h-10 bg-transparent border-none cursor-pointer"
              />
              <span className="text-xs flex items-center">{state.textColor}</span>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-700" />

      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-purple-400">
          <i className="fa-solid fa-wand-magic-sparkles"></i> AI Superpowers
        </h3>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onMagicCaption}
            disabled={isLoading || !state.image}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-bolt"></i>}
            Magic Caption
          </button>
          
          <button
            onClick={onAnalyze}
            disabled={isLoading || !state.image}
            className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-2 rounded-xl transition-all text-sm"
          >
            Analyze Image Context
          </button>
        </div>
      </div>

      <hr className="border-slate-700" />

      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
          <i className="fa-solid fa-paintbrush"></i> AI Image Edit
        </h3>
        <p className="text-xs text-slate-400">Transform your base image with text prompts (e.g., "Add a party hat")</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="What should I change?"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            onClick={handleEditImage}
            disabled={isEditing || !state.image || !editPrompt}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 p-2 rounded-lg transition-all"
          >
            {isEditing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorTools;
