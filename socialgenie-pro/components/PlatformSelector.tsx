import React from 'react';
import { Platform } from '../types';
import { motion } from 'framer-motion';

interface PlatformSelectorProps {
    selectedPlatforms: Platform[];
    onToggle: (platform: Platform) => void;
}

const ALL_PLATFORMS: Platform[] = ['LinkedIn', 'Twitter/X', 'Instagram', 'Facebook', 'Pinterest', 'Threads'];

const PLATFORM_ICONS: Record<Platform, string> = {
    'LinkedIn': '💼',
    'Twitter/X': '🐦',
    'Instagram': '📸',
    'Facebook': '👥',
    'Pinterest': '📌',
    'Threads': '🧵',
};

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ selectedPlatforms, onToggle }) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                    Target Platforms
                </label>
                <span className="text-xs text-slate-400">
                    {selectedPlatforms.length}/3 selected
                </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {ALL_PLATFORMS.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform);

                    return (
                        <motion.button
                            key={platform}
                            onClick={() => onToggle(platform)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                p-3 rounded-xl border-2 transition-all text-sm font-medium
                ${isSelected
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
                                }
              `}
                        >
                            <div className="text-2xl mb-1">{PLATFORM_ICONS[platform]}</div>
                            <div className="text-xs">{platform}</div>
                        </motion.button>
                    );
                })}
            </div>

            <p className="text-[9px] text-slate-400 text-center mt-2">
                Tap to select/deselect • Max 3 platforms
            </p>
        </div>
    );
};
