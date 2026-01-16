import React from 'react';
import { Wallpaper } from '../types';
import { convertInternalSrc } from '../services/persistenceService';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

interface WallpaperModalProps {
  wallpaper: Wallpaper;
  onClose: () => void;
  onRemix: (wallpaper: Wallpaper) => void;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({ wallpaper, onClose, onRemix }) => {
  const handleShare = async () => {
    if (Capacitor.getPlatform() === 'web') {
      // Fallback for web: traditional download
      const link = document.createElement('a');
      link.href = wallpaper.url;
      link.download = `vibepaper-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    try {
      // Native iOS share sheet (includes "Save to Photos" option)
      await Share.share({
        title: 'VibePaper Wallpaper',
        text: `Created with VibePaper: "${wallpaper.prompt}"`,
        url: wallpaper.url,
        dialogTitle: 'Save or Share Your Wallpaper'
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="absolute top-0 left-0 right-0 pt-[var(--sat)] px-4 pb-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        <span className="text-xs font-mono uppercase tracking-widest text-white/60">
          {wallpaper.config.imageSize} • {wallpaper.config.aspectRatio}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden bg-neutral-900">
        <img
          src={convertInternalSrc(wallpaper.url)}
          alt={wallpaper.prompt}
          className="max-h-full max-w-full object-contain shadow-2xl"
        />
      </div>

      <div className="p-6 pb-12 bg-gradient-to-t from-black via-black/90 to-transparent space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-400 italic">Prompt: "{wallpaper.prompt}"</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              onClose(); // Close modal immediately
              onRemix(wallpaper);
            }}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-2xl transition-all active:scale-95"
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Remix
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 rounded-2xl border border-white/20 transition-all active:scale-95"
          >
            <i className="fa-solid fa-arrow-up-from-bracket"></i>
            Save
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-2">
          Remix creates a new variation • Takes a few seconds
        </p>
      </div>
    </div>
  );
};
