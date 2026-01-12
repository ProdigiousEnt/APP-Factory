
import React, { useEffect, useState } from 'react';

const messages = [
  "Curating the pixels...",
  "Applying cinematic lighting...",
  "Injecting the vibes...",
  "Painting with light...",
  "Refining the details...",
  "Capturing the atmosphere...",
  "Almost there, stay groovy..."
];

export const LoadingOverlay: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-wand-magic-sparkles text-2xl text-purple-400 animate-pulse"></i>
        </div>
      </div>
      <h3 className="text-xl font-medium text-white mb-2">Generating your Vibe</h3>
      <p className="text-gray-400 animate-pulse">{messages[msgIndex]}</p>
    </div>
  );
};
