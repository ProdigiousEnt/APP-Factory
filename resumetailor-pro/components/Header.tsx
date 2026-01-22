
import React from 'react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  usageDisplay?: string;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, usageDisplay }) => {
  return (
    <header className="sticky top-0 z-50 w-full ios-blur border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
        <div className="flex items-center w-1/4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-[#007AFF] flex items-center gap-1 font-medium text-lg active:opacity-50 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
        </div>
        <h1 className="text-center font-bold text-lg w-1/2 truncate">{title}</h1>
        <div className="w-1/4 flex justify-end">
          {usageDisplay && (
            <span className="text-xs text-gray-500 font-medium">{usageDisplay}</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
