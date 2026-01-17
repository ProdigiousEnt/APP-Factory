
import React, { useState, useEffect } from 'react';

const messages = [
  "Examining texture and patina...",
  "Searching historical archives...",
  "Analyzing craftsmanship details...",
  "Checking for modern manufacturing marks...",
  "Cross-referencing similar artifacts...",
  "Consulting authentication guidelines..."
];

export const LoadingState: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing your discovery</h3>
      <p className="text-gray-500 animate-fade-in transition-all duration-500">
        {messages[msgIndex]}
      </p>
    </div>
  );
};
