
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">AntiqAI</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Expert Authenticator</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
    </header>
  );
};
