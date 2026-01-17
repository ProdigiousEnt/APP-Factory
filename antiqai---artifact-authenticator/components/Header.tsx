
import React from 'react';

interface HeaderProps {
  onUpgradeClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onUpgradeClick }) => {
  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">AntiqueAI</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Expert Authenticator</p>
        </div>
        <button
          onClick={onUpgradeClick}
          className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full hover:bg-orange-600 transition-colors"
        >
          Upgrade to Pro
        </button>
      </div>
    </header>
  );
};
